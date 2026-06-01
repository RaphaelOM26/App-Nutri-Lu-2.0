// Bottom-sheet do menu ⋮ da tela Progresso.
// Três opções: editar meta, configurar lembretes, compartilhar jornada.

import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTheme, FONT } from '../theme';
import { Icon } from './Icons';

type Props = {
  visible: boolean;
  onClose: () => void;
  onEditGoal: () => void;
  onReminders: () => void;
  onShare: () => void;
};

export const ProgressMenuSheet: React.FC<Props> = ({ visible, onClose, onEditGoal, onReminders, onShare }) => {
  const theme = useTheme();
  // Aguarda 250ms (tempo da animação de fade do Modal) antes de abrir o próximo,
  // pra evitar dois modais sobrepostos brevemente.
  const pick = (cb: () => void) => () => { onClose(); setTimeout(cb, 250); };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 28, gap: 4 }}>
          <View style={{ alignItems: 'center', paddingBottom: 6 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
          </View>
          <MenuItem
            icon={Icon.flag}
            tint={theme.primaryDeep}
            tintBg={theme.primarySoft}
            title="Editar meta"
            subtitle="Ajustar peso alvo"
            onPress={pick(onEditGoal)}
          />
          <MenuItem
            icon={Icon.clock}
            tint="#B07A1E"
            tintBg="#F8ECD7"
            title="Configurar lembretes"
            subtitle="Lembre-se de pesar todo dia"
            onPress={pick(onReminders)}
          />
          <MenuItem
            icon={Icon.send}
            tint="#E1306C"
            tintBg="#FCE4EC"
            title="Compartilhar jornada"
            subtitle="Mostre seu progresso nas redes"
            onPress={pick(onShare)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const MenuItem: React.FC<{
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
