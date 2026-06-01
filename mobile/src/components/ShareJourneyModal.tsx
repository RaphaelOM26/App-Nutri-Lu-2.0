// Modal "Compartilhar jornada" — gera um card visual da JORNADA de progresso
// (não do dia, como o ShareProgressModal). Foca na perda de peso, progresso
// até a meta, e métricas que dão orgulho de postar. Capturado como PNG via
// react-native-view-shot e compartilhado via expo-sharing.

import React, { useRef, useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Svg, { Polyline, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { useTheme, FONT, PALETTE } from '../theme';
import { IconBtn } from './IconBtn';
import { Btn } from './Btn';
import { Icon } from './Icons';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

type Props = { visible: boolean; onClose: () => void };

const DAY_MS = 24 * 60 * 60 * 1000;

export const ShareJourneyModal: React.FC<Props> = ({ visible, onClose }) => {
  const theme = useTheme();
  const { weightEntries, weightGoalKg } = useApp();
  const toast = useToast();
  const shotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  // Métricas pra exibir
  const journey = useMemo(() => {
    if (weightEntries.length === 0) return null;
    const sorted = [...weightEntries].sort((a, b) => a.date - b.date);
    const startEntry = sorted[0];
    const currentEntry = sorted[sorted.length - 1];
    const start = startEntry.kg;
    const current = currentEntry.kg;
    const lost = start - current;
    const totalToLose = start - weightGoalKg;
    const progress = totalToLose > 0 ? Math.max(0, Math.min(100, Math.round(((start - current) / totalToLose) * 100))) : 100;
    const daysElapsed = Math.max(1, Math.round((currentEntry.date - startEntry.date) / DAY_MS));
    // Trend dos últimos 30 dias (para o sparkline)
    const cutoff = currentEntry.date - 30 * DAY_MS;
    const recent = sorted.filter((e) => e.date >= cutoff);
    return { start, current, lost, totalToLose, progress, daysElapsed, recent };
  }, [weightEntries, weightGoalKg]);

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
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartilhar jornada de progresso' });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao compartilhar', 'error');
    } finally {
      setSharing(false);
    }
  };

  const fmt = (k: number) => k.toFixed(1).replace('.', ',');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: theme.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 18,
            paddingBottom: 32,
            gap: 14,
            maxHeight: '92%',
          }}
        >
          <View style={{ alignItems: 'center', paddingBottom: 2 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>
              Compartilhar jornada
            </Text>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          {/* Pré-visualização do card */}
          <View style={{ alignItems: 'center' }}>
            <ViewShot
              ref={shotRef}
              options={{ format: 'png', quality: 1 }}
              style={{ width: 320, borderRadius: 28, overflow: 'hidden' }}
            >
              <ShareCard journey={journey} weightGoalKg={weightGoalKg} fmt={fmt} />
            </ViewShot>
          </View>

          {!journey && (
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
              Registre pelo menos uma pesagem pra gerar seu card de jornada.
            </Text>
          )}

          {/* CTA */}
          <Btn
            variant="primary"
            size="lg"
            icon={Icon.send}
            onPress={captureAndShare}
            disabled={sharing || !journey}
            full
          >
            Compartilhar nas redes
          </Btn>

          <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint, textAlign: 'center' }}>
            Instagram, WhatsApp, TikTok e mais
          </Text>

          {sharing && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>Gerando imagem…</Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── Card que vira PNG ───────────────────────────────────────────
type Journey = {
  start: number;
  current: number;
  lost: number;
  totalToLose: number;
  progress: number;
  daysElapsed: number;
  recent: { date: number; kg: number }[];
};

type CardProps = {
  journey: Journey | null;
  weightGoalKg: number;
  fmt: (k: number) => string;
};

const ShareCard: React.FC<CardProps> = ({ journey, weightGoalKg, fmt }) => {
  // Card grande estilo Instagram Story (1:1.4 ish). Usa cores fixas (não theme)
  // pra renderizar igual em dark mode também.
  const bg = '#FBFAF7'; // off-white quente
  const ink = '#1B1B1B';
  const sub = 'rgba(27,27,27,0.6)';
  const accent = PALETTE.primaryDeep;
  const accentSoft = PALETTE.primarySoft;
  const lostColor = PALETTE.primaryDeep;

  if (!journey) {
    return (
      <View style={{ width: 320, padding: 26, backgroundColor: bg, gap: 8 }}>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: sub, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Nutri Lu
        </Text>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: ink }}>
          Sem pesagens registradas ainda
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 13, color: sub }}>
          Adicione uma pesagem pra começar sua jornada.
        </Text>
      </View>
    );
  }

  const trendKg = journey.recent.map((e) => e.kg);
  const minK = Math.min(...trendKg, weightGoalKg);
  const maxK = Math.max(...trendKg);
  const range = Math.max(0.5, maxK - minK);
  const W = 280, H = 56;
  const polylinePts = journey.recent.map((e, i, arr) => {
    const x = (i / Math.max(1, arr.length - 1)) * W;
    const y = H - ((e.kg - minK) / range) * H;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={{ width: 320, padding: 24, backgroundColor: bg, gap: 16 }}>
      {/* Header brand */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.sparkle size={14} color={accent} stroke={2} />
          </View>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 12, fontWeight: '800', color: ink, letterSpacing: 0.4 }}>
            NUTRI LU
          </Text>
        </View>
        <Text style={{ fontFamily: FONT.body, fontSize: 10, color: sub, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          minha jornada
        </Text>
      </View>

      {/* Hero metric: kg perdidos */}
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: sub, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {journey.lost > 0 ? 'Perdi até agora' : journey.lost < 0 ? 'Ganhei até agora' : 'Mantenho meu peso'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 56, fontWeight: '800', color: journey.lost > 0 ? lostColor : ink, letterSpacing: -1.5, lineHeight: 56 }}>
            {journey.lost > 0 ? '−' : journey.lost < 0 ? '+' : ''}{fmt(Math.abs(journey.lost))}
          </Text>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: ink, marginLeft: 2 }}>
            kg
          </Text>
        </View>
        <Text style={{ fontFamily: FONT.body, fontSize: 12, color: sub, fontWeight: '600' }}>
          em {journey.daysElapsed} {journey.daysElapsed === 1 ? 'dia' : 'dias'} de jornada
        </Text>
      </View>

      {/* Sparkline dos últimos 30d */}
      {journey.recent.length >= 2 && (
        <View style={{ height: H, justifyContent: 'flex-end' }}>
          <Svg width={W} height={H}>
            <Defs>
              <LinearGradient id="gline" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={accent} stopOpacity={0.18} />
                <Stop offset="1" stopColor={accent} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {/* Área */}
            <Path
              d={`M 0,${H} L ${polylinePts.split(' ').join(' L ')} L ${W},${H} Z`}
              fill="url(#gline)"
            />
            <Polyline
              points={polylinePts}
              fill="none"
              stroke={accent}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}

      {/* Progress bar até a meta */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontFamily: FONT.head, fontSize: 12, color: ink, fontWeight: '700' }}>
            Progresso até a meta
          </Text>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, color: accent, fontWeight: '800' }}>
            {journey.progress}%
          </Text>
        </View>
        <View style={{ height: 10, borderRadius: 100, backgroundColor: '#EAE7E1', overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${journey.progress}%`, backgroundColor: accent, borderRadius: 100 }} />
        </View>
      </View>

      {/* 3 stats: Início · Atual · Meta */}
      <View style={{ flexDirection: 'row', gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EAE7E1' }}>
        <Stat label="Início" value={fmt(journey.start)} ink={ink} sub={sub} />
        <Stat label="Atual" value={fmt(journey.current)} ink={ink} sub={sub} highlight={accent} />
        <Stat label="Meta" value={fmt(weightGoalKg)} ink={ink} sub={sub} />
      </View>

      {/* Footer */}
      <View style={{ paddingTop: 8, alignItems: 'center' }}>
        <Text style={{ fontFamily: FONT.body, fontSize: 10, color: sub, fontWeight: '600' }}>
          Acompanhando com Nutri Lu 🥗
        </Text>
      </View>
    </View>
  );
};

const Stat: React.FC<{ label: string; value: string; ink: string; sub: string; highlight?: string }> = ({ label, value, ink, sub, highlight }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={{ fontFamily: FONT.body, fontSize: 9, color: sub, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
      {label}
    </Text>
    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
      <Text style={{ fontFamily: FONT.headExtra, fontSize: 20, fontWeight: '800', color: highlight ?? ink, letterSpacing: -0.4 }}>
        {value}
      </Text>
      <Text style={{ fontFamily: FONT.body, fontSize: 10, color: sub, fontWeight: '700', marginLeft: 2 }}>kg</Text>
    </View>
  </View>
);
