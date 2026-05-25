// Entry point do servidor Express.
// Carrega .env, configura middleware, registra rotas e sobe o servidor.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import extractRecipeRouter from './routes/extractRecipe.js';
import analyzeFoodRouter from './routes/analyzeFood.js';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
// Limite alto pra acomodar imagens base64 (foto comum de celular ~2-4MB → base64 ~3-6MB)
app.use(express.json({ limit: '15mb' }));

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🥗 Nutri Lu Backend rodando em http://0.0.0.0:${PORT}`);
  console.log(`   Modelo: ${process.env.OPENAI_MODEL || 'gpt-5.4-mini'}`);
  console.log(`   Health: http://0.0.0.0:${PORT}/health\n`);
});
