// Estado do acesso pago (o "acompanhamento").
//
// Três valores, e o terceiro é o que evita estrago:
//   true  → tem acesso
//   false → não tem
//   null  → AINDA NÃO SEI
//
// O `null` importa porque o app roda anônimo por padrão: sem conta não dá pra
// perguntar ao servidor. Nesse estado a tela segue tentando normalmente, e é o
// próprio backend que decide — se responder 402, a gente aprende e guarda.
// Assim o app se comporta exatamente como hoje enquanto o gate estiver
// desligado, e passa a esconder o que é pago no instante em que ele ligar,
// sem precisar de outra versão.

import { useSyncExternalStore } from 'react';
import { fetchAccess, onPremiumRequired } from '../api/client';
import { getAuthSession, subscribeAuth } from './authState';

type Acesso = { acesso: boolean; validoAte?: string | null } | null;

let estado: Acesso = null;
const ouvintes = new Set<() => void>();

const emitir = () => ouvintes.forEach((l) => l());

export function subscribeAccess(l: () => void): () => void {
  ouvintes.add(l);
  return () => ouvintes.delete(l);
}

export const getAccess = (): Acesso => estado;

/** Hook: `null` = desconhecido, não trate como "não tem". */
export function useAccess(): Acesso {
  return useSyncExternalStore(subscribeAccess, getAccess, getAccess);
}

/** Conveniência pra tela: só esconde o que é pago quando SABE que não tem. */
export function useSemAcesso(): boolean {
  return useAccess()?.acesso === false;
}

/** Pergunta ao servidor. Sem sessão não há o que perguntar — volta a não saber. */
export async function refreshAccess(): Promise<void> {
  const sessao = getAuthSession();
  if (!sessao) {
    estado = null;
    emitir();
    return;
  }
  try {
    estado = await fetchAccess(sessao.token);
  } catch {
    // Falha de rede não é "não tem acesso" — seria cruel tirar o conteúdo de
    // quem pagou porque o wi-fi caiu. Mantém o que já sabia.
  }
  emitir();
}

// Qualquer rota paga que responder 402 atualiza o estado, venha de onde vier.
// Centralizar aqui significa que uma rota paga nova entra coberta sem ninguém
// lembrar de tratá-la.
onPremiumRequired(() => {
  if (estado?.acesso !== false) {
    estado = { acesso: false };
    emitir();
  }
});

// Login e logout mudam quem é a pessoa, então mudam o acesso.
subscribeAuth(() => {
  refreshAccess();
});

// Consulta inicial. Cobre a corrida em que a sessão guardada é restaurada ANTES
// deste módulo carregar — nesse caso o evento já passou e a assinatura acima
// nunca dispararia. Sem sessão, é um no-op que só confirma "ainda não sei".
refreshAccess();
