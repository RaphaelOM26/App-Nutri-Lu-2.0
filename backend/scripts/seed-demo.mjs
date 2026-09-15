// Conta DEMO com dados de mentira pra apresentação: 8 semanas de peso, medidas,
// 10 dias de refeições (com fotos), fotos de progresso, foto de perfil,
// materiais (vídeos e PDFs), recados, plano da semana e suplementos.
//
// Só no banco descartável nutrilu_dev e com o servidor em modo de fotos LOCAL
// (scripts/dev-local.mjs). Apaga e recria a conta a cada execução.
//
//   node scripts/seed-demo.mjs            → demo@nutrilualves.com.br

import 'dotenv/config';
import pg from 'pg';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const EMAIL = 'demo@nutrilualves.com.br';
const NOME = 'Mariana Costa';
const url = new URL(process.env.DATABASE_URL);
if (url.pathname !== '/nutrilu_dev') url.pathname = '/nutrilu_dev';
const pool = new pg.Pool({ connectionString: url.toString(), ssl: url.hostname.includes('railway') || url.hostname.includes('rlwy') ? { rejectUnauthorized: false } : undefined });
const FOTOS = process.env.FOTOS_LOCAL_DIR || fileURLToPath(new URL('../.dev-fotos', import.meta.url));
const RECEITAS = fileURLToPath(new URL('../../../Nutri Lu Membros/web/public/receitas', import.meta.url));
const BASE = `http://localhost:${process.env.PORT || 3001}`;

const iso = (d) => d.toISOString().slice(0, 10);
const hoje = new Date(); hoje.setHours(12, 0, 0, 0);
const dias = (n) => { const d = new Date(hoje); d.setDate(d.getDate() + n); return iso(d); };

