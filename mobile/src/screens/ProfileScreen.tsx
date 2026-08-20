// Perfil "Eu" — porte funcional. Itens do menu agora navegam pra telas reais
// ou abrem modais persistidos no AppContext.

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Alert } from 'react-native';
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
import { useAuthSession, signOut, deleteAccount } from '../state/authState';
import { useAccess } from '../state/accessState';
import { fetchBlockedUsers, unblockCommunityUser } from '../api/client';
import { showCommunityRules } from '../components/communityRules';
import { calcStreak } from '../storage/habits';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Vermelho das ações destrutivas — mesmo tom já usado no "Remover foto".
// Não vive no tema porque funciona igual no claro e no escuro.
const DESTRUCTIVE = '#D67373';

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

  const acesso = useAccess();
  const temAcesso = acesso?.acesso === true;
  const validadeAcesso = acesso?.validoAte
    ? new Date(acesso.validoAte).toLocaleDateString('pt-BR')
    : null;

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
    // Acesso ao acompanhamento. Substituiu o antigo item "Premium · grátis 7
    // dias", que prometia um teste gratuito que não existe neste modelo e só
    // mostrava um toast. O rótulo muda com o estado pra a pessoa que já tem
    // acesso não ser convidada a ativar o que já está ativo.
    {
      icon: temAcesso ? 'checkCircle' : 'lock',
      label: temAcesso ? 'Meu acesso' : 'Ativar meu acesso',
      subtitle: temAcesso
        ? validadeAcesso
          ? `Acompanhamento ativo até ${validadeAcesso}`
          : 'Acompanhamento ativo'
        : 'Já tem um código? Ative por aqui',
      accent: !temAcesso,
      onPress: () => nav.navigate('Access'),
    },
    {
      icon: 'settings',
      label: 'Configurações',
      subtitle: 'Tema do app e idioma',
      onPress: () => setSettingsOpen(true),
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

        {/* Conta da comunidade — só aparece pra quem entrou com Apple/Google.
            "Excluir minha conta" é EXIGÊNCIA da App Store (5.1.1(v)): o app não
            passa na review se a única forma de apagar a conta for fora dele. */}
        <CommunityAccountCard />

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


// Card "Conta da comunidade" do perfil.
//
// Aparece só pra quem tem sessão (entrou com Apple/Google pra publicar receita).
// Duas ações: sair (reversível, é só a sessão) e excluir (irreversível, apaga
// usuário + receitas publicadas + avaliações no servidor).
//
// A exclusão pede DUAS confirmações de propósito: é destrutiva, imediata e não
// tem lixeira. O primeiro alerta explica o que some; o segundo é o ponto de
// não-retorno. Padrão que a própria Apple usa nas contas dela.
const CommunityAccountCard: React.FC = () => {
  const theme = useTheme();
  const toast = useToast();
  const session = useAuthSession();
  const [busy, setBusy] = useState(false);
  const [blocksOpen, setBlocksOpen] = useState(false);

  if (!session) return null;

  const confirmDelete = () => {
    Alert.alert(
      'Excluir minha conta?',
      'Sua conta da comunidade, as receitas que você publicou e suas avaliações serão apagadas para sempre.\n\nSeu diário de refeições continua no aparelho — ele não faz parte da conta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: askFinalConfirm },
      ],
    );
  };

  // Segundo passo — separado do primeiro pra que um toque errado no botão
  // vermelho não apague nada sozinho.
  function askFinalConfirm() {
    Alert.alert('Tem certeza?', 'Não dá para desfazer.', [
      { text: 'Manter minha conta', style: 'cancel' },
      { text: 'Excluir para sempre', style: 'destructive', onPress: runDelete },
    ]);
  }

  async function runDelete() {
    if (busy) return;
    setBusy(true);
    try {
      await deleteAccount();
      toast('Conta excluída');
    } catch {
      toast('Não consegui excluir agora — tente de novo em instantes', 'error');
    } finally {
      setBusy(false);
    }
  }

  const onSignOut = () => {
    Alert.alert('Sair da conta?', 'Você pode entrar de novo quando quiser.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        onPress: async () => {
          await signOut();
          toast('Você saiu da conta');
        },
      },
    ]);
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <Card pad={0} radius={20}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: theme.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.globe size={18} color={theme.primaryDeep} stroke={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>
              Conta da comunidade
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
              {session.user.displayName}
              {session.user.email ? ` · ${session.user.email}` : ''}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={showCommunityRules}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>
            Regras da comunidade
          </Text>
          <Icon.forward size={16} color={theme.textFaint} />
        </Pressable>

        <Pressable
          onPress={() => setBlocksOpen(true)}
          disabled={busy}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>
            Contas bloqueadas
          </Text>
          <Icon.forward size={16} color={theme.textFaint} />
        </Pressable>

        <Pressable
          onPress={onSignOut}
          disabled={busy}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Text style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>
            Sair da conta
          </Text>
        </Pressable>

        <Pressable
          onPress={confirmDelete}
          disabled={busy}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            opacity: busy ? 0.5 : 1,
          }}
        >
          <Text style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: DESTRUCTIVE }}>
            {busy ? 'Excluindo…' : 'Excluir minha conta'}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
            Apaga conta, receitas publicadas e avaliações
          </Text>
        </Pressable>
      </Card>

      <BlockedAccountsModal visible={blocksOpen} onClose={() => setBlocksOpen(false)} />
    </View>
  );
};

