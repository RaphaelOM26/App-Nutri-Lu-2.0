// Modal "Editar metas" — peso alvo + calorias diárias + 3 macros (P/C/G).
// O nome do arquivo é legado (EditWeightGoalModal) mas hoje cobre todas as
// metas porque o usuário pediu pra unificar.

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, TextInput, Platform, ScrollView } from 'react-native';
import { useTheme, FONT } from '../theme';
import { Icon } from './Icons';
import { IconBtn } from './IconBtn';
import { Btn } from './Btn';
import type { MacroTargets } from '../storage/userProfile';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentKg: number;
  currentTargets: MacroTargets;
  onSave: (data: { kg: number; targets: MacroTargets }) => void;
};

// Faixas plausíveis pra validação
const RANGES = {
  kg: { min: 30, max: 250, label: 'kg' },
  kcal: { min: 800, max: 6000, label: 'kcal' },
  p: { min: 20, max: 400, label: 'g' },
  c: { min: 20, max: 800, label: 'g' },
  f: { min: 10, max: 300, label: 'g' },
} as const;

export const EditWeightGoalModal: React.FC<Props> = ({ visible, onClose, currentKg, currentTargets, onSave }) => {
  const theme = useTheme();
  const [kgText, setKgText] = useState(currentKg.toFixed(1).replace('.', ','));
  const [kcalText, setKcalText] = useState(String(currentTargets.kcal));
  const [pText, setPText] = useState(String(currentTargets.p));
  const [cText, setCText] = useState(String(currentTargets.c));
  const [fText, setFText] = useState(String(currentTargets.f));

  useEffect(() => {
    if (!visible) return;
    setKgText(currentKg.toFixed(1).replace('.', ','));
    setKcalText(String(currentTargets.kcal));
    setPText(String(currentTargets.p));
    setCText(String(currentTargets.c));
    setFText(String(currentTargets.f));
  }, [visible, currentKg, currentTargets]);

  const kg = parseFloat(kgText.replace(',', '.'));
  const kcal = parseInt(kcalText, 10);
  const p = parseInt(pText, 10);
  const c = parseInt(cText, 10);
  const f = parseInt(fText, 10);

  const validKg = Number.isFinite(kg) && kg >= RANGES.kg.min && kg <= RANGES.kg.max;
  const validKcal = Number.isFinite(kcal) && kcal >= RANGES.kcal.min && kcal <= RANGES.kcal.max;
  const validP = Number.isFinite(p) && p >= RANGES.p.min && p <= RANGES.p.max;
  const validC = Number.isFinite(c) && c >= RANGES.c.min && c <= RANGES.c.max;
  const validF = Number.isFinite(f) && f >= RANGES.f.min && f <= RANGES.f.max;
  const allValid = validKg && validKcal && validP && validC && validF;

  // Estimativa rápida: kcal calculado das gramas dos macros (P*4 + C*4 + G*9)
  const calcFromMacros = (Number.isFinite(p) ? p * 4 : 0) + (Number.isFinite(c) ? c * 4 : 0) + (Number.isFinite(f) ? f * 9 : 0);
  const calcDiff = Number.isFinite(kcal) ? Math.abs(calcFromMacros - kcal) : 0;
  const showMismatch = allValid && calcDiff > 100;

  const submit = () => {
    if (!allValid) return;
    onSave({
      kg: Math.round(kg * 10) / 10,
      targets: { kcal: Math.round(kcal), p: Math.round(p), c: Math.round(c), f: Math.round(f) },
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 22, gap: 14, maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon.flag size={18} color={theme.primaryDeep} stroke={2} />
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>Editar metas</Text>
            </View>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 4 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, lineHeight: 17 }}>
              Defina seu peso alvo e suas metas diárias. Os cálculos de progresso, gráficos e linha pontilhada vão acompanhar.
            </Text>

            {/* PESO ALVO — hero input */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Peso alvo
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, justifyContent: 'center', paddingVertical: 2 }}>
                <TextInput
                  value={kgText}
                  onChangeText={setKgText}
                  keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                  selectTextOnFocus
                  style={{
                    fontFamily: FONT.headExtra,
                    fontSize: 36,
                    fontWeight: '800',
                    color: theme.text,
                    textAlign: 'center',
                    minWidth: 120,
                    paddingVertical: 4,
                    borderBottomWidth: 2,
                    borderBottomColor: validKg ? theme.primaryDeep : '#D67373',
                    letterSpacing: -0.5,
                  }}
                />
                <Text style={{ fontFamily: FONT.body, fontSize: 14, color: theme.textMuted, fontWeight: '600' }}>kg</Text>
              </View>
            </View>

            {/* CALORIAS DIÁRIAS */}
            <Field
              label="Calorias diárias"
              value={kcalText}
              onChange={setKcalText}
              unit="kcal"
              valid={validKcal}
            />

            {/* MACROS — grid 3 colunas */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Macros diários
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <MacroField
                  label="Proteína"
                  color={theme.proteinPink}
                  value={pText}
                  onChange={setPText}
                  valid={validP}
                />
                <MacroField
                  label="Carbo"
                  color={theme.carbsBlue}
                  value={cText}
                  onChange={setCText}
                  valid={validC}
                />
                <MacroField
                  label="Gordura"
                  color={theme.fatsGold}
                  value={fText}
                  onChange={setFText}
                  valid={validF}
                />
              </View>
            </View>

            {showMismatch && (
              <View style={{ padding: 10, borderRadius: 10, backgroundColor: '#FDF1E5', flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: '#8A4B0F', flex: 1, lineHeight: 15 }}>
                  💡 Macros somam ~{calcFromMacros} kcal — está {calcFromMacros > kcal ? 'acima' : 'abaixo'} da sua meta calórica em {calcDiff} kcal.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Btn variant="outline" size="md" onPress={onClose} full>Cancelar</Btn>
            </View>
            <View style={{ flex: 1 }}>
              <Btn variant="primary" size="md" onPress={submit} disabled={!allValid} full>Salvar</Btn>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  valid: boolean;
}> = ({ label, value, onChange, unit, valid }) => {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 12,
          backgroundColor: theme.bgElev,
          borderWidth: 1,
          borderColor: valid ? 'transparent' : '#D67373',
          paddingHorizontal: 14,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          selectTextOnFocus
          style={{
            flex: 1,
            fontFamily: FONT.headExtra,
            fontSize: 20,
            fontWeight: '800',
            color: theme.text,
            paddingVertical: 12,
            letterSpacing: -0.3,
          }}
        />
        <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, fontWeight: '700' }}>{unit}</Text>
      </View>
    </View>
  );
};

const MacroField: React.FC<{
  label: string;
  color: string;
  value: string;
  onChange: (v: string) => void;
  valid: boolean;
}> = ({ label, color, value, onChange, valid }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        borderRadius: 12,
        backgroundColor: theme.bgElev,
        borderWidth: 1,
        borderColor: valid ? 'transparent' : '#D67373',
        gap: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '700' }}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          selectTextOnFocus
          style={{
            fontFamily: FONT.headExtra,
            fontSize: 22,
            fontWeight: '800',
            color: theme.text,
            paddingVertical: 4,
            flex: 1,
            letterSpacing: -0.3,
          }}
        />
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700' }}>g</Text>
      </View>
    </View>
  );
};
