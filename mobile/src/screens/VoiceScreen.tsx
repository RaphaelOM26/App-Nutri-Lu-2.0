// Tela de voz — UI mock (sem backend de STT no MVP).
// Porte simplificado do VoiceScreen em screens-camera.jsx.

import React from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Btn } from '../components/Btn';
import { Icon } from '../components/Icons';

export const VoiceScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader title="Diga o que comeu" left={[<IconBtn key="close" icon={Icon.close} onPress={() => nav.goBack()} />]} />
      <View style={{ flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 70,
              backgroundColor: theme.primary,
              opacity: 0.18,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              right: 14,
              bottom: 14,
              borderRadius: 56,
              backgroundColor: theme.primarySoft,
              opacity: 0.8,
            }}
          />
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.text,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.mic size={32} color={theme.bg} stroke={2} />
          </View>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: FONT.head, fontSize: 18, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
            Captura por voz em breve
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center', maxWidth: 280 }}>
            No MVP, essa tela é só visual. Em breve a Lu vai transcrever sua refeição e adicionar ao diário automaticamente.
          </Text>
        </View>
        <Btn variant="outline" onPress={() => Alert.alert('Em breve!', 'Transcrição por voz chega na v2.')}>
          Entendi
        </Btn>
      </View>
    </SafeAreaView>
  );
};
