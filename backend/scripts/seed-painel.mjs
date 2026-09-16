// Dados de mentira pro PAINEL da Luciana: a conta dela (papel nutri), uma de
// sócio (papel admin) e ~30 clientes fictícias com respostas variadas do
// onboarding e da anamnese — pra lista de pacientes, a ficha e o dashboard
// do público terem o que mostrar na apresentação.
//
// Só no banco descartável nutrilu_dev. Apaga e recria as contas fictícias a
// cada execução (todas terminam em @demo-painel.nutrilu). A demo da Mariana
// (seed-demo.mjs) é separada e continua existindo.
//
//   node scripts/seed-painel.mjs
//
// Contas: nutrilu@nutrilualves.com.br (nutri) · raphael@nutrilualves.com.br (admin)

import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const url = new URL(process.env.DATABASE_URL);
if (url.pathname !== '/nutrilu_dev') url.pathname = '/nutrilu_dev';
const pool = new pg.Pool({ connectionString: url.toString(), ssl: url.hostname.includes('railway') || url.hostname.includes('rlwy') ? { rejectUnauthorized: false } : undefined });
const exemplo = JSON.parse(readFileSync(fileURLToPath(new URL('./exemplos/plano-exemplo.json', import.meta.url)), 'utf8'));

const iso = (d) => d.toISOString().slice(0, 10);
const hoje = new Date(); hoje.setHours(12, 0, 0, 0);
const dias = (n) => { const d = new Date(hoje); d.setDate(d.getDate() + n); return iso(d); };
const dow = hoje.getDay() === 0 ? 7 : hoje.getDay();
const segunda = dias(1 - dow);
const proxSegunda = dias(8 - dow);

// Gerador determinístico: a mesma base a cada execução.
let s = 42;
const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const peso = (w) => { const r = rnd() * w.reduce((a, b) => a + b[1], 0); let acc = 0; for (const [v, p] of w) { acc += p; if (r < acc) return v; } return w[0][0]; };

const NOMES_F = ['Ana Paula', 'Beatriz', 'Camila', 'Daniela', 'Fernanda', 'Gabriela', 'Helena', 'Isabela', 'Juliana', 'Larissa', 'Mariana', 'Natália', 'Patrícia', 'Renata', 'Sabrina', 'Tatiane', 'Vanessa', 'Aline', 'Bruna', 'Carolina', 'Débora', 'Elaine', 'Flávia', 'Giovana', 'Letícia'];
const NOMES_M = ['Rafael', 'Bruno', 'Diego', 'Felipe', 'Gustavo'];
const SOBRENOMES = ['Silva', 'Souza', 'Oliveira', 'Santos', 'Pereira', 'Lima', 'Costa', 'Rocha', 'Almeida', 'Ribeiro', 'Martins', 'Carvalho'];

