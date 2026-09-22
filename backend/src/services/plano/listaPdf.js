// A lista de compras como PDF: a mesma folha da área de membros (/lista),
// desenhada no servidor com pdfkit pra Luna anexar no WhatsApp e pra web
// oferecer "Baixar PDF". Lê o objeto de dadosDaLista() (listaCompras.js) —
// fonte única. Desenho aprovado pelo Raphael em 22/09/2026: papel cream com a
// marca, seções em 3 colunas, unidade de compra + peso, despensa à parte,
// anotações, rodapé.
//
// Fontes: as da marca (DM Serif Display, Plus Jakarta Sans, Nunito Sans — as
// mesmas do site), embarcadas via pacotes @fontsource (licença OFL); o pdfkit
// lê WOFF e embute só os glifos usados. Se um arquivo faltar, cai nas 14
// padrão do PDF (Times/Helvetica) sem quebrar. Custo: ~100 ms e ~60 KB por
// lista; 10 mil pacientes × 1 por semana é desprezível.

import PDFDocument from 'pdfkit';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const arquivoDaFonte = (pacote, arquivo) => { try { return require.resolve(`@fontsource/${pacote}/files/${arquivo}`); } catch { return null; } };
const FONTES = {
  serif: [arquivoDaFonte('dm-serif-display', 'dm-serif-display-latin-400-normal.woff'), 'Times-Roman'],
  sans: [arquivoDaFonte('nunito-sans', 'nunito-sans-latin-400-normal.woff'), 'Helvetica'],
  ital: [arquivoDaFonte('nunito-sans', 'nunito-sans-latin-400-italic.woff'), 'Helvetica-Oblique'],
  ui: [arquivoDaFonte('plus-jakarta-sans', 'plus-jakarta-sans-latin-700-normal.woff'), 'Helvetica-Bold'],
};
/** Nomes de fonte válidos no documento atual (registrados em gerarPdfLista). */
const F = { serif: 'Times-Roman', sans: 'Helvetica', ital: 'Helvetica-Oblique', ui: 'Helvetica-Bold' };
function registrarFontes(doc) {
  for (const [chave, [arquivo, padrao]] of Object.entries(FONTES)) {
    F[chave] = padrao;
    if (!arquivo) continue;
    try { doc.registerFont(`marca-${chave}`, arquivo); F[chave] = `marca-${chave}`; } catch (e) { console.warn(`[lista-pdf] fonte ${chave} não carregou (${e.message}); usando ${padrao}`); }
  }
}

const C = { paper: '#F6F1E7', ink: '#12201A', ink2: '#33463B', muted: '#6B7A6E', line: '#C4BBA5', sage: '#7C9A7E', gold2: '#A9852F' };
const A4 = { w: 595.28, h: 841.89 };
const X0 = 48, CW = A4.w - 2 * 48;          // área útil (dentro da borda)
const Y_FIM = A4.h - 52;                    // limite de baixo do conteúdo
const GAP = 10, COLS = 3, COL_W = (CW - GAP * (COLS - 1)) / COLS;
const CAB_H = 18, PAD = 8, LINHA = 14;      // caixa: cabeçalho, respiro, altura da linha
const DIAS = ['', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MESES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const somar = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
/** "21 a 27 de setembro" ou "28 de set. a 4 de out." */
export function faixaSemana(ws) {
  const a = ws.slice(8, 10).replace(/^0/, ''), fim = somar(ws, 6), b = fim.slice(8, 10).replace(/^0/, '');
  const ma = Number(ws.slice(5, 7)) - 1, mb = Number(fim.slice(5, 7)) - 1;
  return ma === mb ? `${a} a ${b} de ${MESES[ma]}` : `${a} de ${MESES_CURTO[ma]}. a ${b} de ${MESES_CURTO[mb]}.`;
}
/** Nome do arquivo (ASCII, o WhatsApp mostra como está). */
export const nomeDoArquivo = (ws) => `Lista de compras - ${faixaSemana(ws).replace(/[^\w .-]/g, '')}.pdf`;

/** Gera o PDF e devolve o Buffer. */
export function gerarPdfLista(dados) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Title: `Lista de compras · ${faixaSemana(dados.week_start)}`, Author: 'Nutri Lu' } });
    const partes = [];
    doc.on('data', (c) => partes.push(c));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);
    try { registrarFontes(doc); desenhar(doc, dados); doc.end(); } catch (e) { reject(e); }
  });
}

