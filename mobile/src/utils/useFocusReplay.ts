// Hook que retorna um número que incrementa toda vez que a tela ganha foco
// (exceto na primeira vez, que é o mount inicial).
//
// Usado pra "re-disparar" animações de entrada: passe o valor como `key` num
// componente animado e ele será re-montado a cada navegação de volta pra tela,
// fazendo as animações tocarem novamente.
//
// Exemplo:
//   const replay = useFocusReplay();
//   <ConcentricRings key={`rings-${replay}`} ... />

import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useFocusReplay(): number {
  const counter = useRef(0);
  const [renderKey, setRenderKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      // Primeira chamada = mount inicial, não precisa re-renderizar
      // (a animação vai tocar naturalmente quando o componente montar).
      if (counter.current === 0) {
        counter.current = 1;
        return;
      }
      // Focos subsequentes incrementam o key, forçando re-mount dos filhos
      counter.current += 1;
      setRenderKey(counter.current);
    }, []),
  );

  return renderKey;
}
