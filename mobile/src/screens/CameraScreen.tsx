// Tela de câmera (Foto IA) — usa expo-camera para preview ao vivo e
// expo-image-picker como atalho de galeria. Após captura, navega para
// CameraLoading com a foto em base64.
//
// Modos:
//   - 'food'   → análise de prato (default — chamada pelo FAB)
//   - 'recipe' → OCR de receita (chamado pelo ImportRecipe)

import React, { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { Btn } from '../components/Btn';
import { Icon } from '../components/Icons';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Camera'>;
type Rt = RouteProp<RootStackParamList, 'Camera'>;

export const CameraScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<Rt>();
  const nav = useNavigation<Nav>();
  const mode = route.params?.mode || 'food';
  const mealId = route.params?.mealId;
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Cor dos cantos da mira muda conforme o modo
  const accentColor = '#97AF8F';

  // Ainda não decidiu permissão — mostra loading
  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1B1B1B', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Permissão negada
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, padding: 24, justifyContent: 'center', gap: 16 }}>
        <Icon.camera size={48} color={theme.primary} stroke={1.5} />
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: theme.text }}>
          Precisamos da câmera
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 14, color: theme.textMuted, lineHeight: 20 }}>
          Permita o acesso para fotografar suas receitas e pratos. Você pode revogar nas configurações do app a qualquer momento.
        </Text>
        <Btn variant="primary" full onPress={requestPermission}>
          Permitir câmera
        </Btn>
        <Btn variant="outline" full onPress={() => nav.goBack()}>
          Cancelar
        </Btn>
      </View>
    );
  }

  const captureFromCamera = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!photo?.base64) throw new Error('Falha ao capturar foto.');
      nav.replace('CameraLoading', { imageBase64: photo.base64, mode, mealId });
    } catch (err) {
      Alert.alert('Erro ao capturar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!lib.granted) {
        Alert.alert('Galeria bloqueada', 'Permita acesso à galeria nas configurações.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.7,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Erro', 'Não foi possível ler a foto.');
        return;
      }
      nav.replace('CameraLoading', { imageBase64: asset.base64, mode, mealId });
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
    }
  };

  const tip =
    mode === 'recipe'
      ? 'Centralize a receita escrita na moldura'
      : 'Foto de cima funciona melhor';
  const title = mode === 'recipe' ? 'Foto de receita' : 'Foto IA';

  return (
    <View style={{ flex: 1, backgroundColor: '#1B1B1B' }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        enableTorch={torch}
      />

      {/* Overlay top bar */}
      <View
        style={{
          position: 'absolute',
          top: 50,
          left: 16,
          right: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Pressable
          onPress={() => nav.goBack()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon.close size={20} color="#fff" />
        </Pressable>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.45)',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 100,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon.sparkle size={14} color="#fff" />
          <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 12, fontWeight: '600', color: '#fff' }}>{title}</Text>
        </View>
        <Pressable
          onPress={() => setTorch((t) => !t)}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
        >
          {torch ? <Icon.flash size={20} color="#fff" /> : <Icon.flashOff size={20} color="#fff" />}
        </Pressable>
      </View>

      {/* Mira */}
      <View
        style={{
          position: 'absolute',
          top: '22%',
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
        pointerEvents="none"
      >
        <View style={{ width: 240, height: 240, position: 'relative' }}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => {
            const style: any = { position: 'absolute', width: 28, height: 28 };
            if (c === 'tl') { style.top = 0; style.left = 0; style.borderTopWidth = 3; style.borderLeftWidth = 3; style.borderTopLeftRadius = 12; }
            if (c === 'tr') { style.top = 0; style.right = 0; style.borderTopWidth = 3; style.borderRightWidth = 3; style.borderTopRightRadius = 12; }
            if (c === 'bl') { style.bottom = 0; style.left = 0; style.borderBottomWidth = 3; style.borderLeftWidth = 3; style.borderBottomLeftRadius = 12; }
            if (c === 'br') { style.bottom = 0; style.right = 0; style.borderBottomWidth = 3; style.borderRightWidth = 3; style.borderBottomRightRadius = 12; }
            return <View key={c} style={[style, { borderColor: '#fff' }]} />;
          })}
        </View>
      </View>

      {/* Tip */}
      <View style={{ position: 'absolute', top: '52%', left: 0, right: 0, alignItems: 'center' }} pointerEvents="none">
        <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: '#fff' }}>{tip}</Text>
        </View>
      </View>

      {/* Bottom controls */}
      <View
        style={{
          position: 'absolute',
          bottom: 50,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
        }}
      >
        <View style={{ width: 44 }} />
        <Pressable
          onPress={captureFromCamera}
          disabled={capturing}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#fff',
            borderWidth: 4,
            borderColor: 'rgba(255,255,255,0.4)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {capturing ? (
            <ActivityIndicator color={accentColor} />
          ) : (
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' }} />
          )}
        </Pressable>
        <Pressable
          onPress={pickFromGallery}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(0,0,0,0.4)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.gallery size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};
