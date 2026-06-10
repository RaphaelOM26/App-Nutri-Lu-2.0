// Rota TEMPORÁRIA de diagnóstico: testa estratégias de extração de descrição
// do YouTube DO PONTO DE VISTA DO SERVIDOR (Railway tem IP de datacenter que
// o YouTube trata diferente de IP residencial). Remover após resolver o
// issue de importação de receita do YouTube (beta 2026-06).
//
// GET /debug-youtube?id=<videoId>

import { Router } from 'express';

const router = Router();

const CLIENTS = [
  { name: 'WEB', body: { clientName: 'WEB', clientVersion: '2.20240101.00.00', hl: 'pt', gl: 'BR' } },
  { name: 'MWEB', body: { clientName: 'MWEB', clientVersion: '2.20240101.00.00', hl: 'pt', gl: 'BR' } },
  {
    name: 'ANDROID',
    body: { clientName: 'ANDROID', clientVersion: '19.09.37', androidSdkVersion: 34, hl: 'pt', gl: 'BR' },
    headers: { 'User-Agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 14) gzip' },
  },
  {
    name: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER',
    body: { clientName: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER', clientVersion: '2.0', hl: 'pt', gl: 'BR' },
  },
  { name: 'WEB_EMBEDDED_PLAYER', body: { clientName: 'WEB_EMBEDDED_PLAYER', clientVersion: '1.20240101.00.00', hl: 'pt', gl: 'BR' } },
];

router.get('/', async (req, res) => {
  const videoId = String(req.query.id || 'KtXcCHw7bj4');
  const results = [];

  for (const client of CLIENTS) {
    const r = { client: client.name };
    try {
      const resp = await fetch('https://www.youtube.com/youtubei/v1/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(client.headers || {}) },
        body: JSON.stringify({ context: { client: client.body }, videoId }),
        signal: AbortSignal.timeout(10000),
      });
      r.status = resp.status;
      if (resp.ok) {
        const j = await resp.json();
        r.playability = j?.playabilityStatus?.status || null;
        r.playabilityReason = j?.playabilityStatus?.reason || null;
        r.hasVideoDetails = !!j?.videoDetails;
        r.hasDescription = !!j?.videoDetails?.shortDescription;
        r.title = j?.videoDetails?.title || null;
        r.descriptionPreview = (j?.videoDetails?.shortDescription || '').slice(0, 120) || null;
      } else {
        r.bodyPreview = (await resp.text()).slice(0, 200);
      }
    } catch (err) {
      r.error = err.message;
    }
    results.push(r);
  }

  // Bonus: o que o fetch de HTML da watch page devolve daqui
  try {
    const resp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    results.push({
      client: 'HTML_WATCH_PAGE',
      status: resp.status,
      effectiveUrl: resp.url,
      htmlLength: html.length,
      hasOgDescription: /property=["']og:description["']/i.test(html),
      hasShortDescription: html.includes('"shortDescription":"'),
      hasConsentWall: /consent\.(youtube|google)\.com/i.test(html),
    });
  } catch (err) {
    results.push({ client: 'HTML_WATCH_PAGE', error: err.message });
  }

  res.json({ videoId, results });
});

export default router;