// ─── Imagens de mentira (SVG) ─────────────────────────────────────────────
const silhueta = (rotulo, largura) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6ECE1"/><stop offset="1" stop-color="#C9D6C2"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><rect x="60" y="30" width="280" height="440" rx="18" fill="#F4F6F1" opacity="0.7"/><circle cx="200" cy="120" r="42" fill="#6F8C68"/><path d="M200 165 c-${largura} 0 -${largura + 10} 60 -${largura + 10} 120 v 150 h ${2 * largura + 20} v -150 c 0 -60 -${largura} -120 -${largura + 10} -120 z" fill="#6F8C68"/><text x="200" y="440" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="22" font-weight="700" fill="#12201A">${rotulo}</text></svg>`;
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F3D9DD"/><circle cx="100" cy="78" r="38" fill="#7A4A55"/><path d="M30 200 c0 -55 35 -80 70 -80 s70 25 70 80z" fill="#7A4A55"/></svg>`;
const thumb = (titulo, cor) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="${cor}"/><circle cx="560" cy="80" r="120" fill="#D6C28A" opacity="0.25"/><text x="40" y="300" font-family="Segoe UI, sans-serif" font-size="34" font-weight="700" fill="#F4F6F1">${titulo}</text></svg>`;

async function main() {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query(`DELETE FROM users WHERE email = $1`, [EMAIL]);
    await c.query(`DELETE FROM purchases WHERE email = $1`, [EMAIL]);
    const { rows: [u] } = await c.query(
      `INSERT INTO users (provider, provider_sub, display_name, email) VALUES ('email', $1, $2, $1) RETURNING id`, [EMAIL, NOME]);
    const uid = u.id;

    // Acesso ativo (cortesia)
    await c.query(`INSERT INTO purchases (source, external_id, email, status, valido_ate) VALUES ('cortesia', 'demo', $1, 'ativa', NOW() + INTERVAL '90 days')`, [EMAIL]);

    // Fotos em disco
    mkdirSync(join(FOTOS, uid, 'progresso'), { recursive: true });
    mkdirSync(join(FOTOS, uid, 'perfil'), { recursive: true });
    mkdirSync(join(FOTOS, uid, 'prato'), { recursive: true });
    mkdirSync(join(FOTOS, 'materiais'), { recursive: true });
    writeFileSync(join(FOTOS, uid, 'perfil', 'avatar.svg'), avatar);
    const fotosProg = [[-56, 'Semana 1', 70, 74.2], [-28, 'Semana 5', 62, 71.6], [0, 'Hoje', 56, 69.1]];
    for (const [off, rot, larg, kg] of fotosProg) {
      const key = `${uid}/progresso/${dias(off)}.svg`;
      writeFileSync(join(FOTOS, key), silhueta(rot, larg));
      await c.query(`INSERT INTO progress_photos (user_id, date, photo_key, weight_kg) VALUES ($1, $2, $3, $4)`, [uid, dias(off), key, kg]);
    }

    // Perfil completo (respostas do onboarding)
    const perfil = {
      sexo: 'feminino', nascimento: '1991-03-14', altura_cm: 165, meta_kg: 65, objetivo: 'perder', atividade: 'moderada',
      dor: 'Como bem a semana inteira e perco tudo no fim de semana. Me sinto inchada e sem energia à tarde.',
      desejo: 'Entrar no vestido do casamento da minha irmã em novembro e ter disposição pra brincar com as crianças sem cansar.',
      urgencia: 'Cansaço constante depois do almoço e vontade de doce toda noite. Achava que era normal.',
      restricoes: ['sem-lactose'], alergias: '', nao_gosta: 'peixe cru, jiló, fígado', indispensavel: 'café com leite de manhã e o pão francês do domingo',
      dia_normal: { cafe: 'café com leite e pão com ovo', almoco: 'arroz, feijão, frango grelhado e salada', lanche: 'fruta, às vezes bolacha', jantar: 'sobra do almoço ou sanduíche' },
      limitacoes: 'almoço fora 3x na semana; cozinho só no fim de semana', mais_fome: 'tarde', doces: 'frequentemente', doces_quando: 'depois do jantar, quando estou cansada',
      agua_litros: 1.5, sono: 'regular', sono_horas: 6.5,
      estimativa: { kcal: [1450, 1600], p: [110, 135], c: [135, 165], f: [55, 68], base: { peso_kg: 69.1, objetivo: 'perder', atividade: 'moderada', sexo: 'feminino' }, calculada_em: new Date(Date.now() - 56 * 864e5).toISOString() },
      onboarding_em: new Date(Date.now() - 56 * 864e5).toISOString(),
      foto_key: `${uid}/perfil/avatar.svg`,
      lembretes: { refeicoes: true, agua: true, peso: true },
    };
    await c.query(`INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)`, [uid, JSON.stringify(perfil)]);
    await c.query(`INSERT INTO anamnese_clinica (user_id, data, consentimento_em) VALUES ($1, $2, NOW() - INTERVAL '56 days')`, [uid, JSON.stringify({
      doencas: 'hipotireoidismo', historico_familiar: 'mãe com diabetes tipo 2, pai com pressão alta', medicamentos_usa: 'sim', medicamentos: 'levotiroxina 50 mcg, de manhã',
      perda_controle: 'as-vezes', perda_controle_quando: 'à noite, depois de um dia difícil', intestino: 'preso', sintomas: 'estufamento depois do almoço', alcool: 'social',
      suplementacao: { usa: 'sim', quais: 'vitamina D', forca: 'sim', proteina: 'sim', cansaco: 'sim', cabelo: 'nao', pouca_carne: 'nao', pouco_sol: 'sim', osteo: 'nao', pouco_calcio: 'sim', pouco_peixe: 'sim', intestino_preso: 'sim', poucos_vegetais: 'nao', sono_ruim: 'sim', articular: 'nao' },
    })]);

    // Peso: 8 semanas caindo devagar
    const pesos = [74.2, 73.6, 73.1, 72.4, 71.6, 70.8, 70.0, 69.5, 69.1];
    for (let i = 0; i < pesos.length; i++) await c.query(`INSERT INTO weight_log (user_id, date, kg) VALUES ($1, $2, $3)`, [uid, dias(-7 * (pesos.length - 1 - i)), pesos[i]]);
    // Medidas: 3 registros
    for (const [off, m] of [[-56, { cintura_cm: 84, quadril_cm: 104, braco_cm: 30, coxa_cm: 58 }], [-28, { cintura_cm: 81, quadril_cm: 102, braco_cm: 29.5, coxa_cm: 57 }], [0, { cintura_cm: 78.5, quadril_cm: 100, braco_cm: 29, coxa_cm: 56 }]]) {
      await c.query(`INSERT INTO body_measures (user_id, date, measures) VALUES ($1, $2, $3)`, [uid, dias(off), JSON.stringify(m)]);
    }

    // Refeições dos últimos 10 dias (pula 2 dias pra adesão parecer real)
    const cardapio = {
      cafe: [{ name: 'Overnight de Morango com Cheesecake', portion: '1 porção', code: 'NL-011', kcal: 290, p: 22, c: 34, f: 7 }],
      lanche_manha: [{ name: 'Banana', portion: '1 unidade · 90 g', grams: 90, kcal: 88, p: 1.2, c: 22.6, f: 0.1 }],
      almoco: [{ name: 'Frango cremoso com leite de coco e curry', portion: '1 porção', code: 'NL-032', kcal: 360, p: 44, c: 8, f: 17 }, { name: 'Arroz, integral, cozido', portion: '100 g', grams: 100, kcal: 124, p: 2.6, c: 25.8, f: 1 }],
      lanche_tarde: [{ name: 'Bowl proteico de iogurte, mamão e leite em pó', portion: '1 porção', code: 'NL-404', kcal: 270, p: 33, c: 28, f: 3 }],
      jantar: [{ name: 'Omelete caprese', portion: '1 porção', code: 'NL-019', kcal: 270, p: 19, c: 4, f: 20 }],
      ceia: [{ name: 'Chá de camomila', portion: '1 xícara', grams: 200, kcal: 2, p: 0, c: 0.4, f: 0 }],
    };
    const fotoPrato = `${uid}/prato/almoco.jpg`;
    if (existsSync(join(RECEITAS, 'NL-032.jpg'))) copyFileSync(join(RECEITAS, 'NL-032.jpg'), join(FOTOS, fotoPrato));
    for (let off = -9; off <= 0; off++) {
      if (off === -6 || off === -2) continue;
      const slots = off === 0 ? ['cafe', 'lanche_manha', 'almoco'] : off % 3 === 0 ? ['cafe', 'almoco', 'jantar'] : Object.keys(cardapio);
      for (const slot of slots) {
        const items = cardapio[slot]; const tot = items.reduce((a, i) => ({ kcal: a.kcal + i.kcal, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { kcal: 0, p: 0, c: 0, f: 0 });
        const source = slot === 'almoco' && off % 2 === 0 ? 'foto' : slot === 'lanche_manha' ? 'taco' : slot === 'jantar' && off % 4 === 0 ? 'whatsapp' : 'plano';
        const hora = { cafe: '07:20', lanche_manha: '10:05', almoco: '12:40', lanche_tarde: '16:10', jantar: '19:45', ceia: '21:30' }[slot];
        await c.query(`INSERT INTO meal_entries (user_id, date, slot, source, items, kcal, p, c, f, photo_key, confidence, logged_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [uid, dias(off), slot, source, JSON.stringify(items), tot.kcal, tot.p, tot.c, tot.f, source === 'foto' ? fotoPrato : null, source === 'foto' ? 'medium' : null, `${dias(off)}T${hora}:00-03:00`]);
      }
      await c.query(`INSERT INTO water_log (user_id, date, ml) VALUES ($1, $2, $3)`, [uid, dias(off), off === 0 ? 1000 : 1600 + (off % 3) * 200]);
    }

    // Materiais (vídeos + PDFs)
    for (const [t, cor, arq] of [['Como montar o prato', '#12201A', 'v1'], ['Comer fora sem sair do plano', '#55704E', 'v2'], ['Lanches de 5 minutos', '#7A4A55', 'v3']]) writeFileSync(join(FOTOS, 'materiais', `${arq}.svg`), thumb(t, cor));
    await c.query(`DELETE FROM materials WHERE meta->>'demo' = '1'`);
    const mats = [
      ['Como montar o prato', 'video', 'https://www.youtube.com/', { demo: '1', duracao: '11 min', destaque: true, thumb: `${BASE}/dev-fotos/materiais/v1.svg`, porque: 'É a base de tudo: proporção, não restrição.' }, 1],
      ['Comer fora sem sair do plano', 'video', 'https://www.youtube.com/', { demo: '1', duracao: '8 min', thumb: `${BASE}/dev-fotos/materiais/v2.svg` }, 2],
      ['Lanches de 5 minutos', 'video', 'https://www.youtube.com/', { demo: '1', duracao: '6 min', thumb: `${BASE}/dev-fotos/materiais/v3.svg` }, 3],
      ['Guia de suplementos da Lu', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { demo: '1', paginas: 14 }, 4],
      ['Lista de compras inteligente', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { demo: '1', paginas: 6 }, 5],
      ['Trocas equivalentes por grupo', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { demo: '1', paginas: 9 }, 6],
    ];
    for (const [title, kind, u2, meta, sort] of mats) await c.query(`INSERT INTO materials (title, kind, url, meta, sort) VALUES ($1,$2,$3,$4,$5)`, [title, kind, u2, JSON.stringify(meta), sort]);

    // Recados e uma dúvida respondida
    await c.query(`INSERT INTO lu_messages (user_id, kind, author, text, created_at) VALUES ($1, 'recado', 'nutri', $2, NOW() - INTERVAL '6 days')`, [uid, 'Mariana, você fechou a semana 1 com 5 dias registrados. Isso é o que importa. Nessa semana o foco é o lanche da tarde: coloquei uma opção com mais proteína pra segurar a vontade de doce à noite.']);
    const { rows: [perg] } = await c.query(`INSERT INTO lu_messages (user_id, kind, author, text, read_at, created_at) VALUES ($1, 'pergunta', 'cliente', $2, NOW(), NOW() - INTERVAL '3 days') RETURNING id`, [uid, 'Posso trocar o jantar de sexta por uma pizza? Vou sair com amigas.']);
    await c.query(`INSERT INTO lu_messages (user_id, kind, author, text, reply_to, created_at) VALUES ($1, 'resposta', 'nutri', $2, $3, NOW() - INTERVAL '2 days')`, [uid, 'Pode, e sem culpa. Duas fatias, salada antes, e no sábado volta pro plano normal. Uma refeição não muda resultado; a semana muda.', perg.id]);
    await c.query(`INSERT INTO lu_messages (user_id, kind, author, text, created_at) VALUES ($1, 'recado', 'nutri', $2, NOW() - INTERVAL '1 day')`, [uid, 'Semana 3 no ar. Subi um pouco a proteína do café e troquei a ceia por algo mais leve, porque você contou que o sono não está reparador.']);

    await c.query('COMMIT');
    console.log(`[seed-demo] conta ${EMAIL} (${uid}) criada com peso, medidas, refeições, fotos, materiais e recados.`);
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }

  // Plano da semana + suplementos pelo script já existente
  const r = spawnSync(process.execPath, ['scripts/carregar-plano.mjs', '--email', EMAIL, '--arquivo', 'scripts/exemplos/plano-exemplo.json'], { stdio: 'inherit', env: { ...process.env, DATABASE_URL: url.toString() } });
  if (r.status !== 0) throw new Error('carregar-plano falhou');
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