// ─── primitivas ───────────────────────────────────────────────────────────

function fundo(doc) {
  doc.rect(0, 0, A4.w, A4.h).fill(C.paper);
  doc.lineWidth(0.6).strokeColor(C.line).rect(28, 28, A4.w - 56, A4.h - 56).stroke();
  const m = 8; doc.lineWidth(1).strokeColor(C.gold2);
  for (const [x, y, sx, sy] of [[24, 24, 1, 1], [A4.w - 24, 24, -1, 1], [24, A4.h - 24, 1, -1], [A4.w - 24, A4.h - 24, -1, -1]]) {
    doc.moveTo(x, y + sy * m).lineTo(x, y).lineTo(x + sx * m, y).stroke();
  }
}
const texto = (doc, s, x, y, o = {}) => { doc.font(o.font || F.sans).fontSize(o.size || 9).fillColor(o.cor || C.ink); doc.text(String(s), x, y, { lineBreak: false, ...o.opts }); };
const largura = (doc, s, font, size, cs = 0) => { doc.font(font).fontSize(size); return doc.widthOfString(String(s), { characterSpacing: cs }); };
const alturaParagrafo = (doc, s, font, size, w) => { doc.font(font).fontSize(size); return doc.heightOfString(String(s), { width: w }); };
function pontilhado(doc, x, y, w) { doc.save().dash(1, { space: 2 }).lineWidth(0.5).strokeColor(C.line).moveTo(x, y).lineTo(x + w, y).stroke().restore(); }
function tituloCentrado(doc, s, y, o) { doc.font(o.font).fontSize(o.size).fillColor(o.cor); doc.text(s, X0, y, { width: CW, align: 'center', characterSpacing: o.cs || 0, lineBreak: false }); }

// ─── cabeçalho da folha ───────────────────────────────────────────────────

function masthead(doc, dados) {
  let y = 50;
  doc.font(F.serif).fontSize(26);
  const a = 'Nutri ', b = 'Lu', wa = doc.widthOfString(a), wb = doc.widthOfString(b), x = (A4.w - wa - wb) / 2;
  doc.fillColor(C.ink).text(a, x, y, { lineBreak: false }); doc.fillColor(C.gold2).text(b, x + wa, y, { lineBreak: false });
  y += 30; tituloCentrado(doc, 'PLANO DA NUTRI LUCIANA', y, { font: F.sans, size: 7.5, cor: C.muted, cs: 2.2 });
  y += 16; tituloCentrado(doc, 'Lista de Compras', y, { font: F.serif, size: 32, cor: C.ink });
  y += 42;
  const semana = dados.week_index && dados.week_total > 1 ? `  ·  SEMANA ${dados.week_index} DE ${dados.week_total}` : '';
  tituloCentrado(doc, `•   SEMANA DE ${faixaSemana(dados.week_start).toUpperCase()}${semana}   •`, y, { font: F.ui, size: 8, cor: C.ink2, cs: 2 });
  return y + 22;
}

