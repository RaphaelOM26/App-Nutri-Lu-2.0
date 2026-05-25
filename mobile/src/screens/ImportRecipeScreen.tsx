// Tela de seleção do método de importação de receita.
// Porte de ImportRecipeScreen em screens-recipes.jsx.

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Card } from '../components/Card';
import { Btn } from '../components/Btn';
import { Icon, type IconName } from '../components/Icons';
import { extractRecipe, ApiError } from '../api/client';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Method = {
  icon: IconName;
  title: string;
  sub: string;
  tint: string;
  color: string;
  action: 'camera' | 'video' | 'manual';
};

export const ImportRecipeScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const [url, setUrl] = useState('');
  const [importingLink, setImportingLink] = useState(false);

  const methods: Method[] = [
    { icon: 'link', title: 'Importar de um link', sub: 'Instagram, TikTok, YouTube, blog', tint: theme.accentBlue, color: theme.insightAccent, action: 'manual' },
    { icon: 'camera', title: 'Foto de receita', sub: 'OCR de livros, papel ou print', tint: theme.accentPink, color: '#8E5E66', action: 'camera' },
    { icon: 'video', title: 'Vídeo de receita', sub: 'Transcrição + IA (em breve)', tint: theme.primarySoft, color: theme.primaryDeep, action: 'video' },
    { icon: 'pen', title: 'Criar do zero', sub: 'Editor manual completo', tint: theme.accentIce, color: '#5B7090', action: 'manual' },
  ];

  const onMethodPress = (m: Method) => {
    switch (m.action) {
      case 'camera':
        nav.navigate('Camera', { mode: 'recipe' });
        return;
      case 'video':
        Alert.alert(
          'Em breve',
          'Importação por vídeo ainda não está disponível. Tente colar o link aqui embaixo — funciona pra Insta, TikTok e YouTube.',
        );
        return;
      case 'manual':
        // Abre RecipeDetail com receita vazia, modo "criar do zero"
        nav.navigate('RecipeDetail', {
          extracted: {
            title: 'Nova receita',
            ingredients: [],
            steps: [],
            time: '',
            servings: 1,
            confidence: 'high',
          },
        });
        return;
    }
  };

  const importFromLink = async () => {
    const cleaned = url.trim();
    if (!cleaned) {
      Alert.alert('Cole um link primeiro', 'Ex: https://instagram.com/p/...');
      return;
    }
    if (!/^https?:\/\//.test(cleaned)) {
      Alert.alert('Link inválido', 'Comece com http:// ou https://');
      return;
    }
    setImportingLink(true);
    try {
      const recipe = await extractRecipe('url', cleaned);
      nav.navigate('RecipeDetail', { extracted: { ...recipe, sourceUrl: cleaned } });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao importar';
      Alert.alert('Não consegui importar', msg);
    } finally {
      setImportingLink(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Nova receita"
        large
        sub="Escolha como você quer começar"
        left={[<IconBtn key="close" icon={Icon.close} onPress={() => nav.goBack()} />]}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}>
        {methods.map((m) => {
          const IconC = Icon[m.icon];
          return (
            <Pressable
              key={m.title}
              onPress={() => onMethodPress(m)}
              style={{
                backgroundColor: theme.bgElev,
                borderRadius: 20,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: m.tint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconC size={24} color={m.color} stroke={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 15, fontWeight: '800', color: theme.text }}>{m.title}</Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{m.sub}</Text>
              </View>
              <Icon.forward size={18} color={theme.textFaint} />
            </Pressable>
          );
        })}

        {/* Link paste field */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 11,
              color: theme.textMuted,
              fontWeight: '700',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 8,
              paddingLeft: 4,
            }}
          >
            Cole o link aqui
          </Text>
          <Card pad={14} radius={18}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon.link size={18} color={theme.textMuted} />
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://instagram.com/p/…"
                placeholderTextColor={theme.textFaint}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={Platform.OS === 'ios' ? 'url' : 'default'}
                style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, color: theme.text }}
              />
              {importingLink ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Btn variant="primary" size="md" icon={Icon.sparkle} onPress={importFromLink}>
                  Importar
                </Btn>
              )}
            </View>
          </Card>
          <View style={{ marginTop: 12, padding: 12, backgroundColor: theme.accentIce, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon.sparkle size={16} color={theme.insightAccent} />
            <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 12, color: theme.insightText, lineHeight: 17 }}>
              Lu extrai ingredientes, modo de preparo e calcula nutrição automaticamente.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
