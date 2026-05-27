// Tela de seleção do método de importação de receita.
// Porte de ImportRecipeScreen em screens-recipes.jsx.

import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Btn } from '../components/Btn';
import { Icon, type IconName } from '../components/Icons';
import { extractRecipe, ApiError } from '../api/client';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Method = {
  id: 'link' | 'camera' | 'manual';
  icon: IconName;
  title: string;
  sub: string;
  tint: string;
  color: string;
};

export const ImportRecipeScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const [url, setUrl] = useState('');
  const [importingLink, setImportingLink] = useState(false);
  const [linkExpanded, setLinkExpanded] = useState(false);
  const urlInputRef = useRef<TextInput>(null);

  // Vídeo removido. Sobram: link (expande input), câmera (foto), criar do zero.
  const methods: Method[] = [
    { id: 'link',   icon: 'link',   title: 'Importar de um link',   sub: 'Instagram, TikTok, YouTube, blog', tint: theme.accentBlue,   color: theme.insightAccent },
    { id: 'camera', icon: 'camera', title: 'Foto de receita',        sub: 'OCR de livros, papel ou print',    tint: theme.accentPink,   color: '#8E5E66' },
    { id: 'manual', icon: 'pen',    title: 'Criar do zero',          sub: 'Editor manual completo',           tint: theme.accentIce,    color: '#5B7090' },
  ];

  const onMethodPress = (m: Method) => {
    switch (m.id) {
      case 'camera':
        nav.navigate('Camera', { mode: 'recipe' });
        return;
      case 'link':
        // Toggle: abre seção do input. Se já aberta, fecha.
        if (linkExpanded) {
          setLinkExpanded(false);
        } else {
          setLinkExpanded(true);
          setTimeout(() => urlInputRef.current?.focus(), 200);
        }
        return;
      case 'manual':
        // "Criar do zero" — abre RecipeDetail vazio
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
    // Bloqueia URLs claramente vagas (homepage da rede sem post específico)
    const isHomepageOnly = /^https?:\/\/(www\.)?(instagram|tiktok|youtube|youtu)\.[a-z.]+\/?$/i.test(cleaned);
    if (isHomepageOnly) {
      Alert.alert(
        'Link muito genérico',
        'Cole o link de um POST específico de receita, não da home da rede. Exemplo:\n• instagram.com/p/XYZ\n• tiktok.com/@user/video/123\n• youtube.com/watch?v=ABC',
      );
      return;
    }
    setImportingLink(true);
    try {
      const recipe = await extractRecipe('url', cleaned);
      // Validação: backend pode retornar confiança baixa + ingredientes vazios
      // quando não acha receita no link. Não navega — mostra erro útil.
      const failed = recipe.ingredients.length === 0 || recipe.confidence === 'low';
      if (failed) {
        Alert.alert(
          'Não encontrei receita nesse link',
          'O link parece não ter uma receita identificável. Tente:\n• Post direto do prato (não perfil)\n• Vídeo ou foto com ingredientes visíveis\n• Blog com lista de ingredientes',
        );
        return;
      }
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
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }} keyboardShouldPersistTaps="handled">
        {methods.map((m) => {
          const IconC = Icon[m.icon];
          const isLink = m.id === 'link';
          const expanded = isLink && linkExpanded;
          return (
            <View key={m.id}>
              <Pressable
                onPress={() => onMethodPress(m)}
                style={{
                  backgroundColor: theme.bgElev,
                  borderRadius: expanded ? 20 : 20,
                  borderBottomLeftRadius: expanded ? 0 : 20,
                  borderBottomRightRadius: expanded ? 0 : 20,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  borderWidth: expanded ? 1.5 : 0,
                  borderColor: expanded ? theme.primary : 'transparent',
                  borderBottomWidth: expanded ? 0 : 0,
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
                {isLink ? (
                  <Icon.forward
                    size={18}
                    color={theme.textFaint}
                    // setinha "vira pra baixo" quando expandido — fakeamos rotacionando via estilo
                    // (a Icon não aceita transform direto; pra evitar transform em SVG aqui, mantemos a setinha pra direita)
                  />
                ) : (
                  <Icon.forward size={18} color={theme.textFaint} />
                )}
              </Pressable>

              {/* Painel expansível do "Importar de um link" */}
              {expanded && (
                <View
                  style={{
                    backgroundColor: theme.bgElev,
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20,
                    borderWidth: 1.5,
                    borderTopWidth: 0,
                    borderColor: theme.primary,
                    padding: 16,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      backgroundColor: theme.bg,
                      borderRadius: 14,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <Icon.link size={18} color={theme.textMuted} />
                    <TextInput
                      ref={urlInputRef}
                      value={url}
                      onChangeText={setUrl}
                      placeholder="https://instagram.com/p/…"
                      placeholderTextColor={theme.textFaint}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType={Platform.OS === 'ios' ? 'url' : 'default'}
                      style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, color: theme.text }}
                      onSubmitEditing={importFromLink}
                      returnKeyType="go"
                    />
                    {url.length > 0 && (
                      <Pressable onPress={() => setUrl('')} hitSlop={8} accessibilityLabel="Limpar">
                        <Icon.close size={14} color={theme.textMuted} />
                      </Pressable>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      {importingLink ? (
                        <View style={{ height: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                          <ActivityIndicator size="small" color={theme.primary} />
                          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>Lu está lendo o link…</Text>
                        </View>
                      ) : (
                        <Btn variant="primary" size="md" icon={Icon.sparkle} onPress={importFromLink} full>
                          Importar receita
                        </Btn>
                      )}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <Icon.sparkle size={14} color={theme.insightAccent} stroke={2} />
                    <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, lineHeight: 16 }}>
                      Lu extrai ingredientes, modo de preparo e calcula nutrição automaticamente.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
