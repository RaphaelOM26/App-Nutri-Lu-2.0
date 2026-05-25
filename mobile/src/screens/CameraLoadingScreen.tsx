// Loading enquanto a IA processa a foto.
// Recebe { imageBase64, mode } e:
//   - mode 'recipe' → POST /extract-recipe (image) → navega para RecipeDetail
//   - mode 'food'   → POST /analyze-food         → navega para CameraResult

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { Icon } from '../components/Icons';
import { extractRecipe, analyzeFood, ApiError } from '../api/client';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CameraLoading'>;
type Rt = RouteProp<RootStackParamList, 'CameraLoading'>;

export const CameraLoadingScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<Rt>();
  const nav = useNavigation<Nav>();
  const { imageBase64, mode, mealId } = route.params;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (mode === 'recipe') {
          const recipe = await extractRecipe('image', imageBase64);
          if (cancelled) return;
          const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
          nav.replace('RecipeDetail', { extracted: { ...recipe, imageDataUrl } });
        } else {
          const analysis = await analyzeFood(imageBase64);
          if (cancelled) return;
          const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
          nav.replace('CameraResult', { analysis, imageDataUrl, mealId });
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erro desconhecido';
        Alert.alert(
          'Não consegui processar',
          msg,
          [{ text: 'Voltar', onPress: () => nav.goBack() }],
          { cancelable: false },
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageBase64, mode, mealId, nav]);

  return (
    <View style={{ flex: 1, backgroundColor: '#1B1B1B', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#97AF8F" />
        <View style={{ position: 'absolute' }}>
          <Icon.sparkle size={28} color="#97AF8F" stroke={2} />
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>
          {mode === 'recipe' ? 'Extraindo receita' : 'Analisando seu prato'}
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
          {mode === 'recipe' ? 'Lendo ingredientes e passos…' : 'Identificando ingredientes e porções…'}
        </Text>
      </View>
      <Pressable
        onPress={() => nav.goBack()}
        style={{ position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon.close size={20} color="#fff" />
      </Pressable>
    </View>
  );
};
