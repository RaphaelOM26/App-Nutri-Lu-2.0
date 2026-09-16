// Envio de e-mail transacional (código de login).
//
// Por SMTP, e não por um provedor novo: a conta institucional
// (suporte@nutrilualves.com.br, no Titan) já existe e manda e-mail. Pro volume
// de códigos de login isso basta; se um dia passar de algumas centenas por dia,
// troca-se só esta função por um provedor de API (Resend, Postmark) — quem
// chama não muda.
//
// Variáveis (Railway):
//   SMTP_HOST   ex.: smtp.titan.email
//   SMTP_PORT   465 (SSL) ou 587 (STARTTLS)
//   SMTP_USER   o e-mail que envia
//   SMTP_PASS   a senha dele — NUNCA no chat, nunca no repositório
//   MAIL_FROM   opcional; padrão "Nutri Lu <SMTP_USER>"
//
// Sem SMTP configurado o envio falha com erro claro. Em desenvolvimento
// (ALLOW_DEV_LOGIN=1) o código vai pro log em vez de pro e-mail.

import nodemailer from 'nodemailer';

let transporter = null;

export function emailConfigurado() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

function escapar(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/**
 * Manda o código de login. Texto curto e sem link: código digitado é mais
 * simples de explicar pela Luciana e não cai em filtro de link suspeito.
 */
export async function enviarCodigoLogin({ para, codigo, nome }) {
  if (!emailConfigurado()) {
    if (process.env.ALLOW_DEV_LOGIN === '1') {
      console.warn(`[email] SMTP ausente — código de login de ${para}: ${codigo}`);
      return { enviado: false, dev: true };
    }
    throw Object.assign(new Error('Envio de e-mail não configurado no servidor'), {
      status: 500,
      code: 'SERVER_MISCONFIGURED',
    });
  }

  const from = process.env.MAIL_FROM || `Nutri Lu <${process.env.SMTP_USER}>`;
  const saudacao = nome ? `Oi, ${escapar(nome)}.` : 'Oi.';
  const texto = [
    nome ? `Oi, ${nome}.` : 'Oi.',
    '',
    `Seu código pra entrar na área de membros do Nutri Lu é: ${codigo}`,
    '',
    'Ele vale por 10 minutos e só funciona uma vez.',
    'Se não foi você que pediu, pode ignorar este e-mail.',
    '',
    'Lu Alves · Nutri Lu',
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1B1B1B;">
      <p style="font-size: 16px; margin: 0 0 16px;">${saudacao}</p>
      <p style="font-size: 16px; margin: 0 0 16px;">Seu código pra entrar na área de membros do Nutri Lu:</p>
      <p style="font-size: 36px; font-weight: 800; letter-spacing: 0.2em; margin: 0 0 16px; color: #12201A;">${escapar(codigo)}</p>
      <p style="font-size: 14px; color: #555; margin: 0 0 8px;">Ele vale por 10 minutos e só funciona uma vez.</p>
      <p style="font-size: 14px; color: #555; margin: 0 0 24px;">Se não foi você que pediu, pode ignorar este e-mail.</p>
      <p style="font-size: 14px; margin: 0;">Lu Alves · Nutri Lu</p>
    </div>`;

  await getTransporter().sendMail({
    from,
    to: para,
    subject: `${codigo} é o seu código do Nutri Lu`,
    text: texto,
    html,
  });
  return { enviado: true };
}

/**
 * Avisa a cliente que o plano da semana foi publicado pela Luciana. É o
 * aviso que o onboarding promete ("te aviso quando estiver pronto"); o de
 * WhatsApp entra quando o bot existir. Sem SMTP, só registra no log e segue:
 * publicar o plano nunca pode falhar por causa do e-mail.
 */
export async function enviarPlanoPronto({ para, nome, semana, link }) {
  if (!emailConfigurado()) {
    console.warn(`[email] SMTP ausente — aviso de plano pronto pra ${para} não enviado`);
    return { enviado: false };
  }
  const from = process.env.MAIL_FROM || `Nutri Lu <${process.env.SMTP_USER}>`;
  const oi = nome ? `Oi, ${nome}.` : 'Oi.';
  const url = link || 'https://nutrilualves.com.br/membros/plano';
  const texto = [
    oi, '',
    `Seu plano da semana${semana ? ` (${semana})` : ''} está pronto na área de membros.`,
    'Entra com o mesmo e-mail e vê refeição por refeição, com as porções e os horários.', '',
    url, '',
    'Qualquer dúvida, me chama por lá.', 'Lu Alves · Nutri Lu',
  ].join('\n');
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1B1B1B;">
      <p style="font-size: 16px; margin: 0 0 16px;">${escapar(oi)}</p>
      <p style="font-size: 16px; margin: 0 0 16px;">Seu plano da semana${semana ? ` (${escapar(semana)})` : ''} está pronto na área de membros. Entra com o mesmo e-mail e vê refeição por refeição, com as porções e os horários.</p>
      <p style="margin: 0 0 24px;"><a href="${escapar(url)}" style="display: inline-block; background: #6F8C68; color: #fff; text-decoration: none; font-weight: 700; padding: 12px 20px; border-radius: 100px;">Ver meu plano</a></p>
      <p style="font-size: 14px; color: #555; margin: 0 0 8px;">Qualquer dúvida, me chama por lá.</p>
      <p style="font-size: 14px; margin: 0;">Lu Alves · Nutri Lu</p>
    </div>`;
  await getTransporter().sendMail({ from, to: para, subject: 'Seu plano da semana está pronto', text: texto, html });
  return { enviado: true };
}
