// Testa estratégias de obter a descrição COMPLETA de um vídeo do YouTube
// server-side (sem API key): InnerTube (API interna dos apps oficiais).
// Uso: node scripts/debug-youtube.mjs

const VIDEO_ID = 'KtXcCHw7bj4'; // "Finalmente, Carbonara!" — Paola Carosella

console.log('=== InnerTube /player (client ANDROID) ===');
try {
  const res = await fetch('https://www.youtube.com/youtubei/v1/player', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 14) gzip',
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'ANDROID',
          clientVersion: '19.09.37',
          androidSdkVersion: 34,
          hl: 'pt',
          gl: 'BR',
        },
      },
      videoId: VIDEO_ID,
    }),
  });
  console.log('status:', res.status);
  const j = await res.json();
  const vd = j?.videoDetails;
  if (vd) {
    console.log('title:', vd.title);
    console.log('author:', vd.author);
    console.log('shortDescription (primeiros 500):');
    console.log(JSON.stringify((vd.shortDescription || '').slice(0, 500)));
  } else {
    console.log('videoDetails AUSENTE. playabilityStatus:', JSON.stringify(j?.playabilityStatus)?.slice(0, 300));
  }
} catch (err) {
  console.log('ERRO:', err.message);
}

console.log('\n=== InnerTube /player (client WEB) ===');
try {
  const res = await fetch('https://www.youtube.com/youtubei/v1/player', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: { client: { clientName: 'WEB', clientVersion: '2.20240101.00.00', hl: 'pt', gl: 'BR' } },
      videoId: VIDEO_ID,
    }),
  });
  console.log('status:', res.status);
  const j = await res.json();
  const vd = j?.videoDetails;
  if (vd) {
    console.log('title:', vd.title);
    console.log('shortDescription (primeiros 300):');
    console.log(JSON.stringify((vd.shortDescription || '').slice(0, 300)));
  } else {
    console.log('videoDetails AUSENTE. playabilityStatus:', JSON.stringify(j?.playabilityStatus)?.slice(0, 300));
  }
} catch (err) {
  console.log('ERRO:', err.message);
}
