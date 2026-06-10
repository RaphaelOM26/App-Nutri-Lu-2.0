// POST /extract-recipe
// Body: { source: 'image' | 'url' | 'video', data: string }
//   - 'image' → data é base64 (com ou sem prefixo data:image/...)
//   - 'url'   → data é uma URL pública (Instagram, blog, etc.) — extrai do HTML/caption
//   - 'video' → 501 Not Implemented (em breve no MVP)
//
// Resposta: { title, ingredients[], steps[], time, servings, confidence }

import { Router } from 'express';
import { openai, MODEL, RECIPE_SCHEMA, RECIPE_SYSTEM_PROMPT } from '../services/openai.js';
import { reconcileServings, estimateTotalKcal, sanitizeRecipe } from '../utils/recipeSanity.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { source, data } = req.body || {};

    if (!source || !data) {
      return res.status(400).json({
        error: 'Body deve conter { source, data }.',
        code: 'BAD_REQUEST',
      });
    }

    if (source === 'video') {
      return res.status(501).json({
        error: 'Extração de receita por vídeo ainda não está disponível.',
        code: 'NOT_IMPLEMENTED',
        hint: 'Tente colar o link do vídeo (Instagram/TikTok/YouTube) — vamos extrair da descrição.',
      });
    }

    let recipe;
    if (source === 'image') {
      recipe = await extractFromImage(data);
    } else if (source === 'url') {
      recipe = await extractFromUrl(data);
    } else {
      return res.status(400).json({
        error: `source inválido: "${source}". Use "image", "url" ou "video".`,
        code: 'BAD_REQUEST',
      });
    }

    // Sanitização de texto: strippa caracteres exóticos (árabe/hebraico/CJK)
    // que a IA esporadicamente injeta (ex: "tempero italiano" virou
    // "tempero الإيطaliano" em um caso real). Whitelist explícito de
    // caracteres latinos + acentos PT-BR + pontuação.
    recipe = sanitizeRecipe(recipe);

    // Sanity check determinístico: se a IA mentiu nas porções (caso clássico:
    // servings=1 numa receita que serve 4), recalcula baseado nas kcal totais
    // estimadas dos ingredientes. Log pra auditar a frequência do override.
    const originalServings = recipe.servings;
    recipe.servings = reconcileServings(recipe.servings, recipe.ingredients);
    if (recipe.servings !== originalServings) {
      const total = estimateTotalKcal(recipe.ingredients);
      console.log(
        `[sanity] servings override: ${originalServings} → ${recipe.servings} (total estimado: ${total} kcal, título: "${recipe.title}")`,
      );
    }

    res.json(recipe);
  } catch (err) {
    next(err);
  }
});

// ─── Extração via imagem (foto de receita) ───────────────────────
async function extractFromImage(base64) {
  // Aceita base64 puro ou com prefixo data:image/...
  const dataUrl = base64.startsWith('data:')
    ? base64
    : `data:image/jpeg;base64,${base64}`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: RECIPE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extraia a receita desta imagem e retorne o JSON estruturado.',
          },
          {
            type: 'image_url',
            image_url: { url: dataUrl },
          },
        ],
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: RECIPE_SCHEMA,
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw Object.assign(new Error('Resposta vazia da IA.'), {
      status: 502,
      code: 'AI_EMPTY_RESPONSE',
    });
  }
  return JSON.parse(content);
}

// ─── Extração via URL (link de receita) ───────────────────────────

/**
 * Decodifica entidades HTML básicas (&amp; &lt; &gt; &quot; &#39; &nbsp; etc.)
 * Usado pra limpar valores de meta tags antes de mandar pro modelo.
 */
function decodeHtmlEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x?([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, code.match(/^x/i) ? 16 : 10) || 32),
    );
}

/**
 * Captura meta tags og:/twitter: + JSON-LD + <title>. É AQUI que Instagram,
 * TikTok e YouTube colocam a caption/descrição do post — o strip agressivo
 * antigo descartava esse conteúdo. Sem isso, posts de receita das redes não
 * conseguiam ser extraídos.
 */