// Lista de contas bloqueadas, com desbloqueio.
//
// Existe pra que bloquear não seja irreversível: a App Store exige o bloqueio
// (1.2), e uma decisão tomada com raiva sem como desfazer é UX ruim. Carrega
// sob demanda — a maioria das pessoas nunca vai abrir esta tela.
const BlockedAccountsModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const theme = useTheme();
  const toast = useToast();
  const session = useAuthSession();
  const [items, setItems] = useState<{ id: string; displayName: string }[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!visible || !session) return;
    let alive = true;
    setItems(null);
    setError(false);
    fetchBlockedUsers(session.token)
      .then((list) => alive && setItems(list))
      .catch(() => alive && setError(true));
    // Recarrega a cada abertura: a pessoa pode ter bloqueado alguém no feed
    // depois da última vez que abriu esta tela.
    return () => {
      alive = false;
    };
  }, [visible, session]);

  const unblock = async (id: string, name: string) => {
    if (!session) return;
    // Otimista: some da lista na hora. Se o servidor recusar, volta.
    const before = items;
    setItems((cur) => (cur ? cur.filter((u) => u.id !== id) : cur));
    try {
      await unblockCommunityUser(session.token, id);
      toast(`${name} desbloqueado`);
    } catch {
      setItems(before);
      toast('Não consegui desbloquear agora', 'error');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}
      >
        <Pressable
          onPress={() => {}}
          style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 22, gap: 14, maxHeight: '80%' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>
              Contas bloqueadas
            </Text>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          {items === null && !error && (
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted }}>Carregando…</Text>
          )}
          {error && (
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted }}>
              Não consegui carregar agora. Tente de novo em instantes.
            </Text>
          )}
          {items?.length === 0 && (
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, lineHeight: 19 }}>
              Você não bloqueou ninguém. Pra bloquear alguém, abra uma receita da comunidade e toque em “Bloquear autor”.
            </Text>
          )}

          {!!items?.length && (
            <ScrollView contentContainerStyle={{ gap: 4 }}>
              {items.map((u) => (
                <View
                  key={u.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>
                    {u.displayName}
                  </Text>
                  <Pressable
                    onPress={() => unblock(u.id, u.displayName)}
                    hitSlop={8}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 100,
                      backgroundColor: theme.bgSubtle,
                    }}
                  >
                    <Text style={{ fontFamily: FONT.body, fontSize: 12, fontWeight: '700', color: theme.primaryDeep }}>
                      Desbloquear
                    </Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
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
