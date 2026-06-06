// Tela 2 do onboarding — Nome (+ foto opcional).
// CTA habilita só se nome >= 2 chars. Foto opcional via expo-image-picker (TODO).

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../state/AppContext';
import { useTheme, FONT } from '../../theme';
import {
  OnboardingScreen,
  OnboardingTitle,
  OnboardingSubtitle,
} from '../../components/OnboardingScreen';
import { Icon } from '../../components/Icons';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export const OnboardingNameScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const { name, setName, profilePhotoUri, setProfilePhoto } = useApp();
  const [local, setLocal] = useState(name ?? '');

  const canContinue = local.trim().length >= 2;

  const handleContinue = () => {
    setName(local.trim());
    nav.navigate('Gender');
  };

  const initial = local.trim().charAt(0).toUpperCase();

  // Abre a galeria — picker nativo lida com permissão (pede se necessário).
  // Crop quadrado pra encaixar bem no círculo do avatar. Se user cancela, no-op.
  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('[onboarding] image picker falhou:', err);
    }
  };

  return (
    <OnboardingScreen
      step={1}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      ctaDisabled={!canContinue}
      onCta={handleContinue}
    >
      <OnboardingTitle>Como devo te chamar?</OnboardingTitle>
      <OnboardingSubtitle>Vou usar pra deixar tudo mais pessoal.</OnboardingSubtitle>

      <View style={{ alignItems: 'center', marginTop: 32, gap: 24 }}>
        {/* Avatar — tap abre galeria. Mostra foto se já escolheu, senão inicial OU ícone câmera.
            Pressable é maior (140) que o círculo (120) pra abrigar o badge que fica meio dentro,
            meio fora — o círculo interno tem overflow:hidden pra clipar a Image, o badge fica
            num View irmão sem clipping. */}
        <Pressable
          onPress={pickPhoto}
          accessibilityLabel="Adicionar foto de perfil"
          accessibilityRole="button"
          style={({ pressed }) => ({
            width: 140,
            height: 140,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          {/* Círculo interno com clipping pra Image respeitar o redondo */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme.bgSubtle,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={{ width: 120, height: 120 }} resizeMode="cover" />
            ) : initial ? (
              <Text
                style={{
                  fontFamily: FONT.headExtra,
                  fontSize: 48,
                  color: theme.primary,
                }}
              >
                {initial}
              </Text>
            ) : (
              <Icon.camera size={36} color={theme.textFaint} stroke={1.75} />
            )}
          </View>

          {/* Badge "+" — fica IRMÃO do círculo interno, então não é clipado.
              Posição calculada pra centro do badge cair na borda diagonal SE do círculo
              (45° ≈ x:111, y:111 num círculo de raio 60 centralizado no 140x140 wrapper). */}
          <View
            style={{
              position: 'absolute',
              bottom: 11,
              right: 11,
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: theme.primary,
              borderWidth: 3,
              borderColor: theme.bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.plus size={16} color="#fff" stroke={2.5} />
          </View>
        </Pressable>

        <TextInput
          value={local}
          onChangeText={setLocal}
          placeholder="Seu nome"
          placeholderTextColor={theme.textFaint}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={canContinue ? handleContinue : undefined}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 16,
            backgroundColor: theme.bgElev,
            borderWidth: 1,
            borderColor: theme.border,
            paddingHorizontal: 18,
            fontFamily: FONT.head,
            fontSize: 17,
            color: theme.text,
          }}
        />
      </View>
    </OnboardingScreen>
  );
};
