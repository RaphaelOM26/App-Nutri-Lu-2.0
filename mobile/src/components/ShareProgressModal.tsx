// Modal "Compartilhar progresso" — gera um card visual com macros do dia,
// captura como PNG via react-native-view-shot e abre opções de share.
//
// Fluxo:
//   1) Renderiza um card bonito (off-screen) com kcal/macros + meta + data
//   2) ViewShot.capture() retorna URI de PNG temporário
//   3) User escolhe: Instagram Stories / Status WhatsApp / Mais opções
//   4) Sharing.shareAsync(uri) abre o sheet nativo (todos os apps suportam imagem)

import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useTheme, FONT } from '../theme';
import { IconBtn } from './IconBtn';
import { Icon } from './Icons';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

type Props = { visible: boolean; onClose: () => void };

const WEEKDAY_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function formatTodayBR(): string {
  const d = new Date();
  return `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]}`;
}

export const ShareProgressModal: React.FC<Props> = ({ visible, onClose }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { displayedMacros, water } = useApp();
  const toast = useToast();
  const shotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  const captureAndShare = async (intent: 'whatsapp' | 'instagram' | 'other') => {
    if (sharing) return;
    setSharing(true);
    try {
      // 1) Captura o card como PNG
      const uri = await captureRef(shotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // 2) Tenta abrir o app específico via deeplink; fallback no Sharing.shareAsync
      if (intent === 'whatsapp' && Platform.OS !== 'web') {
        // WhatsApp aceita compartilhar via intent — usamos o Sharing que dispara
        // o picker do sistema com WhatsApp em destaque. Sem dep extra de deeplink
        // de imagem (que só funciona com content://).
      }
      if (intent === 'instagram' && Platform.OS !== 'web') {
        // Instagram Stories tem deeplink mas requer permissões extra. Fallback OK.
      }

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        toast('Compartilhamento não disponível neste dispositivo', 'error');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar progresso do dia',
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao compartilhar', 'error');
    } finally {
      setSharing(false);
    }
  };

  const pct = displayedMacros.kcal.target
    ? Math.round((displayedMacros.kcal.value / displayedMacros.kcal.target) * 100)
    : 0;
  const waterPct = Math.min(100, Math.round((water / 8) * 100));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Math.max(32, insets.bottom + 16), gap: 16, maxHeight: '90%' }}
        >
          <View style={{ alignItems: 'center', paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>
              Compartilhar progresso
            </Text>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          {/* Pré-visualização do card que vai ser compartilhado */}
          <View style={{ alignItems: 'center' }}>
            <ViewShot
              ref={shotRef}
              options={{ format: 'png', quality: 1 }}
              style={{ width: 280, borderRadius: 24, overflow: 'hidden' }}
            >
              <View
                style={{
                  width: 280,
                  padding: 22,
                  backgroundColor: theme.bg,
                  gap: 14,
                }}
              >
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: '700', color: theme.primaryDeep, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      NUTRI LU
                    </Text>
                    <Text style={{ fontFamily: FONT.head, fontSize: 11, color: theme.textMuted, fontWeight: '600', marginTop: 2 }}>
                      {formatTodayBR()}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: theme.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon.sparkle size={18} color={theme.primaryDeep} stroke={2} />
                  </View>
                </View>

                {/* KCAL grande */}
                <View>
                  <Text style={{ fontFamily: FONT.headExtra, fontSize: 36, fontWeight: '800', color: theme.text, letterSpacing: -0.5 }}>
                    {displayedMacros.kcal.value}
                    <Text style={{ fontSize: 14, color: theme.textMuted, fontWeight: '600' }}>
                      {' '}/ {displayedMacros.kcal.target} kcal
                    </Text>
                  </Text>
                  <View style={{ height: 6, borderRadius: 100, backgroundColor: theme.ringTrack, marginTop: 8, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${Math.min(100, pct)}%`, backgroundColor: theme.primary }} />
                  </View>
                  <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, marginTop: 4, fontWeight: '600' }}>
                    {pct}% da meta diária
                  </Text>
                </View>

                {/* Macros */}
                <View style={{ gap: 8 }}>
                  <MacroRow label="Proteína" val={displayedMacros.p.value} target={displayedMacros.p.target} color={theme.proteinPink} />
                  <MacroRow label="Carbo" val={displayedMacros.c.value} target={displayedMacros.c.target} color={theme.carbsBlue} />
                  <MacroRow label="Gordura" val={displayedMacros.f.value} target={displayedMacros.f.target} color={theme.fatsGold} />
                </View>

                {/* Hidratação */}
                <View style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon.water size={14} color={theme.waterIce} />
                  <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 11, color: theme.text, fontWeight: '600' }}>
                    Hidratação
                  </Text>
                  <Text style={{ fontFamily: FONT.head, fontSize: 12, color: theme.text, fontWeight: '700' }}>
                    {water * 250}ml{' '}
                    <Text style={{ color: theme.textMuted, fontWeight: '600' }}>· {waterPct}%</Text>
                  </Text>
                </View>

                <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.textFaint, textAlign: 'center', marginTop: 4 }}>
                  Acompanhando minha rotina no Nutri Lu 🥗
                </Text>
              </View>
            </ViewShot>
          </View>

          {/* Submenu social */}
          <View style={{ gap: 8 }}>
            <ShareOption
              icon={Icon.send}
              tint="#E1306C"
              tintBg="#FCE4EC"
              title="Compartilhar nas redes"
              subtitle="Instagram, WhatsApp, TikTok…"
              disabled={sharing}
              onPress={() => captureAndShare('other')}
            />
          </View>

          {sharing && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>
                Gerando imagem…
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const MacroRow: React.FC<{ label: string; val: number; target: number; color: string }> = ({ label, val, target, color }) => {
  const theme = useTheme();
  const pct = target ? Math.min(100, Math.round((val / target) * 100)) : 0;
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.text, fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontFamily: FONT.head, fontSize: 11, color: theme.text, fontWeight: '700' }}>
          {val}g{' '}
          <Text style={{ color: theme.textMuted, fontWeight: '600' }}>/ {target}g</Text>
        </Text>
      </View>
      <View style={{ height: 4, borderRadius: 100, backgroundColor: theme.ringTrack, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
};

const ShareOption: React.FC<{
  icon: React.FC<{ size?: number; color?: string; stroke?: number }>;
  tint: string;
  tintBg: string;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onPress: () => void;
}> = ({ icon: IconC, tint, tintBg, title, subtitle, disabled, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        backgroundColor: theme.bgElev,
        borderRadius: 14,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: tintBg, alignItems: 'center', justifyContent: 'center' }}>
        <IconC size={18} color={tint} stroke={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text }}>{title}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{subtitle}</Text>
      </View>
      <Icon.forward size={16} color={theme.textMuted} />
    </Pressable>
  );
};
