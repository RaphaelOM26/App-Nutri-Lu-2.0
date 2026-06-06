// Avatar da Lu (mascote do app).
//
// Hoje (2026-06-05): renderiza só o placeholder (círculo sage com "L" centralizado).
// Decisão do Raphael: a versão Pixar/Disney da Luciana ficou fora pra v0.2, quando
// vamos ter um avatar ANIMADO (que se move, expressa) em vez de foto 3D estática —
// estática soa "Cal AI genérico" e quebra a personalidade da Lu como assistente real.
//
// Os PNGs continuam em `assets/lu/` pra quando virar Lottie ou re-render animado.
// Pra re-habilitar a versão Pixar: descomenta o POSE_ASSETS abaixo e a render da Image.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme, FONT } from '../theme';

export type LuPose = 'default' | 'welcoming' | 'celebrating' | 'thinking';

// const POSE_ASSETS: Record<LuPose, ImageSourcePropType> = {
//   default: require('../assets/lu/lu-default.png'),
//   welcoming: require('../assets/lu/lu-welcoming.png'),
//   celebrating: require('../assets/lu/lu-celebrating.png'),
//   thinking: require('../assets/lu/lu-thinking.png'),
// };

type Props = {
  /** Pose semântica — usada quando os assets animados existirem. Hoje todas renderizam o mesmo placeholder. */
  pose?: LuPose;
  size?: number;
  /** Se passado, vira Pressable. */
  onPress?: () => void;
  /** Override do fallback (default: letra "L"). */
  fallbackLetter?: string;
};

export const LuAvatar: React.FC<Props> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pose = 'default',
  size = 64,
  onPress,
  fallbackLetter = 'L',
}) => {
  const theme = useTheme();
  const fontSize = size * 0.42;

  const content = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Text
        style={{
          fontFamily: FONT.headExtra,
          fontWeight: '800',
          fontSize,
          color: theme.primaryDeep,
        }}
      >
        {fallbackLetter}
      </Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Lu — assistente de nutrição"
      accessibilityRole="image"
    >
      {content}
    </Pressable>
  );
};
