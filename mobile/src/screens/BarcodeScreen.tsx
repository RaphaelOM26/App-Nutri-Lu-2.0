// Scanner de código de barras — UI mock (sem leitura real no MVP).

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, FONT } from '../theme';
import { Icon } from '../components/Icons';
import { Btn } from '../components/Btn';

export const BarcodeScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: '#0E0F0F', justifyContent: 'center', padding: 24, gap: 18, alignItems: 'center' }}>
      <Pressable
        onPress={() => nav.goBack()}
        style={{
          position: 'absolute',
          top: 50,
          left: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.close size={20} color="#fff" />
      </Pressable>

      <View
        style={{
          width: 260,
          height: 140,
          borderRadius: 16,
          borderWidth: 3,
          borderColor: theme.primary,
          borderStyle: 'dashed',
        }}
      />
      <Text style={{ fontFamily: FONT.head, fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center' }}>
        Scanner em breve
      </Text>
      <Text style={{ fontFamily: FONT.body, fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: 300 }}>
        Por enquanto, use a busca de alimentos. A leitura de código de barras vem na v2.
      </Text>
      <Btn variant="outline" onPress={() => nav.goBack()}>
        Voltar
      </Btn>
    </View>
  );
};
