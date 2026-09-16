// Fotos no Cloudflare R2 (armazenamento de arquivos compatível com S3).
//
// Por que fora do Postgres: o backup diário do banco vai como JSON pro GitHub
// (scripts/backup.mjs). Foto dentro do banco estouraria esse backup em poucos
// dias e tornaria a restauração lenta. Arquivo é arquivo; o banco guarda só a
// CHAVE (photo_key) e o R2 guarda os bytes.
//
// Fluxo de upload: o navegador pede uma URL assinada (PUT) ao servidor, manda
// o arquivo DIRETO pro R2 com ela, e depois registra a chave na rota da
// feature. O servidor nunca recebe os bytes — nem custa banda nem memória.
//
// Leitura: URL assinada de GET, com validade curta. As fotos são dado sensível
// (corpo, prato) e o bucket fica PRIVADO — nada de r2.dev público.
//
// Variáveis (Railway):
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET

import crypto from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let client = null;

// ─── Modo local (só desenvolvimento) ──────────────────────────────────────
// Com FOTOS_LOCAL_DIR definido, as fotos vão pra uma pasta no disco e são
// servidas pelo próprio servidor em /dev-fotos/<chave>. Mesmo contrato das
// URLs assinadas do R2, então a web não sabe a diferença. Nunca em produção.
const LOCAL_DIR = process.env.FOTOS_LOCAL_DIR || null;
const localBase = () => process.env.FOTOS_LOCAL_URL || `http://localhost:${process.env.PORT || 3001}`;
export function fotosLocais() { return Boolean(LOCAL_DIR); }
export function pastaLocal() { return LOCAL_DIR; }

export function r2Configurado() {
  if (LOCAL_DIR) return true;
  return Boolean(
    process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET,
  );
}

function getClient() {
  if (client) return client;
  if (!r2Configurado()) {
    throw Object.assign(new Error('Armazenamento de fotos não configurado no servidor'), {
      status: 503,
      code: 'R2_OFF',
    });
  }
  client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  return client;
}

const TIPOS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const TAMANHO_MAX = 8 * 1024 * 1024;

/**
 * Chave nova pra um arquivo da cliente. A pasta é o id dela, então listar ou
 * apagar tudo de uma pessoa (exclusão de conta) é uma operação por prefixo.
 */
export function novaChave(userId, pasta, contentType) {
  const ext = TIPOS[contentType];
  if (!ext) {
    throw Object.assign(new Error('Formato de imagem não aceito (use JPEG, PNG ou WebP)'), { status: 400, code: 'BAD_REQUEST' });
  }
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${userId}/${pasta}/${stamp}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
}

const ARQUIVOS = { 'application/pdf': 'pdf' };
const ARQUIVO_MAX = 25 * 1024 * 1024;

/**
 * Chave nova pra um arquivo GLOBAL do painel (materiais em PDF). Fica fora
 * das pastas por cliente de propósito: não é de ninguém, é da Lu.
 */
export function novaChaveArquivo(pasta, contentType, tamanho) {
  const ext = ARQUIVOS[contentType];
  if (!ext) throw Object.assign(new Error('Formato não aceito (envie um PDF)'), { status: 400, code: 'BAD_REQUEST' });
  if (tamanho && tamanho > ARQUIVO_MAX) throw Object.assign(new Error('Arquivo grande demais (máximo 25 MB)'), { status: 400, code: 'BAD_REQUEST' });
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${pasta}/${stamp}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
}

/** URL assinada pra o navegador fazer PUT do arquivo. Vale 10 minutos. */
export async function urlDeUpload({ key, contentType, tamanho }) {
  const limite = ARQUIVOS[contentType] ? ARQUIVO_MAX : TAMANHO_MAX;
  if (tamanho && tamanho > limite) {
    throw Object.assign(new Error('Imagem grande demais (máximo 8 MB)'), { status: 400, code: 'BAD_REQUEST' });
  }
  if (LOCAL_DIR) return { url: `${localBase()}/dev-fotos/${key}`, key };
  const cmd = new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: contentType });
  const url = await getSignedUrl(getClient(), cmd, { expiresIn: 600 });
  return { url, key };
}

/** URL assinada pra exibir a foto. Vale 1 hora. */
export async function urlDeLeitura(key) {
  if (!key) return null;
  if (LOCAL_DIR) return `${localBase()}/dev-fotos/${key}`;
  const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key });
  return getSignedUrl(getClient(), cmd, { expiresIn: 3600 });
}

export async function apagar(key) {
  if (!key) return;
  if (LOCAL_DIR) { const { unlink } = await import('node:fs/promises'); await unlink(`${LOCAL_DIR}/${key}`).catch(() => {}); return; }
  await getClient().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
}

if (r2Configurado()) console.log('[r2] armazenamento de fotos configurado');
else console.warn('[r2] R2 ausente — upload de fotos indisponível');
