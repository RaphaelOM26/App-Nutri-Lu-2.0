// Bottom sheet modal pra registrar nova pesagem.
// Cross-platform (iOS + Android). Sem dependências extras.

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONT } from '../theme';
import { Btn } from './Btn';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (kg: number) => void;
};

export const AddWeightModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');

  // Reset ao abrir
  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  const handleSave = () => {
    // Aceita vírgula brasileira ou ponto
    const normalized = value.replace(',', '.').trim();
    const kg = parseFloat(normalized);
    if (!normalized || Number.isNaN(kg)) {
      Alert.alert('Peso inválido', 'Digite um número (ex: 85,2 ou 85.2).');
      return;
    }
    if (kg < 30 || kg > 300) {
      Alert.alert('Peso fora do esperado', 'Digite um valor entre 30 e 300 kg.');
      return;
    }
    onSave(Number(kg.toFixed(1)));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Overlay clicável pra fechar */}
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={onClose}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={{
              backgroundColor: theme.bgElev,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: Math.max(40, insets.bottom + 24),
            }}
          >
            {/* Handle drag indicator */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.borderStrong,
                alignSelf: 'center',
                marginBottom: 18,
              }}
            />

            <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
              Registrar peso
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, marginTop: 4 }}>
              Hoje, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            </Text>

            {/* Input grande estilo "calculadora" */}
            <View
              style={{
                marginTop: 24,
                backgroundColor: theme.bgSubtle,
                borderRadius: 18,
                paddingVertical: 16,
                paddingHorizontal: 18,
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder="0,0"
                placeholderTextColor={theme.textFaint}
                keyboardType="decimal-pad"
                autoFocus
                style={{
                  flex: 1,
                  fontFamily: FONT.headExtra,
                  fontSize: 40,
                  fontWeight: '800',
                  color: theme.text,
                  letterSpacing: -0.8,
                  padding: 0,
                }}
              />
              <Text style={{ fontFamily: FONT.head, fontSize: 18, fontWeight: '700', color: theme.textMuted }}>
                kg
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <View style={{ flex: 1 }}>
                <Btn variant="outline" onPress={onClose} full>
                  Cancelar
                </Btn>
              </View>
              <View style={{ flex: 1 }}>
                <Btn variant="primary" onPress={handleSave} full>
                  Salvar
                </Btn>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