function intro(doc, dados, y) {
  const esqW = CW * 0.44, dirW = CW - esqW, p = 14;
  // mede
  const nota = 'Unidade é o que você compra; o peso é o que as receitas usam na semana. "~" é média por unidade — confere o que já tem em casa.';
  const hNota = alturaParagrafo(doc, nota, F.ital, 8.5, esqW - 2 * p);
  const hEsq = 44 + (dados.nome ? 24 : 0) + 14 + hNota + 2 * p;
  const linhas = (dados.cardapio || []).map((d) => ({ dia: DIAS[d.weekday] || '', txt: d.refeicoes.join(' · ') }));
  const txtW = dirW - 2 * p - 30;
  const hLinhas = linhas.map((l) => Math.max(11, alturaParagrafo(doc, l.txt, F.sans, 8.2, txtW)) + 6);
  const hDir = 22 + hLinhas.reduce((a, b) => a + b, 0) + 2 * p;
  const h = Math.max(hEsq, hDir);
  // moldura
  doc.lineWidth(0.6).strokeColor(C.line).roundedRect(X0, y, CW, h, 4).stroke();
  doc.moveTo(X0 + esqW, y).lineTo(X0 + esqW, y + h).stroke();
  // esquerda: carrinho, nome, meta, nota
  let ye = y + (h - (hEsq - 2 * p)) / 2;
  const cx = X0 + esqW / 2;
  doc.save().lineWidth(1.2).strokeColor(C.ink).lineJoin('round').lineCap('round')
    .moveTo(cx - 13, ye + 4).lineTo(cx - 10, ye + 4).lineTo(cx - 6.5, ye + 20).lineTo(cx + 8, ye + 20).lineTo(cx + 11, ye + 9).lineTo(cx - 8.5, ye + 9).stroke()
    .circle(cx - 4, ye + 25, 1.5).stroke().circle(cx + 6.5, ye + 25, 1.5).stroke().restore();
  ye += 34;
  if (dados.nome) { doc.font(F.serif).fontSize(17).fillColor(C.ink).text(dados.nome, X0 + p, ye, { width: esqW - 2 * p, align: 'center', lineBreak: false }); ye += 24; }
  doc.font(F.sans).fontSize(8.5).fillColor(C.muted).text('Lista montada pela Luna a partir do seu plano', X0 + p, ye, { width: esqW - 2 * p, align: 'center', lineBreak: false }); ye += 14;
  doc.font(F.ital).fontSize(8.5).fillColor(C.ink2).text(nota, X0 + p, ye, { width: esqW - 2 * p, align: 'center' });
  // direita: plano da semana
  let yd = y + p;
  doc.font(F.ui).fontSize(8).fillColor(C.ink2).text('PLANO DA SEMANA', X0 + esqW + p, yd, { width: dirW - 2 * p, align: 'center', characterSpacing: 2, lineBreak: false });
  doc.font(F.sans).fontSize(6).fillColor(C.gold2).text('•', X0 + esqW + p, yd + 11, { width: dirW - 2 * p, align: 'center', lineBreak: false });
  yd += 22;
  linhas.forEach((l, i) => {
    doc.font(F.ui).fontSize(7.5).fillColor(C.ink2).text(l.dia.toUpperCase(), X0 + esqW + p, yd + 1, { characterSpacing: 1, lineBreak: false });
    doc.font(F.sans).fontSize(8.2).fillColor(C.ink).text(l.txt, X0 + esqW + p + 30, yd, { width: txtW });
    yd += hLinhas[i];
    if (i < linhas.length - 1) pontilhado(doc, X0 + esqW + p, yd - 3, dirW - 2 * p);
  });
  return y + h;
}

// ─── caixas de seção ──────────────────────────────────────────────────────

/** Mede uma linha de item: quantidade ao lado do nome, ou embaixo se não couber. */
function medirItem(doc, i, w, despensa) {
  const util = w - 2 * PAD - 13;
  const nomeW = largura(doc, i.nome, F.sans, 8.5);
  const qtd = qtdDe(i, despensa);
  const qtdW = largura(doc, qtd.a, F.ui, 8) + (qtd.b ? largura(doc, qtd.b, F.sans, 7.5) : 0);
  const nomeLinhas = Math.max(1, Math.ceil(nomeW / util));
  const juntos = nomeLinhas === 1 && nomeW + 8 + qtdW <= util;
  return { h: LINHA * nomeLinhas + (juntos || !qtdW ? 0 : 11), juntos, qtd, qtdW, util };
}
const qtdDe = (i, despensa) => {
  const a = i.principal || '', b = i.secundario ? `${a ? ' · ' : ''}${i.secundario}` : '';
  return despensa ? { a: '', b: (a + b).replace(/^ · /, '') } : { a, b };
};