function extractMetaInfo(html) {
  const meta = {};
  // og:* e twitter:* e name="description"
  const metaRegex = /<meta\s+[^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?content\s*=\s*["']([^"']*)["'][^>]*?>/gi;
  let m;
  while ((m = metaRegex.exec(html)) !== null) {
    const key = m[1].toLowerCase();
    const val = decodeHtmlEntities(m[2]);
    if (!val) continue;
    // Também aceita ordem invertida (content="" antes de property)
    if (
      key.startsWith('og:') ||
      key.startsWith('twitter:') ||
      key === 'description' ||
      key === 'keywords'
    ) {
      meta[key] = val;
    }
  }
  // <meta content="..." property="..."> (ordem invertida)
  const altRegex = /<meta\s+[^>]*?content\s*=\s*["']([^"']*)["'][^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?>/gi;
  while ((m = altRegex.exec(html)) !== null) {
    const key = m[2].toLowerCase();
    const val = decodeHtmlEntities(m[1]);
    if (!val) continue;
    if (key.startsWith('og:') || key.startsWith('twitter:') || key === 'description') {
      if (!meta[key]) meta[key] = val;
    }
  }

  // <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) meta.pageTitle = decodeHtmlEntities(titleMatch[1]).trim();

  // JSON-LD: schema.org Recipe, mas também sites usam pra description geral
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const jsonLdSnippets = [];
  for (const j of jsonLdMatches) {
    try {
      const obj = JSON.parse(j[1].trim());
      // Pega só campos textuais relevantes pra não inflar contexto
      const flat = JSON.stringify(obj).slice(0, 8000);
      jsonLdSnippets.push(flat);
    } catch {
      // ignora se não parsa
    }
  }
  meta.jsonLd = jsonLdSnippets;
  return meta;
}

// ─── Extractors dedicados por plataforma ─────────────────────────
// TikTok e YouTube NÃO entregam a caption/descrição via HTML pra servidores:
// TikTok serve shell JS sem meta tags; YouTube bloqueia/empobrece o HTML pra
// IPs de datacenter (Railway). Caso real 2026-06-10: ambos retornavam
// confidence 'low' em produção enquanto funcionavam de IP residencial.
// Solução: APIs públicas oficiais, feitas pra consumo server-side.

function isTikTokUrl(u) {
  return /^https?:\/\/([a-z0-9-]+\.)?tiktok\.com\//i.test(String(u));
}

function youtubeVideoId(u) {
  const m = String(u).match(
    /(?:youtube\.com\/watch\?[^#\s]*\bv=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/i,
  );
  return m ? m[1] : null;
}

/**
 * Caption do TikTok via oEmbed (API pública oficial). Aceita inclusive os
 * links encurtados (vt./vm.tiktok.com) — a API resolve sozinha.
 * No TikTok a receita vive na caption, então isso costuma bastar.
 */
async function fetchTikTokCaption(url) {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn('[extract-recipe] TikTok oEmbed status', res.status);
      return null;
    }
    const j = await res.json();
    if (!j?.title) return null;
    return { title: null, author: j.author_name || null, text: j.title };
  } catch (err) {
    console.warn('[extract-recipe] TikTok oEmbed falhou:', err.message);
    return null;
  }
}

/**
 * Descrição COMPLETA do vídeo do YouTube via InnerTube (API interna que os
 * próprios clientes oficiais usam — sem API key, client WEB). A descrição é
 * onde criadores de culinária publicam a lista de ingredientes.
 */
async function fetchYouTubeInfo(videoId) {
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: { client: { clientName: 'WEB', clientVersion: '2.20240101.00.00', hl: 'pt', gl: 'BR' } },
        videoId,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn('[extract-recipe] YouTube InnerTube status', res.status);
      return null;
    }
    const j = await res.json();
    const vd = j?.videoDetails;
    if (!vd?.shortDescription) return null;
    return { title: vd.title || null, author: vd.author || null, text: vd.shortDescription };
  } catch (err) {
    console.warn('[extract-recipe] YouTube InnerTube falhou:', err.message);
    return null;
  }
}

