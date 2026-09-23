// Materiais de MOCKUP na aba Materiais (pra mostrar ao time como fica a tela
// com vídeos e PDFs). Gera as capas (SVG) e 3 PDFs curtos na pasta pública do
// site (repo nutri-lu-membros → Pages serve em /membros/materiais/) e grava as
// linhas em `materials` com meta.demo = '1', pra apagar depois de uma vez:
//
//   node scripts/seed-materiais-demo.mjs            → cria arquivos + grava
//   node scripts/seed-materiais-demo.mjs --apagar   → só remove as linhas demo
//
// Roda contra o DATABASE_URL do .env (produção). Os arquivos só aparecem no
// site depois de commitar/pushar o repo do site.
import 'dotenv/config';
import pg from 'pg';
import { mkdirSync, writeFileSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import PDFDocument from 'pdfkit';

const apagar = process.argv.includes('--apagar');
const SITE = 'https://nutrilualves.com.br/membros/materiais';
const PASTA = join(homedir(), 'Desktop', 'Raphael', 'Claude', 'Testes', 'Nutri Lu Membros', 'web', 'public', 'materiais');

const thumb = (titulo, cor) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="${cor}"/><circle cx="560" cy="80" r="120" fill="#D6C28A" opacity="0.25"/><circle cx="90" cy="320" r="70" fill="#97AF8F" opacity="0.18"/><text x="40" y="56" font-family="Segoe UI, sans-serif" font-size="14" font-weight="700" letter-spacing="2" fill="#D6C28A">NUTRI LU · AULA</text><text x="40" y="300" font-family="Segoe UI, sans-serif" font-size="34" font-weight="700" fill="#F4F6F1">${titulo}</text></svg>`;

function pdf(arquivo, titulo, paginas, paragrafos) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 64, left: 56, right: 56, bottom: 64 }, info: { Title: titulo, Author: 'Nutri Lu' } });
    const out = createWriteStream(join(PASTA, arquivo)); doc.pipe(out);
    for (let p = 1; p <= paginas; p++) {
      if (p > 1) doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F6F1E7');
      doc.fillColor('#A9852F').font('Helvetica-Bold').fontSize(10).text('NUTRI LU · MATERIAL DE EXEMPLO', 56, 40, { characterSpacing: 2 });
      doc.fillColor('#12201A').font('Times-Roman').fontSize(p === 1 ? 30 : 20).text(p === 1 ? titulo : `${titulo} · ${p}`, 56, 70);
      doc.moveDown(0.8).fillColor('#33463B').font('Helvetica').fontSize(12);
      for (const t of paragrafos) doc.text(t, { width: doc.page.width - 112, lineGap: 4 }).moveDown(0.6);
      doc.fillColor('#6B7A6E').fontSize(9).text(`Conteúdo ilustrativo para demonstração da área de membros · página ${p} de ${paginas}`, 56, doc.page.height - 50);
    }
    doc.end(); out.on('finish', resolve); out.on('error', reject);
  });
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  const { rowCount } = await pool.query(`DELETE FROM materials WHERE meta->>'demo' = '1'`);
  console.log(`linhas demo removidas: ${rowCount}`);
  if (apagar) process.exit(0);

  mkdirSync(PASTA, { recursive: true });
  const videos = [
    ['Como montar o prato', '#12201A', 'v1', '11 min', true, 'É a base de tudo: proporção, não restrição.'],
    ['Comer fora sem sair do plano', '#55704E', 'v2', '8 min', false, null],
    ['Lanches de 5 minutos', '#7A4A55', 'v3', '6 min', false, null],
    ['Como ler um rótulo', '#3F5A6B', 'v4', '9 min', false, null],
  ];
  for (const [t, cor, arq] of videos) writeFileSync(join(PASTA, `${arq}.svg`), thumb(t, cor));
  const ex = [
    'Este é um material de exemplo, só pra mostrar como um PDF da Nutri Luciana aparece na área de membros: com título, número de páginas e o botão de baixar.',
    'Na versão real, cada guia vem com a orientação dela, tabelas e listas prontas pra imprimir ou abrir no celular na hora do mercado.',
    'Os materiais ficam disponíveis enquanto o acompanhamento estiver ativo e são atualizados quando ela publica uma versão nova.',
  ];
  const pdfs = [
    ['Guia de suplementos da Lu', 'guia-suplementos.pdf', 4],
    ['Lista de compras inteligente', 'lista-compras-inteligente.pdf', 3],
    ['Trocas equivalentes por grupo', 'trocas-equivalentes.pdf', 5],
  ];
  for (const [t, arq, n] of pdfs) await pdf(arq, t, n, ex);

  let sort = 1;
  for (const [title, , arq, duracao, destaque, porque] of videos) {
    const meta = { demo: '1', duracao, thumb: `${SITE}/${arq}.svg`, ...(destaque ? { destaque: true } : {}), ...(porque ? { porque } : {}) };
    await pool.query(`INSERT INTO materials (title, kind, url, meta, sort) VALUES ($1, 'video', $2, $3, $4)`, [title, 'https://www.youtube.com/', JSON.stringify(meta), sort++]);
  }
  for (const [title, arq, paginas] of pdfs) {
    await pool.query(`INSERT INTO materials (title, kind, url, meta, sort) VALUES ($1, 'pdf', $2, $3, $4)`, [title, `${SITE}/${arq}`, JSON.stringify({ demo: '1', paginas }), sort++]);
  }
  console.log(`✅ ${videos.length} vídeos + ${pdfs.length} PDFs gravados. Arquivos em ${PASTA} — commitar e pushar o repo do site.`);
} finally { await pool.end(); }