function cabecalhoCaixa(doc, x, y, w, titulo, cont, n, total) {
  doc.rect(x, y, w, CAB_H).fill(C.ink);
  const contador = total ? `${n}/${total}` : '';
  const livre = w - 2 * PAD - (contador ? largura(doc, contador, F.ui, 7.5) + 6 : 0);
  // Título longo ("Ovos e laticínios (cont.)") encolhe até caber ao lado do contador.
  let t = `${titulo.toUpperCase()}${cont ? ' (CONT.)' : ''}`, size = 7.5, cs = 1.5;
  while (largura(doc, t, F.ui, size, cs) > livre && size > 5.5) { size -= 0.5; cs = Math.max(0.6, cs - 0.3); }
  if (largura(doc, t, F.ui, size, cs) > livre && cont) t = `${titulo.toUpperCase()} (…)`;
  doc.font(F.ui).fontSize(size).fillColor(C.paper).text(t, x + PAD, y + 6 + (7.5 - size) / 2, { characterSpacing: cs, lineBreak: false });
  if (contador) doc.font(F.ui).fontSize(7.5).fillColor('#C9CFC4').text(contador, x, y + 6, { width: w - PAD, align: 'right', lineBreak: false });
}

function linhaItem(doc, i, x, y, w, m, despensa) {
  const xi = x + PAD;
  doc.lineWidth(0.8).strokeColor(C.ink2).rect(xi, y + 3, 7, 7).stroke();
  doc.font(F.sans).fontSize(8.5).fillColor(C.ink).text(i.nome, xi + 13, y + 2, { width: m.util, lineBreak: m.h > LINHA && !m.juntos ? true : false });
  const yq = m.juntos ? y + 2.5 : y + m.h - 12;
  const xq = x + w - PAD - m.qtdW;
  const corA = despensa ? C.muted : C.ink2;
  if (m.qtd.a) doc.font(F.ui).fontSize(8).fillColor(corA).text(m.qtd.a, xq, yq, { lineBreak: false });
  if (m.qtd.b) doc.font(F.sans).fontSize(7.5).fillColor(C.muted).text(m.qtd.b, xq + (m.qtd.a ? largura(doc, m.qtd.a, F.ui, 8) : 0), yq + 0.5, { lineBreak: false });
}

/**
 * Desenha uma seção numa coluna a partir de `y`, até `yMax`. Devolve
 * { y, restante } — `restante` são os itens que não couberam (vão pra próxima
 * coluna com "(cont.)").
 */
function caixa(doc, secao, x, y, w, yMax, { cont = false, despensa = false, total = 0 } = {}) {
  const medidas = secao.itens.map((i) => medirItem(doc, i, w, despensa));
  let h = CAB_H + PAD, n = 0;
  while (n < secao.itens.length && y + h + medidas[n].h + PAD <= yMax) { h += medidas[n].h; n += 1; }
  if (n === 0) return { y, restante: secao.itens, nada: true };
  h += PAD - 4;
  doc.lineWidth(0.6).strokeColor(C.line).roundedRect(x, y, w, h, 4).stroke();
  cabecalhoCaixa(doc, x, y, w, despensa ? 'Despensa · confere se tem' : secao.titulo, cont, 0, total);
  let yi = y + CAB_H + PAD / 2;
  for (let k = 0; k < n; k += 1) {
    linhaItem(doc, secao.itens[k], x, yi, w, medidas[k], despensa);
    yi += medidas[k].h;
    if (k < n - 1) pontilhado(doc, x + PAD, yi + 0.5, w - 2 * PAD);
  }
  return { y: y + h, restante: secao.itens.slice(n) };
}