const DORES = [
  'Como bem a semana inteira e perco tudo no fim de semana. Me sinto inchada e sem energia à tarde.',
  'Não consigo manter uma rotina. Começo segunda e na quarta já desisti.',
  'Ansiedade à noite me leva pra geladeira. Sei que não é fome, mas como assim mesmo.',
  'Trabalho sentada o dia todo, chego em casa exausta e peço delivery.',
  'Já tentei de tudo: low carb, jejum, shake. Emagreço e volta tudo, com juros.',
  'Não sei montar um prato. Fico perdida entre o que pode e o que não pode.',
  'Estufamento depois de quase toda refeição. Roupas apertando na barriga.',
  'Tenho vergonha de tirar foto. Evito espelho e praia.',
  'Almoço fora todo dia e nunca sei o que escolher no restaurante.',
  'Cansaço o dia inteiro, mesmo dormindo. Café não resolve mais.',
  'Cuido de todo mundo em casa e sobra nada pra mim. Como o que sobra, em pé.',
  'Doce depois do almoço todo dia. Já virou automático.',
  'Ganhei 12 kg na pandemia e não consegui tirar nenhum.',
  'Treino, mas não vejo resultado. Acho que como errado.',
  'Falta de tempo. Não cozinho e não sei o que levar pro trabalho.',
];
const DESEJOS = [
  'Entrar no vestido do casamento da minha irmã em novembro e ter disposição pra brincar com as crianças sem cansar.',
  'Me olhar no espelho e gostar. Não precisa ser magra, precisa ser eu de novo.',
  'Ter energia de manhã sem depender de café e não sentir sono depois do almoço.',
  'Chegar aos 40 saudável, sem remédio de pressão como minha mãe.',
  'Comer sem culpa. Ir numa festa e não passar o dia seguinte me punindo.',
  'Voltar a usar o jeans que está guardado há 3 anos.',
  'Ter uma rotina que eu consiga manter mesmo nas semanas caóticas.',
  'Sentir a barriga desinchada e conseguir dormir bem.',
  'Perder 8 kg até o verão de um jeito que não volte.',
  'Ser exemplo pros meus filhos: comer bem sem ser neurótica.',
  'Fazer exames e ver tudo normal.',
  'Conseguir subir escada sem ficar ofegante e treinar com mais força.',
];
const URGENCIAS = [
  'Cansaço constante depois do almoço e vontade de doce toda noite. Achava que era normal.',
  'Intestino preso há anos. Achava que era assim mesmo.',
  'Dor de cabeça quase todo dia à tarde.',
  'Acordar cansada mesmo dormindo 8 horas.',
  'Azia depois do jantar, quase sempre.',
  'Inchaço nas pernas no fim do dia.',
  'Queda de cabelo que eu atribuía ao estresse.',
  'Fome descontrolada às 17h. Achava que era falta de força de vontade.',
  'Estufamento que eu chamava de "barriga de família".',
  'Irritação e ansiedade quando fico muito tempo sem comer.',
];
const NAO_GOSTA = ['peixe cru, jiló, fígado', 'ovo cozido e beterraba', 'brócolis e couve', 'leite e iogurte natural', 'carne vermelha', 'berinjela, quiabo', 'frutas cítricas', 'aveia e chia', 'qualquer coisa com coentro', 'frango grelhado todo dia'];
const INDISPENSAVEL = ['café com leite de manhã e o pão francês do domingo', 'arroz e feijão no almoço', 'um doce depois do almoço', 'pizza na sexta com a família', 'chocolate, pelo menos um pedacinho', 'pão de queijo com café', 'açaí depois do treino', 'churrasco no fim de semana', 'cerveja com os amigos', 'café preto, sem restrição'];
const LIMITACOES = ['almoço fora 3x na semana; cozinho só no fim de semana', 'orçamento apertado, compro no atacado uma vez por mês', 'não cozinho, marido cozinha e não segue plano', 'trabalho em escala 12x36, horários malucos', 'moro sozinha, comida estraga antes de acabar', 'viajo a trabalho toda semana', 'almoço na empresa, cardápio fixo', 'tenho 20 minutos pra almoçar', 'crianças pequenas, como o que sobra', 'sem restrição de rotina, tenho tempo'];
const DOCES_QUANDO = ['depois do jantar, quando estou cansada', 'logo depois do almoço', 'à tarde, no trabalho', 'à noite vendo série', 'quando fico ansiosa', 'fim de semana'];
const DIA_NORMAL = [
  { cafe: 'café com leite e pão com ovo', almoco: 'arroz, feijão, frango grelhado e salada', lanche: 'fruta, às vezes bolacha', jantar: 'sobra do almoço ou sanduíche' },
  { cafe: 'só café preto', almoco: 'marmita do restaurante', lanche: 'pão de queijo', jantar: 'pizza ou lanche' },
  { cafe: 'pão com manteiga e café', almoco: 'prato feito', lanche: 'bolacha recheada', jantar: 'macarrão ou sopa' },
  { cafe: 'iogurte com granola', almoco: 'salada com proteína', lanche: 'castanhas', jantar: 'omelete' },
  { cafe: 'nada, não tenho fome', almoco: 'arroz, feijão, carne', lanche: 'chocolate', jantar: 'sanduíche' },
];
const DOENCAS = ['hipotireoidismo', 'nenhuma', 'ansiedade', 'gastrite', 'resistência à insulina', 'SOP', 'pressão alta', 'não', 'colesterol alto', 'enxaqueca', 'intolerância à lactose', 'esteatose hepática'];
const MEDS = ['levotiroxina 50 mcg, de manhã', 'sertralina 50 mg', 'anticoncepcional', 'losartana 50 mg', 'metformina 850 mg', 'omeprazol', 'vitamina D', 'ozempic 0,5'];
const HIST = ['mãe com diabetes tipo 2, pai com pressão alta', 'não', 'avó com câncer de mama', 'pai infartou aos 55', 'mãe com hipotireoidismo', 'diabetes na família toda', 'nenhum'];
const SINTOMAS = ['estufamento depois do almoço', 'azia à noite', 'cansaço', 'dor de cabeça à tarde', 'nenhum', 'queda de cabelo', 'insônia', 'gases', 'dor no joelho'];

