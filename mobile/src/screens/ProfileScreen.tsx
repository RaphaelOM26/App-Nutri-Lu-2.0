// Perfil "Eu" — porte funcional. Itens do menu agora navegam pra telas reais
// ou abrem modais persistidos no AppContext.

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { LuBtn } from '../components/LuBtn';
import { IconBtn } from '../components/IconBtn';
import { Card } from '../components/Card';
import { Icon, type IconName } from '../components/Icons';
import { Avatar } from '../components/Avatar';
import { EditWeightGoalModal } from '../components/EditWeightGoalModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { SettingsModal } from '../components/SettingsModal';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { calcStreak } from '../storage/habits';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type MenuItem = {
  icon: IconName;
  label: string;
  subtitle?: string;
  onPress: () => void;
  accent?: boolean;
};

// Pill DEV-only que limpa TODA a persistência do app via AsyncStorage.clear().
// Reseta onboarding + meals + recipes + pantry + photos + habits + collections + etc.
// REMOVER antes do lançamento (ou esconder atrás de uma flag mais restrita).
const DevResetOnboarding: React.FC = () => {
  const theme = useTheme();
  const toast = useToast();

  const reset = async () => {
    try {
      // AsyncStorage.clear() apaga TUDO do app — onboarding fields, refeições
      // customizadas (Pré treino/Pós treino/Sobremesa), receitas importadas,
      // pantry, weight entries, fotos de progresso, hábitos, favoritos, recents,
      // collections, completedDays, macroTargets, mealReminders, theme pref.
      // É o reset definitivo. Próximo reload → app em branco como instalação nova.
      await AsyncStorage.clear();
      toast('Tudo limpo · feche e reabra o app pra ver onboarding', 'info');
    } catch (err) {
      console.warn('[dev] AsyncStorage.clear falhou:', err);
      toast('Falha ao limpar · vê o console', 'error');
    }
  };

  return (
    <Pressable
      onPress={reset}
      style={{
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 4,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 100,
        backgroundColor: theme.warningSoft,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Text style={{ fontFamily: FONT.bodyBold, fontSize: 12, color: theme.warningDeep }}>
        🔧 DEV · Limpar tudo e voltar ao onboarding
      </Text>
    </Pressable>
  );
};

export const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const toast = useToast();
  const { weightEntries, weightGoalKg, displayedMacros, habits, setWeightGoal, setMacroTargets, profilePhotoUri, setProfilePhoto, name } = useApp();
  const displayName = name ?? 'Você';
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pickAvatarFromCamera = async () => {
    setPhotoSheetOpen(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { toast('Permissão da câmera negada', 'error'); return; }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (res.canceled || !res.assets?.[0]) return;
    setProfilePhoto(res.assets[0].uri);
    toast('Foto de perfil atualizada');
  };

  const pickAvatarFromLibrary = async () => {
    setPhotoSheetOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast('Permissão da galeria negada', 'error'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (res.canceled || !res.assets?.[0]) return;
    setProfilePhoto(res.assets[0].uri);
    toast('Foto de perfil atualizada');
  };

  const removeAvatar = () => {
    setPhotoSheetOpen(false);
    setProfilePhoto(null);
    toast('Foto removida');
  };

  // ─── Stats reais ────────────────────────────────────────────────
  const currentKg = weightEntries[0]?.kg ?? weightGoalKg;
  const fmtKg = (k: number) => k.toFixed(1).replace('.', ',');

  // Streak: maior streak entre os hábitos (proxy de "dias de constância")
  const bestStreak = habits.reduce((max, h) => Math.max(max, calcStreak(h.completedDays)), 0);
  // Conquistas: user começa em 0 — sistema de unlock virá depois.
  const achievementsCount = 0;

  // (Share inline removido — agora abre a tela dedicada InviteFriends com link + gameficação)

  const items: MenuItem[] = [
    {
      icon: 'chart',
      label: 'Progresso e Métricas',
      subtitle: 'Resumo da jornada compartilhável',
      onPress: () => nav.navigate('JourneySummary'),
    },
    {
      icon: 'bell',
      label: 'Notificações',
      subtitle: 'Lembrete diário de pesagem',
      onPress: () => setRemindersOpen(true),
    },
    {
      icon: 'sparkle',
      label: 'Premium · grátis 7 dias',
      subtitle: 'Receitas exclusivas + Lu sem limite',
      accent: true,
      onPress: () => toast('Premium chega em breve · vai liberar receitas + Lu ilimitada', 'info'),
    },
    {
      icon: 'settings',
      label: 'Configurações',
      subtitle: 'Tema do app e idioma',
      onPress: () => setSettingsOpen(true),
    },
    {
      icon: 'user',
      label: 'Convidar amigos',
      subtitle: 'Ganhe Premium grátis a cada 5 convites',
      onPress: () => nav.navigate('InviteFriends'),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Eu"
        large
        left={[<IconBtn key="back" icon={Icon.back} onPress={() => nav.navigate('Tabs', { screen: 'Home' } as never)} />]}
        right={[
          <LuBtn key="lu" onPress={() => nav.navigate('ChatLu')} />,
          <IconBtn key="b" icon={Icon.bell} onPress={() => setRemindersOpen(true)} />,
        ]}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* DEV-only — refazer onboarding pra teste. Remove antes do lançamento. */}
        {__DEV__ && <DevResetOnboarding />}
        {/* Profile card */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Card pad={18} radius={22}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ position: 'relative' }}>
                <Avatar
                  uri={profilePhotoUri}
                  initials="LS"
                  size={64}
                  onPress={() => setPhotoSheetOpen(true)}
                />
                {/* Selo da câmera no canto inferior direito pra sinalizar que é clicável */}
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: theme.primaryDeep,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: theme.bgElev,
                  }}
                >
                  <Icon.camera size={10} color="#fff" stroke={2.5} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>
                  {displayName}
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                  Perder peso · {fmtKg(currentKg)} / {fmtKg(weightGoalKg)} kg
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                  <View style={{ paddingVertical: 3, paddingHorizontal: 8, backgroundColor: theme.primarySoft, borderRadius: 100 }}>
                    <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: theme.primaryDeep }}>
                      ● {bestStreak} dias
                    </Text>
                  </View>
                  <View style={{ paddingVertical: 3, paddingHorizontal: 8, backgroundColor: theme.bgSubtle, borderRadius: 100 }}>
                    <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: theme.text }}>
                      {achievementsCount} conquistas
                    </Text>
                  </View>
                </View>
              </View>
              <IconBtn icon={Icon.edit} onPress={() => setEditGoalOpen(true)} />
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
                { k: fmtKg(currentKg), s: 'kg atual' },
                { k: displayedMacros.kcal.target.toLocaleString('pt-BR'), s: 'kcal meta' },
                { k: `${displayedMacros.p.target}g`, s: 'proteína' },
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
                  onPress={it.onPress}
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
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>{it.label}</Text>
                    {it.subtitle && (
                      <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
                        {it.subtitle}
                      </Text>
                    )}
                  </View>
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

      <EditWeightGoalModal
        visible={editGoalOpen}
        onClose={() => setEditGoalOpen(false)}
        currentKg={weightGoalKg}
        currentTargets={{
          kcal: displayedMacros.kcal.target,
          p: displayedMacros.p.target,
          c: displayedMacros.c.target,
          f: displayedMacros.f.target,
        }}
        onSave={({ kg, targets }) => {
          setWeightGoal(kg);
          setMacroTargets(targets);
          toast('Metas atualizadas');
        }}
      />
      <NotificationsModal visible={remindersOpen} onClose={() => setRemindersOpen(false)} />
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Bottom-sheet pra escolher fonte da foto de perfil */}
      <Modal visible={photoSheetOpen} transparent animationType="fade" onRequestClose={() => setPhotoSheetOpen(false)}>
        <Pressable onPress={() => setPhotoSheetOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 28, gap: 4 }}>
            <View style={{ alignItems: 'center', paddingBottom: 6 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <PhotoSourceItem icon={Icon.camera} tint={theme.primaryDeep} tintBg={theme.primarySoft} title="Tirar foto" subtitle="Abre a câmera" onPress={pickAvatarFromCamera} />
            <PhotoSourceItem icon={Icon.gallery} tint="#B07A1E" tintBg="#F8ECD7" title="Escolher da galeria" subtitle="Selecionar uma foto existente" onPress={pickAvatarFromLibrary} />
            {profilePhotoUri && (
              <PhotoSourceItem icon={Icon.trash} tint="#D67373" tintBg="#FBE9EB" title="Remover foto" subtitle="Volta a usar as iniciais" onPress={removeAvatar} />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const PhotoSourceItem: React.FC<{
  icon: React.FC<{ size?: number; color?: string; stroke?: number }>;
  tint: string;
  tintBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}> = ({ icon: IconC, tint, tintBg, title, subtitle, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: tintBg, alignItems: 'center', justifyContent: 'center' }}>
        <IconC size={18} color={tint} stroke={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text }}>{title}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{subtitle}</Text>
      </View>
    </Pressable>
  );
};
