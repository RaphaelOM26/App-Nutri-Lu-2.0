// Tela "Convidar amigos" com link compartilhável + sistema de recompensas.
// Mock: cada user tem um código único (no backend real seria derivado do user.id).
// Gameficação: 5 amigos convidados → 1 mês de Premium grátis.

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Btn } from '../components/Btn';
import { Card } from '../components/Card';
import { Icon } from '../components/Icons';
import { useToast } from '../state/ToastContext';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Código mock — no backend real seria derivado do user.id
const INVITE_CODE = 'LARI42K9';
const INVITE_URL = `https://nutrilu.app/i/${INVITE_CODE}`;
const GOAL_INVITES = 5;
const INVITES_ACCEPTED = 0; // mock — virá do backend

export const InviteFriendsScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const progress = Math.min(100, Math.round((INVITES_ACCEPTED / GOAL_INVITES) * 100));
  const remaining = Math.max(0, GOAL_INVITES - INVITES_ACCEPTED);

  const copyLink = async () => {
    try {
      await Clipboard.setStringAsync(INVITE_URL);
      setCopied(true);
      toast('Link copiado');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast('Não consegui copiar', 'error');
    }
  };

  const shareLink = async () => {
    try {
      await Share.share({
        message:
          `🥗 Tô usando o Nutri Lu pra cuidar da minha nutrição e tá funcionando demais!\n\n` +
          `Usa meu link pra baixar e ganhar 7 dias de Premium grátis:\n${INVITE_URL}`,
      });
    } catch {
      /* user cancelou */
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Convidar amigos"
        left={[<IconBtn key="back" icon={Icon.back} onPress={() => nav.goBack()} />]}
        right={[]}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* ─── Hero ─── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Card pad={0} radius={22} style={{ overflow: 'hidden' }}>
            <View style={{ backgroundColor: theme.primarySoft, padding: 22, gap: 6 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.primaryDeep, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                Recompensa
              </Text>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: -0.5, lineHeight: 27 }}>
                Convide 5 amigos e ganhe{'\n'}
                <Text style={{ color: theme.primaryDeep }}>1 mês de Premium grátis</Text>
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, marginTop: 4, lineHeight: 18 }}>
                Seu amigo ganha 7 dias de Premium ao instalar pelo seu link. Quando 5 amigos virarem usuários ativos, você ganha 30 dias.
              </Text>
            </View>

            {/* Progress */}
            <View style={{ padding: 18, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }}>
                  Seu progresso
                </Text>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.primaryDeep }}>
                  {INVITES_ACCEPTED}/{GOAL_INVITES}
                </Text>
              </View>
              <View style={{ height: 10, borderRadius: 100, backgroundColor: theme.bgSubtle, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progress}%`, backgroundColor: theme.primaryDeep, borderRadius: 100 }} />
              </View>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>
                {remaining === GOAL_INVITES
                  ? 'Comece convidando seu primeiro amigo 👇'
                  : remaining > 0
                    ? `Faltam ${remaining} ${remaining === 1 ? 'amigo' : 'amigos'} pra ganhar o mês grátis 🔥`
                    : '🎉 Você desbloqueou 1 mês de Premium! Resgate em Premium.'}
              </Text>
            </View>
          </Card>
        </View>

        {/* ─── Link de convite ─── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Card pad={18} radius={20}>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Seu link de convite
            </Text>
            <View
              style={{
                marginTop: 10,
                padding: 14,
                borderRadius: 14,
                backgroundColor: theme.bgSubtle,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: FONT.bodyBold, fontSize: 13, fontWeight: '700', color: theme.text }}>
                  {INVITE_URL}
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, marginTop: 2 }}>
                  Código: {INVITE_CODE}
                </Text>
              </View>
              <Pressable
                onPress={copyLink}
                hitSlop={8}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 100,
                  backgroundColor: copied ? theme.primaryDeep : theme.bgElev,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 11 }}>{copied ? '✓' : '📋'}</Text>
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 11, fontWeight: '700', color: copied ? '#fff' : theme.text }}>
                  {copied ? 'Copiado' : 'Copiar'}
                </Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 12 }}>
              <Btn variant="primary" size="lg" icon={Icon.send} onPress={shareLink} full>
                Compartilhar link
              </Btn>
            </View>
          </Card>
        </View>

        {/* ─── Como funciona ─── */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Card pad={18} radius={20}>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Como funciona
            </Text>
            <View style={{ marginTop: 12, gap: 14 }}>
              <Step n={1} title="Compartilhe seu link" desc="Envia pra galera no WhatsApp, Instagram ou direct." />
              <Step n={2} title="Amigo instala e cria conta" desc="Ele ganha 7 dias de Premium na hora pelo seu código." />
              <Step n={3} title="A cada 5 convites válidos" desc="Você ganha 1 mês de Premium grátis. Vale pra todos os meses." />
            </View>
          </Card>
        </View>

        {/* ─── Convites enviados (mock vazio) ─── */}
        <View style={{ paddingHorizontal: 16 }}>
          <Card pad={18} radius={20}>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Amigos convidados
            </Text>
            <View style={{ alignItems: 'center', paddingVertical: 22, gap: 8 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.user size={22} color={theme.textMuted} stroke={1.5} />
              </View>
              <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
                Nenhum amigo ainda
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, textAlign: 'center', lineHeight: 16, paddingHorizontal: 20 }}>
                Quando alguém entrar pelo seu link, aparece aqui com data e status.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Step: React.FC<{ n: number; title: string; desc: string }> = ({ n, title, desc }) => {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primaryDeep, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 12, fontWeight: '800', color: '#fff' }}>{n}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }}>{title}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2, lineHeight: 17 }}>{desc}</Text>
      </View>
    </View>
  );
};