const cardapio = {
  cafe: [{ name: 'Overnight de Morango com Cheesecake', portion: '1 porção', code: 'NL-011', kcal: 290, p: 22, c: 34, f: 7 }],
  almoco: [{ name: 'Frango cremoso com leite de coco e curry', portion: '1 porção', code: 'NL-032', kcal: 360, p: 44, c: 8, f: 17 }, { name: 'Arroz, integral, cozido', portion: '100 g', grams: 100, kcal: 124, p: 2.6, c: 25.8, f: 1 }],
  lanche_tarde: [{ name: 'Bowl proteico de iogurte, mamão e leite em pó', portion: '1 porção', code: 'NL-404', kcal: 270, p: 33, c: 28, f: 3 }],
  jantar: [{ name: 'Omelete caprese', portion: '1 porção', code: 'NL-019', kcal: 270, p: 19, c: 4, f: 20 }],
};

async function main() {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query(`DELETE FROM users WHERE email LIKE '%@demo-painel.nutrilu'`);
    // Sobras de testes automatizados (teste-area-web, teste-painel) sujam o dashboard.
    await c.query(`DELETE FROM users WHERE email LIKE '%@example.com'`);
    await c.query(`DELETE FROM purchases WHERE email LIKE '%@demo-painel.nutrilu'`);
    await c.query(`DELETE FROM painel_cache`);

    // Equipe
    for (const [email, nome, role] of [['nutrilu@nutrilualves.com.br', 'Luciana Alves', 'nutri'], ['raphael@nutrilualves.com.br', 'Raphael', 'admin']]) {
      await c.query(
        `INSERT INTO users (provider, provider_sub, display_name, email, role) VALUES ('email', $1, $2, $1, $3)
         ON CONFLICT (provider, provider_sub) DO UPDATE SET role = EXCLUDED.role, display_name = EXCLUDED.display_name`, [email, nome, role]);
    }

    const N = Number(process.env.SEED_N) || 31; // SEED_N=300 pra testar paginação
    for (let i = 0; i < N; i++) {
      const fem = rnd() < 0.84;
      const nome = `${fem ? pick(NOMES_F) : pick(NOMES_M)} ${pick(SOBRENOMES)}`;
      const email = `cliente${String(i + 1).padStart(2, '0')}@demo-painel.nutrilu`;
      const entrou = Math.floor(rnd() * 70); // dias atrás
      const { rows: [u] } = await c.query(
        `INSERT INTO users (provider, provider_sub, display_name, email, created_at) VALUES ('email', $1, $2, $1, NOW() - ($3 || ' days')::interval) RETURNING id`, [email, nome, String(entrou)]);
      const uid = u.id;
      if (rnd() < 0.9) await c.query(`INSERT INTO purchases (source, external_id, email, status, valido_ate) VALUES ('hotmart', $2, $1, 'ativa', NOW() + INTERVAL '120 days')`, [email, `demo-${i}`]);

      // 4 em cada 5 terminaram o onboarding
      const fezOnboarding = i < 4 ? i !== 2 : rnd() < 0.85;
      if (!fezOnboarding) continue;

      const altura = fem ? 152 + Math.round(rnd() * 22) : 165 + Math.round(rnd() * 22);
      const imc = 21 + rnd() * 14;
      const pesoAtual = Math.round(imc * (altura / 100) ** 2 * 10) / 10;
      const objetivo = peso([['perder', 0.8], ['manter', 0.12], ['ganhar', 0.08]]);
      const meta = objetivo === 'perder' ? Math.round(pesoAtual - (3 + rnd() * 18)) : objetivo === 'ganhar' ? Math.round(pesoAtual + 3 + rnd() * 5) : Math.round(pesoAtual);
      const anoNasc = 1968 + Math.floor(rnd() * 36);
      const restr = peso([[['nenhuma'], 0.55], [['sem-lactose'], 0.2], [['sem-gluten'], 0.08], [['vegetariana'], 0.08], [['sem-lactose', 'sem-gluten'], 0.05], [['vegana'], 0.04]]);
      const perfil = {
        nome, sexo: fem ? 'feminino' : 'masculino', nascimento: `${anoNasc}-${String(1 + Math.floor(rnd() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}`,
        altura_cm: altura, meta_kg: meta, objetivo,
        atividade: peso([['sedentaria', 0.3], ['leve', 0.35], ['moderada', 0.25], ['muito', 0.08], ['extrema', 0.02]]),
        dor: pick(DORES), desejo: pick(DESEJOS), urgencia: pick(URGENCIAS),
        restricoes: restr, alergias: rnd() < 0.15 ? pick(['camarão', 'amendoim', 'castanhas']) : '',
        nao_gosta: pick(NAO_GOSTA), indispensavel: pick(INDISPENSAVEL), dia_normal: pick(DIA_NORMAL), limitacoes: pick(LIMITACOES),
        mais_fome: peso([['manha', 0.1], ['apos-almoco', 0.2], ['tarde', 0.45], ['noite', 0.25]]),
        doces: peso([['nao', 0.1], ['as-vezes', 0.3], ['frequentemente', 0.35], ['todos-os-dias', 0.25]]),
        agua_litros: Math.round((0.5 + rnd() * 3) * 2) / 2, sono: peso([['bom', 0.3], ['regular', 0.5], ['ruim', 0.2]]), sono_horas: Math.round((5 + rnd() * 4) * 2) / 2,
        estimativa: { kcal: [1400, 1600], p: [100, 130], c: [130, 170], f: [50, 65], base: { peso_kg: pesoAtual, objetivo, atividade: 'leve', sexo: fem ? 'feminino' : 'masculino' }, calculada_em: new Date().toISOString() },
        onboarding_em: new Date(Date.now() - Math.max(0, entrou - 1) * 864e5).toISOString(),
      };
      if (perfil.doces !== 'nao') perfil.doces_quando = pick(DOCES_QUANDO);
      await c.query(`INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)`, [uid, JSON.stringify(perfil)]);

      // Peso: algumas pesagens
      const nPesos = 1 + Math.floor(rnd() * 6);
      for (let k = nPesos - 1; k >= 0; k--) await c.query(`INSERT INTO weight_log (user_id, date, kg) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [uid, dias(-7 * k), Math.round((pesoAtual + k * 0.4 * (objetivo === 'perder' ? 1 : -1)) * 10) / 10]);

      // Anamnese clínica (3 em cada 4)
      if (rnd() < 0.75) {
        const usaMed = rnd() < 0.45;
        const sup = { usa: rnd() < 0.4 ? 'sim' : 'nao', quais: '' };
        if (sup.usa === 'sim') sup.quais = pick(['whey', 'vitamina D', 'creatina', 'ômega 3', 'polivitamínico']);
        for (const id of ['forca', 'proteina', 'cansaco', 'cabelo', 'pouca_carne', 'pouco_sol', 'osteo', 'pouco_calcio', 'pouco_peixe', 'intestino_preso', 'poucos_vegetais', 'sono_ruim', 'articular']) sup[id] = rnd() < ({ cansaco: 0.6, pouco_sol: 0.6, pouco_peixe: 0.7, sono_ruim: 0.5, intestino_preso: 0.4, proteina: 0.5, forca: 0.35 }[id] ?? 0.25) ? 'sim' : 'nao';
        await c.query(`INSERT INTO anamnese_clinica (user_id, data, consentimento_em) VALUES ($1, $2, NOW())`, [uid, JSON.stringify({
          doencas: pick(DOENCAS), historico_familiar: pick(HIST), medicamentos_usa: usaMed ? 'sim' : 'nao', medicamentos: usaMed ? pick(MEDS) : '',
          perda_controle: peso([['nao', 0.35], ['as-vezes', 0.45], ['frequentemente', 0.2]]), perda_controle_quando: 'à noite',
          intestino: peso([['regular', 0.45], ['preso', 0.35], ['solto', 0.08], ['alterna', 0.12]]), sintomas: pick(SINTOMAS),
          alcool: peso([['nao', 0.3], ['social', 0.5], ['semanal', 0.15], ['diario', 0.05]]), suplementacao: sup,
        })]);
      }

      // Plano: metade tem plano ativo nesta semana; algumas com a próxima também
      const temPlano = rnd() < 0.55;
      if (temPlano) {
        const wi = 1 + Math.floor(rnd() * 4);
        await c.query(
          `INSERT INTO meal_plans (user_id, week_start, week_index, week_total, targets, note, days, status, published_at) VALUES ($1, $2, $3, 4, $4, $5, $6, 'ativo', NOW() - INTERVAL '2 days')`,
          [uid, segunda, wi, JSON.stringify(exemplo.targets), exemplo.note, JSON.stringify(exemplo.days.map((d) => ({ weekday: d.weekday, meals: d.meals.map((m) => { const t = m.items.reduce((a, it) => ({ kcal: a.kcal + it.kcal, p: a.p + it.p, c: a.c + it.c, f: a.f + it.f }), { kcal: 0, p: 0, c: 0, f: 0 }); return { slot: m.slot, time: m.time || null, name: m.name, code: m.code || null, items: m.items, ...t }; }) })))]);
        if (rnd() < 0.4) await c.query(`INSERT INTO meal_plans (user_id, week_start, week_index, week_total, targets, days, status) VALUES ($1, $2, $3, 4, $4, $5, 'rascunho')`, [uid, proxSegunda, (wi % 4) + 1, JSON.stringify(exemplo.targets), '[]']);
        for (const s2 of exemplo.supplements.slice(0, 1 + Math.floor(rnd() * 3))) await c.query(`INSERT INTO supplements (user_id, name, dose, time, with_meal) VALUES ($1, $2, $3, $4, $5)`, [uid, s2.name, s2.dose, s2.time, s2.with_meal]);
      }

      // Registros: engajamento variado nos últimos 10 dias
      const engaj = rnd();
      for (let off = -9; off <= 0; off++) {
        if (rnd() > engaj) continue;
        for (const slot of Object.keys(cardapio)) {
          if (rnd() < 0.25) continue;
          const items = cardapio[slot]; const t = items.reduce((a, it) => ({ kcal: a.kcal + it.kcal, p: a.p + it.p, c: a.c + it.c, f: a.f + it.f }), { kcal: 0, p: 0, c: 0, f: 0 });
          const hora = { cafe: '07:20', almoco: '12:40', lanche_tarde: '16:10', jantar: '19:45' }[slot];
          await c.query(`INSERT INTO meal_entries (user_id, date, slot, source, items, kcal, p, c, f, logged_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [uid, dias(off), slot, pick(['plano', 'plano', 'foto', 'taco', 'whatsapp']), JSON.stringify(items), t.kcal, t.p, t.c, t.f, `${dias(off)}T${hora}:00-03:00`]);
        }
      }

      // Dúvidas: algumas pendentes, algumas respondidas
      if (rnd() < 0.35) {
        const { rows: [q] } = await c.query(`INSERT INTO lu_messages (user_id, kind, author, text, created_at) VALUES ($1, 'pergunta', 'cliente', $2, NOW() - ($3 || ' hours')::interval) RETURNING id`,
          [uid, pick(['Posso trocar o jantar de sexta por uma pizza? Vou sair com amigas.', 'O whey pode ser depois do treino em vez de no café?', 'Estou com muita fome à tarde. Posso aumentar o lanche?', 'Viajo semana que vem, como faço com o plano?', 'Não gostei do overnight. Tem outra opção de café?', 'Posso tomar café com adoçante?']), String(Math.floor(rnd() * 90))]);
        if (rnd() < 0.45) await c.query(`INSERT INTO lu_messages (user_id, kind, author, text, reply_to) VALUES ($1, 'resposta', 'nutri', $2, $3)`, [uid, 'Pode sim. Duas fatias, salada antes, e no dia seguinte volta pro plano normal.', q.id]);
      }
    }
    await c.query('COMMIT');
    console.log(`[seed-painel] ${N} clientes fictícias + nutrilu@nutrilualves.com.br (nutri) + raphael@nutrilualves.com.br (admin) no banco nutrilu_dev. Semana atual: ${segunda}.`);
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); await pool.end(); }
}

main().catch((e) => { console.error(e); process.exit(1); });
