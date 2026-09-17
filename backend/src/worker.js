// Trabalhador da fila do WhatsApp como processo PRÓPRIO.
//
// Por padrão o trabalhador roda dentro do servidor web (src/index.js). Quando
// o volume pedir, cria-se um segundo serviço no Railway com `npm run worker`
// e põe-se WHATSAPP_WORKER=0 no serviço web: o site para de disputar CPU e
// conexão de banco com a IA das fotos. A fila é a mesma (Postgres), e vários
// trabalhadores podem puxar dela ao mesmo tempo.

import 'dotenv/config';
import { registrarExecutor, iniciarTrabalhador } from './services/whatsapp/fila.js';
import { processarMensagem, avisarFalha } from './services/whatsapp/bot.js';
import { executarAviso } from './services/whatsapp/avisos.js';
import { executarConvite, marcarConviteFalho } from './services/whatsapp/convites.js';

if (!process.env.DATABASE_URL) { console.error('DATABASE_URL ausente'); process.exit(1); }
registrarExecutor('mensagem', processarMensagem, avisarFalha);
registrarExecutor('aviso', executarAviso);
registrarExecutor('convite', executarConvite, marcarConviteFalho);
iniciarTrabalhador();
// Os timers da fila são unref(): sem isto o processo sairia na hora.
setInterval(() => {}, 60 * 60 * 1000);
