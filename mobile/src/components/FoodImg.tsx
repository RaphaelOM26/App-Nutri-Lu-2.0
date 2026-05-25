// Imagem de comida do Unsplash — usa o mapa em mockData.unsplashUrl.
// Suporta passar `src` direto (URL/data:) OU `q` (tokens).

import React from 'react';
import { Image, View, type ImageStyle, type StyleProp } from 'react-native';
import { unsplashUrl } from '../data/mockData';

type Props = {
  q?: string;
  w?: number | string;
  h?: number | string;
  src?: string;
  alt?: string;
  style?: StyleProp<ImageStyle>;
};

export const FoodImg: React.FC<Props> = ({ q, w = 200, h = 200, src, style }) => {
  const wPx = typeof w === 'number' ? w : 400;
  const hPx = typeof h === 'number' ? h : 400;
  const url = src || unsplashUrl(q, wPx, hPx);

  // Width/height pode ser número ou '100%'. Aplicamos no wrapper.
  return (
    <View
      style={{
        width: w as any,
        height: h as any,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#D6E0CF',
      }}
    >
      <Image source={{ uri: url }} style={[{ width: '100%', height: '100%' }, style]} resizeMode="cover" />
    </View>
  );
};
