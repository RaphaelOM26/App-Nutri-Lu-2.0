// Tela "Resumo da jornada" — design editorial, compartilhável em redes.
// Inspirada em revistas: tipografia serif (DM Serif Display), antes/depois
// como hero, slider linear do progresso, heatmap de consistência e quote.
//
// A página inteira (exceto header) é capturável como PNG via react-native-view-shot.

import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useTheme, FONT, PALETTE } from '../theme';
import { IconBtn } from '../components/IconBtn';
import { Icon } from '../components/Icons';
import { Avatar } from '../components/Avatar';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { calcStreak } from '../storage/habits';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const DAY_MS = 24 * 60 * 60 * 1000;

const QUOTES = [
  'Pequenas escolhas, repetidas todos os dias, viraram uma transformação.',
  'O progresso mora na constância — e você mostrou que tem.',
  'Hoje você é o resultado de cada decisão de ontem. Continue.',
  'A jornada é a recompensa. Cada dia conta.',
];

export const JourneySummaryScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const toast = useToast();
  const { weightEntries, weightGoalKg, habits, progressPhotos, profilePhotoUri } = useApp();
  const shotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  // ─── Stats agregados ────────────────────────────────────────────
  const stats = useMemo(() => {
    const sorted = [...weightEntries].sort((a, b) => a.date - b.date);
    const startEntry = sorted[0];
    const currentEntry = sorted[sorted.length - 1];
    const start = startEntry?.kg ?? null;
    const current = currentEntry?.kg ?? null;
    const lost = start != null && current != null ? start - current : 0;
    const daysElapsed = startEntry ? Math.max(1, Math.round((Date.now() - startEntry.date) / DAY_MS)) : 0;
    return { start, current, lost, daysElapsed };
  }, [weightEntries]);

  // Top 3 hábitos por streak
  const topHabits = useMemo(
    () =>
      habits
        .map((h) => ({ ...h, streak: calcStreak(h.completedDays) }))
        .filter((h) => h.streak > 0)
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 3),
    [habits],
  );
  const bestStreak = topHabits[0]?.streak ?? 0;

  // Antes/depois
  const sortedPhotos = [...progressPhotos].sort((a, b) => a.date - b.date);
  const beforePhoto = sortedPhotos[0];
  const afterPhoto = sortedPhotos[sortedPhotos.length - 1];
  const hasComparison = sortedPhotos.length >= 2;

  // Quote determinístico baseado em streak (sempre o mesmo pro mesmo state)
  const quote = QUOTES[bestStreak % QUOTES.length];

  const fmtDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate()} ${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}`;
  };
  const fmtKg = (k: number) => k.toFixed(1).replace('.', ',');

  // Posição do "AGORA" no slider (0..1)
  const sliderPos = useMemo(() => {
    if (stats.start == null || stats.current == null) return 0.5;
    const total = stats.start - weightGoalKg;
    if (total <= 0) return 1;
    const done = stats.start - stats.current;
    return Math.max(0, Math.min(1, done / total));
  }, [stats, weightGoalKg]);

  const captureAndShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const uri = await captureRef(shotRef, { format: 'png', quality: 1, result: 'tmpfile' });
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        toast('Compartilhamento não disponível neste dispositivo', 'error');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartilhar resumo da jornada' });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao compartilhar', 'error');
    } finally {
      setSharing(false);
    }
  };

  // Tons editoriais — fundo creme quente
  const bg = '#FAF7F2';
  const ink = '#1F1E1B';
  const sub = 'rgba(31,30,27,0.55)';
  const accent = PALETTE.primaryDeep;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      {/* Header flutuante (não vai na imagem) */}
      <View style={{ position: 'absolute', top: 12, left: 0, right: 0, zIndex: 10, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconBtn icon={Icon.back} onPress={() => nav.goBack()} />
        <Pressable
          onPress={captureAndShare}
          disabled={sharing}
          style={{
            backgroundColor: ink,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 100,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            opacity: sharing ? 0.6 : 1,
          }}
        >
          {sharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon.send size={13} color="#fff" stroke={2} />
          )}
          <Text style={{ fontFamily: FONT.bodyBold, fontSize: 12, fontWeight: '700', color: '#fff' }}>
            Compartilhar
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }} style={{ backgroundColor: bg }}>
          {/* ─── HERO: antes/depois full-width ─── */}
          {hasComparison && beforePhoto && afterPhoto ? (
            <View style={{ height: 360, flexDirection: 'row', position: 'relative', backgroundColor: '#000' }}>
              <View style={{ flex: 1 }}>
                <Image source={{ uri: beforePhoto.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', top: 70, left: 14, backgroundColor: 'rgba(255,255,255,0.92)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 100 }}>
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 10, fontWeight: '800', color: ink, letterSpacing: 1 }}>ANTES</Text>
                </View>
              </View>
              <View style={{ width: 1, backgroundColor: '#fff' }} />
              <View style={{ flex: 1 }}>
                <Image source={{ uri: afterPhoto.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <View style={{ position: 'absolute', top: 70, right: 14, backgroundColor: 'rgba(255,255,255,0.92)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 100 }}>
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 10, fontWeight: '800', color: ink, letterSpacing: 1 }}>DEPOIS</Text>
                </View>
              </View>
              {/* Centro: divisor circular com setas */}
              <View style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -18, marginTop: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <Icon.back size={11} color={ink} stroke={2.5} />
                <Icon.forward size={11} color={ink} stroke={2.5} />
              </View>
              {/* Datas no rodapé das fotos */}
              <View style={{ position: 'absolute', bottom: 12, left: 14, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.5 }}>{fmtDate(beforePhoto.date)}</Text>
              </View>
              <View style={{ position: 'absolute', bottom: 12, right: 14, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.5 }}>{fmtDate(afterPhoto.date)}</Text>
              </View>
            </View>
          ) : (
            // Fallback editorial quando não tem 2 fotos
            <View style={{ height: 200, backgroundColor: theme.primarySoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 60 }}>
              <Icon.camera size={32} color={accent} stroke={1.5} />
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: sub, textAlign: 'center', marginTop: 8 }}>
                Adicione fotos na aba Fotos pra ter um antes/depois visual aqui.
              </Text>
            </View>
          )}

          {/* ─── Título editorial ─── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 22, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONT.serif, fontSize: 40, color: ink, letterSpacing: -1, lineHeight: 44 }}>
              Minha
            </Text>
            <Text style={{ fontFamily: FONT.serifItalic, fontSize: 40, color: ink, letterSpacing: -1, lineHeight: 44, marginTop: -4 }}>
              jornada
            </Text>
          </View>

          {/* ─── Hero metric ─── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 18, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={{ fontFamily: FONT.serif, fontSize: 72, color: accent, letterSpacing: -3, lineHeight: 72 }}>
                {stats.lost > 0 ? '−' : stats.lost < 0 ? '+' : ''}{fmtKg(Math.abs(stats.lost))}
              </Text>
              <Text style={{ fontFamily: FONT.serif, fontSize: 28, color: ink, letterSpacing: -0.5 }}>kg</Text>
            </View>
            <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 12, color: sub, fontWeight: '600', marginTop: 2 }}>
              em {stats.daysElapsed} {stats.daysElapsed === 1 ? 'dia' : 'dias'}
            </Text>
          </View>

          {/* ─── Slider linear: INÍCIO → AGORA → META ─── */}
          {stats.start != null && stats.current != null && (
            <View style={{ paddingHorizontal: 30, paddingTop: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={{ fontFamily: FONT.serif, fontSize: 18, color: ink, letterSpacing: -0.3 }}>
                    {fmtKg(stats.start)}<Text style={{ fontSize: 11 }}> kg</Text>
                  </Text>
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 9, fontWeight: '800', color: sub, letterSpacing: 1, marginTop: 2 }}>INÍCIO</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT.serif, fontSize: 18, color: accent, letterSpacing: -0.3 }}>
                    {fmtKg(stats.current)}<Text style={{ fontSize: 11 }}> kg</Text>
                  </Text>
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 9, fontWeight: '800', color: accent, letterSpacing: 1, marginTop: 2 }}>AGORA</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: FONT.serif, fontSize: 18, color: ink, letterSpacing: -0.3 }}>
                    {fmtKg(weightGoalKg)}<Text style={{ fontSize: 11 }}> kg</Text>
                  </Text>
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 9, fontWeight: '800', color: sub, letterSpacing: 1, marginTop: 2 }}>META</Text>
                </View>
              </View>
              {/* Track */}
              <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(31,30,27,0.12)', marginTop: 4 }}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: accent, width: `${sliderPos * 100}%` }} />
              </View>
              {/* Indicador "AGORA" como bolinha sobre o track */}
              <View
                style={{
                  position: 'absolute',
                  bottom: -4,
                  left: 30,
                  right: 30,
                }}
              >
                <View style={{ width: '100%', height: 12, position: 'relative' }}>
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: `${sliderPos * 100}%`,
                      marginLeft: -6,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: accent,
                      borderWidth: 2,
                      borderColor: bg,
                    }}
                  />
                </View>
              </View>
            </View>
          )}

          {/* ─── 3 stat cards ─── */}
          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 28 }}>
            <StatCard icon={Icon.flame} value={bestStreak} label={`${bestStreak === 1 ? 'dia' : 'dias'} de ofensiva`} ink={ink} sub={sub} />
            <StatCard icon={Icon.flag} value={weightEntries.length} label={weightEntries.length === 1 ? 'pesagem' : 'pesagens'} ink={ink} sub={sub} />
            <StatCard icon={Icon.gallery} value={progressPhotos.length} label={`${progressPhotos.length === 1 ? 'foto de' : 'fotos de'} progresso`} ink={ink} sub={sub} />
          </View>

          {/* ─── Hábitos mantidos (mantido do original, redesenhado) ─── */}
          {topHabits.length > 0 && (
            <View style={{ paddingHorizontal: 22, paddingTop: 28 }}>
              <Text style={{ fontFamily: FONT.bodyBold, fontSize: 10, fontWeight: '800', color: sub, letterSpacing: 1.4, marginBottom: 10 }}>
                HÁBITOS MANTIDOS
              </Text>
              <View style={{ gap: 10 }}>
                {topHabits.map((h) => (
                  <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(31,30,27,0.1)' }}>
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: PALETTE.warning + '22', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon.flame size={14} color={PALETTE.warning} />
                    </View>
                    <Text style={{ flex: 1, fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: ink }} numberOfLines={1}>
                      {h.name}
                    </Text>
                    <Text style={{ fontFamily: FONT.serif, fontSize: 20, color: ink, letterSpacing: -0.3 }}>
                      {h.streak}
                    </Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: 10, color: sub, fontWeight: '600' }}>dias</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ─── Quote editorial ─── */}
          <View style={{ paddingHorizontal: 22, paddingTop: 28 }}>
            <Text style={{ fontFamily: FONT.serifItalic, fontSize: 20, color: ink, letterSpacing: -0.4, lineHeight: 27 }}>
              “{quote}”
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <Avatar uri={profilePhotoUri} initials="LS" size={28} />
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: sub }}>
                Larissa · resumo de Lu
              </Text>
            </View>
          </View>

          {/* Footer brand */}
          <View style={{ paddingTop: 24, paddingBottom: 20, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONT.bodyBold, fontSize: 10, fontWeight: '800', color: sub, letterSpacing: 1.4 }}>
              NUTRI LU
            </Text>
          </View>
        </ViewShot>

        {sharing && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
            <ActivityIndicator size="small" color={accent} />
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: sub }}>Gerando imagem…</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard: React.FC<{
  icon: React.FC<{ size?: number; color?: string; stroke?: number }>;
  value: number;
  label: string;
  ink: string;
  sub: string;
}> = ({ icon: IconC, value, label, ink, sub }) => (
  <View style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', gap: 4 }}>
    <IconC size={16} color={sub} stroke={2} />
    <Text style={{ fontFamily: FONT.serif, fontSize: 26, color: ink, letterSpacing: -0.5, lineHeight: 30, marginTop: 4 }}>
      {value}
    </Text>
    <Text style={{ fontFamily: FONT.body, fontSize: 10, color: sub, textAlign: 'center', lineHeight: 13, fontWeight: '600' }}>
      {label}
    </Text>
  </View>
);
