// Diagnóstico: o que o servidor enxerga ao buscar URLs de TikTok/YouTube?
// Simula o fetch do extractRecipe.js (mesmos headers) e reporta o que
// conseguimos extrair de cada página. Uso: node scripts/debug-extract.mjs

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

const URLS = [
  'https://vt.tiktok.com/ZSQDQe3af/',
  'https://www.youtube.com/watch?v=KtXcCHw7bj4',
];

function meta(html, name) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    'i',
  );
  const m = html.match(re);
  if (m) return m[1];
  // ordem invertida (content antes de property)
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`,
    'i',
  );
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

for (const url of URLS) {
  console.log('\n========================================');
  console.log('URL:', url);
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: 'follow' });
    const html = await res.text();
    console.log('status:', res.status);
    console.log('effectiveUrl:', res.url);
    console.log('html length:', html.length);
    console.log('og:title:', JSON.stringify(meta(html, 'og:title')));
    const ogDesc = meta(html, 'og:description');
    console.log('og:description:', JSON.stringify(ogDesc ? ogDesc.slice(0, 300) : null));
    console.log('twitter:description:', JSON.stringify((meta(html, 'twitter:description') || '').slice(0, 200) || null));
    console.log('meta description:', JSON.stringify((meta(html, 'description') || '').slice(0, 200) || null));
    // YouTube embute a descrição COMPLETA no JSON ytInitialPlayerResponse
    const sdIdx = html.indexOf('"shortDescription":"');
    if (sdIdx >= 0) {
      console.log('ytInitialPlayerResponse shortDescription: PRESENTE (idx', sdIdx + ')');
      console.log('  amostra:', JSON.stringify(html.slice(sdIdx + 20, sdIdx + 320)));
    } else {
      console.log('ytInitialPlayerResponse shortDescription: AUSENTE');
    }
    // sinais de bot-wall
    const lower = html.slice(0, 4000).toLowerCase();
    if (lower.includes('captcha') || lower.includes('verify') || lower.includes('robot')) {
      console.log('⚠️  possível bot-wall no início do HTML');
    }
  } catch (err) {
    console.log('ERRO no fetch:', err.message);
  }
}

// TikTok oEmbed — API pública oficial que devolve a caption do vídeo
console.log('\n========================================');
console.log('TESTE: TikTok oEmbed com o link encurtado');
try {
  const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(URLS[0])}`;
  const res = await fetch(oembedUrl, { headers: HEADERS });
  console.log('status:', res.status);
  const body = await res.text();
  console.log('body:', body.slice(0, 600));
} catch (err) {
  console.log('ERRO:', err.message);
}

// YouTube oEmbed — título + autor (sem descrição, mas valida o vídeo)
console.log('\n========================================');
console.log('TESTE: YouTube oEmbed');
try {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(URLS[1])}&format=json`;
  const res = await fetch(oembedUrl, { headers: HEADERS });
  console.log('status:', res.status);
  const body = await res.text();
  console.log('body:', body.slice(0, 400));
} catch (err) {
  console.log('ERRO:', err.message);
}
