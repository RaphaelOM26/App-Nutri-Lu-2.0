// Sessão da comunidade (Sign in with Apple / Google).
//
// Store minimalista fora do AppContext: a sessão é ortogonal ao estado de
// refeições/receitas e só é exigida pelas ações da comunidade (publicar,
// avaliar). Padrão subscribe + useSyncExternalStore — mesma ideia dos stores
// compartilhados das telas do plano.
//
// O token JWT emitido pelo NOSSO backend (180 dias) fica no AsyncStorage.
// No boot, hydrateAuth() restaura a sessão e valida em background via
// /auth/me — se o backend disser 401, deslogamos silenciosamente.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useSyncExternalStore } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { socialLogin, fetchMe, type AuthUser } from '../api/client';
import { getDeviceId } from '../storage/deviceId';

const STORAGE_KEY = '@nutri-lu/auth-session';

export type AuthSession = { token: string; user: AuthUser };

let session: AuthSession | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthSession(): AuthSession | null {
  return session;
}

/** Hook: sessão atual (null = deslogado). Re-renderiza em login/logout. */
export function useAuthSession(): AuthSession | null {
  return useSyncExternalStore(subscribeAuth, getAuthSession, getAuthSession);
}

async function setSession(next: AuthSession | null) {
  session = next;
  if (next) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
  emit();
}

/** Restaura a sessão do AsyncStorage no boot + revalida em background. */
export async function hydrateAuth(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    session = JSON.parse(raw) as AuthSession;
    emit();
    // Validação em background — não bloqueia o boot. Só desloga se o backend
    // rejeitar o token de fato (401); falha de rede mantém a sessão local.
    fetchMe(session.token)
      .then((user) => setSession({ token: session!.token, user }))
      .catch((e) => {
        if (e?.status === 401) setSession(null);
      });
  } catch {
    // storage corrompido — segue deslogado
  }
}

// ─── Login nativo ───────────────────────────────────────────────

// Web client ID do Google Cloud (OAuth 2.0). É o MESMO nos dois SOs — o token
// é emitido com audience = web client, e é essa audience que o backend valida.
// Fallback fixo (mesmo padrão do client.ts): não é segredo — vai embutido em
// todo bundle — e garante que um `eas update` rodado sem env não quebre o login.
const PRODUCTION_GOOGLE_WEB_CLIENT_ID =
  '383069892255-ble4f72d3j6iia28at1uofu77acputpr.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || PRODUCTION_GOOGLE_WEB_CLIENT_ID;
let googleConfigured = false;

// Require PREGUIÇOSO do módulo nativo: @react-native-google-signin NÃO existe
// no Expo Go — um import estático crasharia o app no boot (authState é
// importado pelo AppContext). Carregando só quando a pessoa toca em "Entrar
// com Google", o Expo Go continua funcionando (com erro amigável), e o dev
// build/produção usa o módulo real.
function loadGoogleModule(): typeof import('@react-native-google-signin/google-signin') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-google-signin/google-signin');
  } catch {
    throw new Error('Login Google precisa do app instalado (não funciona no Expo Go).');
  }
}

function ensureGoogleConfigured(google: ReturnType<typeof loadGoogleModule>) {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      'Login Google ainda não configurado neste build (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ausente).',
    );
  }
  if (!googleConfigured) {
    google.GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
    googleConfigured = true;
  }
}

/** Sign in with Apple (só iOS). Retorna a sessão ou null se o usuário cancelou. */
export async function signInWithApple(): Promise<AuthSession | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) throw new Error('Apple não retornou o token de identidade.');
    // Nome só vem no PRIMEIRO login com o app — capturamos e mandamos pro
    // backend guardar; nas próximas vezes fullName vem null e tudo bem.
    const name = [credential.fullName?.givenName, credential.fullName?.familyName]
      .filter(Boolean)
      .join(' ');
    const deviceId = await getDeviceId();
    const result = await socialLogin({
      provider: 'apple',
      identityToken: credential.identityToken,
      displayName: name || undefined,
      deviceId,
    });
    await setSession(result);
    return result;
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED') return null;
    throw e;
  }
}

/** Google Sign-In (Android e iOS). Retorna a sessão ou null se cancelou. */
export async function signInWithGoogle(): Promise<AuthSession | null> {
  const google = loadGoogleModule();
  ensureGoogleConfigured(google);
  try {
    await google.GoogleSignin.hasPlayServices();
    const response = await google.GoogleSignin.signIn();
    if (!google.isSuccessResponse(response)) return null; // usuário cancelou
    const idToken = response.data.idToken;
    if (!idToken) throw new Error('Google não retornou o idToken — confira o webClientId.');
    const deviceId = await getDeviceId();
    const result = await socialLogin({
      provider: 'google',
      identityToken: idToken,
      displayName: response.data.user.name || undefined,
      deviceId,
    });
    await setSession(result);
    return result;
  } catch (e: any) {
    if (e?.code === google.statusCodes.SIGN_IN_CANCELLED) return null;
    throw e;
  }
}

/** Apple Sign-In disponível? (iOS 13+; false no Android). */
export async function appleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function signOut(): Promise<void> {
  try {
    if (googleConfigured) await loadGoogleModule().GoogleSignin.signOut();
  } catch {
    // sign-out do Google é best-effort — a sessão que importa é a nossa
  }
  await setSession(null);
}
