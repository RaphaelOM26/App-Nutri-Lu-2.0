// Imagem de comida do Unsplash — usa o mapa em mockData.unsplashUrl.
// Suporta passar `src` direto (URL/data:) OU `q` (tokens).

import React from 'react';
import { Image, View, type ImageStyle, type StyleProp } from 'react-native';
import { unsplashUrl } from '../data/mockData';

type Props = {
  q?: string;
  w?: number | string;
  h?: number | string;
  /**
   * URL/data: OU asset empacotado. O require() do Metro devolve um número, e é
   * assim que as fotos das 153 receitas do livro chegam aqui — sem passar por
   * rede, então elas aparecem mesmo offline.
   */
  src?: string | number;
  alt?: string;
  style?: StyleProp<ImageStyle>;
};

export const FoodImg: React.FC<Props> = ({ q, w = 200, h = 200, src, style }) => {
  const wPx = typeof w === 'number' ? w : 400;
  const hPx = typeof h === 'number' ? h : 400;
  const source =
    typeof src === 'number' ? src : { uri: (src as string) || unsplashUrl(q, wPx, hPx) };

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
      <Image source={source} style={[{ width: '100%', height: '100%' }, style]} resizeMode="cover" />
    </View>
  );
};
