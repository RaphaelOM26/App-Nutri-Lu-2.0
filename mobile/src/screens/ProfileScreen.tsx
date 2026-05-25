// Perfil — porte simplificado do ProfileScreen.

import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { LuBtn } from '../components/LuBtn';
import { IconBtn } from '../components/IconBtn';
import { Card } from '../components/Card';
import { Icon, type IconName } from '../components/Icons';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const items: { icon: IconName; label: string; to?: keyof RootStackParamList; accent?: boolean }[] = [
    { icon: 'chart', label: 'Progresso & Métricas', to: 'Tabs' },
    { icon: 'ring', label: 'Metas e Macros' },
    { icon: 'bell', label: 'Notificações' },
    { icon: 'sparkle', label: 'Premium · grátis 7 dias', accent: true },
    { icon: 'settings', label: 'Configurações' },
    { icon: 'user', label: 'Convidar amigos' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Eu"
        large
        right={[<LuBtn key="lu" onPress={() => nav.navigate('ChatLu')} />, <IconBtn key="b" icon={Icon.bell} />]}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Profile card */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Card pad={18} radius={22}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: theme.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: FONT.headExtra, fontWeight: '800', fontSize: 24, color: theme.primaryDeep }}>LS</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>Larissa Souza</Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>Perder peso · 85,2 / 82 kg</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                  <View style={{ paddingVertical: 3, paddingHorizontal: 8, backgroundColor: theme.primarySoft, borderRadius: 100 }}>
                    <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: theme.primaryDeep }}>● 12 dias</Text>
                  </View>
                  <View style={{ paddingVertical: 3, paddingHorizontal: 8, backgroundColor: theme.bgSubtle, borderRadius: 100 }}>
                    <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: theme.text }}>7 conquistas</Text>
                  </View>
                </View>
              </View>
              <IconBtn icon={Icon.edit} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: theme.border,
                justifyContent: 'space-between',
              }}
            >
              {[
                { k: '85,2', s: 'kg atual' },
                { k: '2.200', s: 'kcal meta' },
                { k: '135g', s: 'proteína' },
              ].map((it) => (
                <View key={it.s} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text }}>{it.k}</Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '600' }}>{it.s}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Card pad={0} radius={20}>
            {items.map((it, i) => {
              const IconC = Icon[it.icon];
              return (
                <Pressable
                  key={it.label}
                  onPress={() => it.to && nav.navigate(it.to as any)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: i < items.length - 1 ? 1 : 0,
                    borderBottomColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: it.accent ? theme.fatsGold : theme.bgSubtle,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconC size={18} color={it.accent ? '#fff' : theme.text} stroke={2} />
                  </View>
                  <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>{it.label}</Text>
                  <Icon.forward size={16} color={theme.textFaint} />
                </Pressable>
              );
            })}
          </Card>
        </View>

        {/* AI Chat shortcut */}
        <View style={{ padding: 16 }}>
          <Pressable onPress={() => nav.navigate('ChatLu')}>
            <Card pad={16} radius={20} style={{ backgroundColor: theme.accentIce }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.sparkle size={22} color={theme.insightAccent} stroke={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, fontWeight: '800', color: theme.insightText }}>Falar com Lu</Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.insightAccent, marginTop: 2 }}>Sua nutricionista IA está online</Text>
                </View>
                <Icon.forward size={18} color={theme.insightAccent} />
              </View>
            </Card>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
