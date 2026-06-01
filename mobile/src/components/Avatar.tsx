// Avatar de perfil reusável. Mostra a foto se houver, senão as iniciais
// sobre o fundo sage primarySoft. Suporta tap opcional pra trocar a foto.

import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useTheme, FONT } from '../theme';

type Props = {
  uri?: string | null;
  initials: string;
  size?: number;
  onPress?: () => void;
};

export const Avatar: React.FC<Props> = ({ uri, initials, size = 64, onPress }) => {
  const theme = useTheme();
  const fontSize = size * 0.38;

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
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text style={{ fontFamily: FONT.headExtra, fontWeight: '800', fontSize, color: theme.primaryDeep }}>
          {initials}
        </Text>
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} accessibilityLabel="Trocar foto de perfil">
      {content}
    </Pressable>
  );
};