/** Detecta a rede/plataforma a partir da URL pra dar contexto ao modelo. */
function detectPlatform(url) {
  const u = url.toLowerCase();
  if (/instagram\.com\/(reel|p|tv)\//.test(u)) return 'Instagram (post/reel) — a receita geralmente está na caption do post';
  // TikTok: domínio canônico + encurtadores oficiais (vt./vm./vr.tiktok.com).
  // Mesmo seguindo redirect no fetch, mantemos o fallback aqui pra robustez —
  // se a URL chegar antes do redirect ser seguido, ainda detectamos.
  if (
    /tiktok\.com\/@[^/]+\/(video|photo)\//.test(u) ||
    /^https?:\/\/(vt|vm|vr)\.tiktok\.com\//.test(u)
  ) {
    return 'TikTok — a receita geralmente está na descrição do vídeo';
  }
  if (/(youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts\/)/.test(u)) return 'YouTube — a receita pode estar na descrição do vídeo ou nos comentários fixados';
  if (/facebook\.com\//.test(u)) return 'Facebook';
  if (/pinterest\./.test(u)) return 'Pinterest';
  return null;
}

async function extractFromUrl(url) {
  // TikTok/YouTube têm extractor dedicado via API oficial — pra eles o HTML
  // é só sinal complementar e o fetch dele NÃO é fatal. Pra blogs/Instagram
  // o HTML continua sendo a única fonte (fetch fatal como antes).
  const hasDedicatedExtractor = isTikTokUrl(url) || !!youtubeVideoId(url);
  let html = '';
  // URL efetiva após seguir redirects (ex: vt.tiktok.com/XYZ → tiktok.com/@user/video/123).
  // Usada na detecção de plataforma e no prompt — sem isso, encurtadores ficam
  // sem contexto e a IA não sabe que é TikTok/Instagram.
  let effectiveUrl = url;
  try {
    const response = await fetch(url, {
      headers: {
        // User-Agent mobile real ajuda redes sociais a servirem caption pública
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      throw Object.assign(
        new Error(`Falha ao acessar URL (status ${response.status}).`),
        { status: 422, code: 'URL_FETCH_FAILED' }
      );
    }
    effectiveUrl = response.url || url;
    html = await response.text();
  } catch (err) {
    if (!hasDedicatedExtractor) {
      if (err.code === 'URL_FETCH_FAILED') throw err;
      throw Object.assign(
        new Error('Não foi possível acessar essa URL.'),
        { status: 422, code: 'URL_FETCH_FAILED' }
      );
    }
    console.warn('[extract-recipe] HTML fetch falhou, seguindo via API da plataforma:', err.message);
  }
  if (effectiveUrl !== url) {
    console.log('[extract-recipe] redirect:', url, '→', effectiveUrl);
  }

  // Extractor dedicado: caption/descrição direto da API da plataforma.
  // É o sinal mais confiável — o HTML dessas redes é vazio/bloqueado server-side.
  let social = null;
  if (isTikTokUrl(url) || isTikTokUrl(effectiveUrl)) {
    social = await fetchTikTokCaption(url);
    if (social) console.log('[extract-recipe] caption via TikTok oEmbed ok');
  } else {
    const vid = youtubeVideoId(effectiveUrl) || youtubeVideoId(url);
    if (vid) {
      social = await fetchYouTubeInfo(vid);
      if (social) console.log('[extract-recipe] descrição via YouTube InnerTube ok');
    }
  }

  // 1) Extrai meta tags + JSON-LD ANTES de strippar (aqui mora a caption do post)
  const meta = extractMetaInfo(html);

  // 2) Strip do resto do HTML pra capturar texto residual (artigos de blog,
  //    comentários, etc.). Mantemos limite mais agressivo aqui porque o sinal
  //    mais forte vem das meta tags.
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 30000);

  // 3) Monta payload estruturado pro modelo. Usa a URL pós-redirect — é ela
  // que carrega o domínio canônico (@user/video) que detectPlatform reconhece.
  const platform = detectPlatform(effectiveUrl);
  const parts = [];
  parts.push(`URL: ${effectiveUrl}`);
  if (platform) parts.push(`Plataforma: ${platform}`);
  if (social) {
    if (social.title) parts.push(`Título do vídeo: ${social.title}`);
    if (social.author) parts.push(`Autor do vídeo: ${social.author}`);
    parts.push(`Caption/descrição oficial do vídeo (via API da plataforma — fonte mais confiável):\n${social.text}`);
  }
  if (meta.pageTitle) parts.push(`Título da página: ${meta.pageTitle}`);
  if (meta['og:title']) parts.push(`og:title: ${meta['og:title']}`);
  if (meta['og:description']) parts.push(`og:description (caption do post):\n${meta['og:description']}`);
  if (meta['twitter:description'] && meta['twitter:description'] !== meta['og:description']) {
    parts.push(`twitter:description:\n${meta['twitter:description']}`);
  }
  if (meta.description && meta.description !== meta['og:description']) {
    parts.push(`meta description:\n${meta.description}`);
  }
  if (meta.jsonLd?.length) {
    parts.push(`JSON-LD (schema.org):\n${meta.jsonLd.join('\n---\n')}`);
  }
  if (bodyText && bodyText.length > 100) {
    parts.push(`Texto da página:\n${bodyText}`);
  }

  const userPrompt = [
    'Extraia a receita do conteúdo abaixo. A página pode ser de uma rede social (Instagram, TikTok, YouTube) — nesses casos a receita está geralmente na CAPTION/descrição do post. Se houver a seção "Caption/descrição oficial do vídeo", ela veio da API da plataforma e é a fonte MAIS confiável — priorize-a. Se for blog, a receita está no corpo do texto.',
    'Se identificar ingredientes e modo de preparo, retorne com confidence "high" ou "medium". Se NÃO conseguir identificar nenhuma receita real, retorne ingredients e steps como arrays vazios e confidence "low".',
    '',
    parts.join('\n\n'),
  ].join('\n');

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: RECIPE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: RECIPE_SCHEMA,
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw Object.assign(new Error('Resposta vazia da IA.'), {
      status: 502,
      code: 'AI_EMPTY_RESPONSE',
    });
  }
  return JSON.parse(content);
}

export default router;
