// Modal de configurações simples — tema + idioma.
// Tema é funcional (System/Claro/Escuro). Idioma fica em PT-BR com aviso de
// "em breve" pra outros idiomas (precisa de i18n setup).

import React from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useTheme, FONT } from '../theme';
import { useThemePref } from '../theme/ThemeContext';
import { Icon } from './Icons';
import { IconBtn } from './IconBtn';
import { useToast } from '../state/ToastContext';
import type { ThemePref } from '../storage/userProfile';

type Props = { visible: boolean; onClose: () => void };

const THEME_OPTIONS: { pref: ThemePref; label: string; subtitle: string; icon: string }[] = [
  { pref: 'system', label: 'Sistema', subtitle: 'Segue o tema do aparelho', icon: '⚙️' },
  { pref: 'light', label: 'Claro', subtitle: 'Sempre modo claro', icon: '☀️' },
  { pref: 'dark', label: 'Escuro', subtitle: 'Sempre modo escuro', icon: '🌙' },
];

export const SettingsModal: React.FC<Props> = ({ visible, onClose }) => {
  const theme = useTheme();
  const toast = useToast();
  const { pref, setPref } = useThemePref();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 22, gap: 14, maxHeight: '85%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon.settings size={18} color={theme.text} stroke={2} />
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>Configurações</Text>
            </View>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          <ScrollView contentContainerStyle={{ gap: 18 }}>
            {/* TEMA */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '800', color: theme.textMuted, letterSpacing: 1.2 }}>
                TEMA
              </Text>
              <View style={{ gap: 6 }}>
                {THEME_OPTIONS.map((opt) => {
                  const active = pref === opt.pref;
                  return (
                    <Pressable
                      key={opt.pref}
                      onPress={() => setPref(opt.pref)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        borderRadius: 14,
                        backgroundColor: active ? theme.primarySoft : theme.bgElev,
                        borderWidth: 1.5,
                        borderColor: active ? theme.primaryDeep : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: active ? theme.primaryDeep : theme.text }}>
                          {opt.label}
                        </Text>
                        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
                          {opt.subtitle}
                        </Text>
                      </View>
                      {active && <Icon.check size={16} color={theme.primaryDeep} stroke={2.5} />}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* IDIOMA */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '800', color: theme.textMuted, letterSpacing: 1.2 }}>
                IDIOMA
              </Text>
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: theme.primarySoft,
                  borderWidth: 1.5,
                  borderColor: theme.primaryDeep,
                }}
              >
                <Text style={{ fontSize: 22 }}>🇧🇷</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.primaryDeep }}>
                    Português (Brasil)
                  </Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
                    Único idioma disponível agora
                  </Text>
                </View>
                <Icon.check size={16} color={theme.primaryDeep} stroke={2.5} />
              </Pressable>
              {/* Outros idiomas — placeholder em breve */}
              {[
                { flag: '🇺🇸', label: 'English (US)' },
                { flag: '🇪🇸', label: 'Español' },
              ].map((opt) => (
                <Pressable
                  key={opt.label}
                  onPress={() => toast(`${opt.label} em breve · queremos liberar pós-lançamento`, 'info')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: theme.bgElev,
                    opacity: 0.6,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{opt.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text }}>
                      {opt.label}
                    </Text>
                  </View>
                  <View style={{ paddingVertical: 3, paddingHorizontal: 8, backgroundColor: theme.bgSubtle, borderRadius: 100 }}>
                    <Text style={{ fontFamily: FONT.bodyBold, fontSize: 9, fontWeight: '800', color: theme.textMuted, letterSpacing: 0.5 }}>
                      EM BREVE
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint, lineHeight: 15, paddingTop: 4 }}>
              💡 Sua preferência de tema é salva — quando reabrir o app, mantém o que você escolheu.
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
