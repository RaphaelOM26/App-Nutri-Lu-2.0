// Entry point do servidor Express.
// Carrega .env, configura middleware, registra rotas e sobe o servidor.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initSchema } from './db.js';
import extractRecipeRouter from './routes/extractRecipe.js';
import analyzeFoodRouter from './routes/analyzeFood.js';
import chatRouter from './routes/chat.js';
import insightRouter from './routes/insight.js';
import dayReviewRouter from './routes/dayReview.js';
import transcribeMealRouter from './routes/transcribeMeal.js';
import daySnapshotRouter from './routes/daySnapshot.js';
import generateRecipeImageRouter from './routes/generateRecipeImage.js';
import authRouter from './routes/auth.js';
import communityRouter from './routes/community.js';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
// Limite alto pra acomodar imagens base64 (foto comum de celular ~2-4MB → base64 ~3-6MB)
app.use(express.json({ limit: '15mb' }));

// Logging leve de requisições — método, rota, status e latência de cada
// chamada. Faz os logs do Railway virarem úteis pra monitorar o tráfego real
// do beta dos 20. Pula /health pra não poluir com os healthchecks do Railway.
// NÃO loga body: as rotas recebem foto/áudio em base64 — só metadados aqui.
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const start = Date.now();
  // Captura método e path AGORA: quando o res 'finish' dispara, a requisição
  // já está dentro do router montado e o Express reescreveu req.url pra '/'
  // (perdíamos o endpoint, tudo logava como "POST /"). req.path aqui ainda é
  // o caminho completo (ex: /analyze-food).
  const method = req.method;
  const path = req.path;
  res.on('finish', () => {
    const ms = Date.now() - start;
    const cl = Number(req.headers['content-length']);
    const size = cl ? `${(cl / 1024).toFixed(0)}KB` : '-';
    console.log(`[req] ${method} ${path} → ${res.statusCode} ${ms}ms (in ${size})`);
  });
  next();
});

// Healthcheck — útil pra confirmar que o Expo Go consegue alcançar o backend
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
    timestamp: new Date().toISOString(),
  });
});

// Rotas de IA
app.use('/extract-recipe', extractRecipeRouter);
app.use('/analyze-food', analyzeFoodRouter);
app.use('/chat', chatRouter);
app.use('/insight', insightRouter);
app.use('/day-review', dayReviewRouter);
app.use('/transcribe-meal', transcribeMealRouter);
app.use('/day-snapshot', daySnapshotRouter);
app.use('/generate-recipe-image', generateRecipeImageRouter);
app.use('/auth', authRouter);
app.use('/community', communityRouter);

// Handler de erro padrão (último na cadeia)
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    code: err.code || 'INTERNAL_ERROR',
  });
});

// Validação de env crítica
if (!process.env.OPENAI_API_KEY) {
  console.error('\n❌ OPENAI_API_KEY não está definida no .env');
  console.error('   Copie .env.example para .env e adicione sua chave.\n');
  process.exit(1);
}

// Bootstrap do DB e listen. Se DATABASE_URL não estiver configurada, logamos
// warning mas seguimos com o servidor de pé — endpoints de IA continuam OK,
// só /day-snapshot vai devolver 500 até a env ser configurada. Isso garante
// que um restart do Railway durante config inicial não trave tudo.
async function start() {
  if (process.env.DATABASE_URL) {
    try {
      await initSchema();
    } catch (e) {
      console.error('[boot] falha ao inicializar schema:', e.message);
    }
  } else {
    console.warn('[boot] DATABASE_URL ausente — endpoints /day-snapshot vão falhar');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🥗 Nutri Lu Backend rodando em http://0.0.0.0:${PORT}`);
    console.log(`   Modelo: ${process.env.OPENAI_MODEL || 'gpt-5.4-mini'}`);
    console.log(`   Health: http://0.0.0.0:${PORT}/health\n`);
  });
}

start();