// ─── a folha ──────────────────────────────────────────────────────────────

function desenhar(doc, dados) {
  fundo(doc);
  let y = masthead(doc, dados);
  y = intro(doc, dados, y) + 12;

  const compra = (dados.secoes || []).filter((s) => s.id !== 'despensa');
  const despensa = (dados.secoes || []).find((s) => s.id === 'despensa');

  // Seções em 3 colunas: preenche a coluna até o fim da página, passa pra
  // próxima; acabaram as colunas, página nova. Caixa maior que a coluna
  // continua na seguinte com "(cont.)".
  let col = 0, topo = y, ys = [y, y, y];
  const proximaColuna = () => {
    col += 1;
    if (col === COLS) { doc.addPage(); fundo(doc); col = 0; topo = 48; ys = [topo, topo, topo]; }
  };
  for (const s of compra) {
    let itens = s.itens, cont = false;
    while (itens.length) {
      const r = caixa(doc, { ...s, itens }, X0 + col * (COL_W + GAP), ys[col], COL_W, Y_FIM, { cont, total: s.itens.length });
      if (r.nada) { proximaColuna(); continue; }
      ys[col] = r.y + GAP; itens = r.restante; cont = true;
      if (itens.length) proximaColuna();
    }
  }

  // Despensa + anotações, lado a lado, abaixo das colunas.
  y = Math.max(...ys);
  const despW = CW * 0.535, notasW = CW - despW - GAP, notasH = 140;
  const alturaDesp = despensa ? CAB_H + PAD * 2 + despensa.itens.reduce((a, i) => a + medirItem(doc, i, despW, true).h, 0) : 0;
  if (y + Math.max(alturaDesp, notasH) + 70 > Y_FIM) { doc.addPage(); fundo(doc); y = 48; }
  let yFim = y;
  if (despensa) {
    let itens = despensa.itens, cont = false, yd = y;
    while (itens.length) {
      const r = caixa(doc, { ...despensa, itens }, X0, yd, despW, Y_FIM, { cont, despensa: true });
      if (r.nada) break;
      yd = r.y; itens = r.restante; cont = true;
      if (itens.length) { yd += GAP; }
    }
    yFim = Math.max(yFim, yd);
  }
  // anotações
  const xn = X0 + despW + GAP;
  const hn = Math.max(notasH, despensa ? yFim - y : 0);
  doc.lineWidth(0.6).strokeColor(C.line).roundedRect(xn, y, notasW, hn, 4).stroke();
  cabecalhoCaixa(doc, xn, y, notasW, 'Anotações', false, 0, 0);
  doc.font(F.sans).fontSize(8).fillColor(C.ink2).text('Trocas combinadas com a Nutri Luciana, marcas de preferência, o que faltou no mercado.', xn + PAD, y + CAB_H + 7, { width: notasW - 2 * PAD });
  for (let ly = y + CAB_H + 40; ly < y + hn - 8; ly += 16) doc.lineWidth(0.5).strokeColor(C.line).moveTo(xn + PAD, ly).lineTo(xn + notasW - PAD, ly).stroke();
  yFim = Math.max(yFim, y + hn);

  // rodapé
  y = yFim + 12;
  if (y + 56 > Y_FIM) { doc.addPage(); fundo(doc); y = 48; }
  doc.lineWidth(0.6).strokeColor(C.line).roundedRect(X0, y, CW, 20, 4).stroke();
  tituloCentrado(doc, '•   PLANEJE  ·  COMPRE  ·  NUTRA-SE   •', y + 6.5, { font: F.ui, size: 7.5, cor: C.ink2, cs: 2 });
  y += 28;
  tituloCentrado(doc, 'Nutri Lu', y, { font: F.serif, size: 12, cor: C.ink });
  tituloCentrado(doc, 'nutrilualves.com.br/membros  ·  a Luna monta esta lista a partir do plano publicado pela Nutri Luciana', y + 15, { font: F.sans, size: 7.5, cor: C.muted });
}
