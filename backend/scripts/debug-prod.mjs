// Testa o endpoint /extract-recipe de PRODUÇÃO (Railway) com os links que
// falharam no app. Uso: node scripts/debug-prod.mjs
const BASE = 'https://app-nutri-lu-20-production.up.railway.app';

const URLS = [
  'https://vt.tiktok.com/ZSQDQe3af/',
  'https://www.youtube.com/watch?v=KtXcCHw7bj4',
];

for (const url of URLS) {
  console.log('\n========================================');
  console.log('Testando:', url);
  try {
    const res = await fetch(`${BASE}/extract-recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'url', data: url }),
    });
    console.log('status:', res.status);
    const body = await res.text();
    console.log('body:', body.slice(0, 900));
  } catch (err) {
    console.log('ERRO:', err.message);
  }
}
