// Slider de intensidade pra Tela 10 (Velocidade de progresso) do onboarding.
//
// Comportamento:
// - SpeedGauge (velocímetro SVG semicircular) acima — ponteiro acompanha o valor,
//   3 zonas coloridas comunicam segurança sem precisar de label.
// - Slider customizado abaixo (PanResponder, sem dep externa).
// - Pill de feedback contextual abaixo do slider muda de copy + cor por zona.
//
// Zonas (precisam casar com SLOW_END/MID_END do SpeedGauge):
// - slow (0.10–0.30 kg): pill cinza "Devagar e firme"
// - mid  (0.31–1.00 kg): pill cinza "Recomendado"
// - fast (1.01–1.50 kg): pill laranja "Cuidado: pode causar fadiga..."

import React, { useRef } from 'react';
import {
  View,
  Text,
  PanResponder,
  type LayoutChangeEvent,
} from 'react-native';
import { useTheme, FONT } from '../theme';
import { SpeedGauge } from './SpeedGauge';

const MIN = 0.1;
const MAX = 1.5;
// STEP=0.1 casa exatamente com o display em 1 casa decimal — sem jumps
// perceptíveis no número grande quando arrasta o slider.
const STEP = 0.1;
const HANDLE = 28;
const TRACK_H = 6;

type Zone = 'slow' | 'mid' | 'fast';
function zoneOf(v: number): Zone {
  if (v <= 0.3) return 'slow';
  if (v <= 1.0) return 'mid';
  return 'fast';
}

// Arredonda pro step mais próximo e clamp em [MIN, MAX].
function clampToStep(raw: number): number {
  const stepped = Math.round(raw / STEP) * STEP;
  return Math.max(MIN, Math.min(MAX, stepped));
}

type Props = {
  value: number;
  onChange: (v: number) => void;
  /** Label em caps acima do número dentro do gauge — ex.: "PERDA POR SEMANA". */
  gaugeLabel: string;
  /** Define copy da pill por zona — "lose" fala de massa magra, "gain" de gordura. */
  mode: 'lose' | 'gain';
};

export const AnimalSlider: React.FC<Props> = ({ value, onChange, gaugeLabel, mode }) => {
  const theme = useTheme();
  const zone = zoneOf(value);
  const trackWidthRef = useRef(0);
  const currentValueRef = useRef(value);
  currentValueRef.current = value;
  // Valor no momento do "press down" — usado como base do drag.
  // Drag relativo é mais estável que ler locationX a cada frame, que tem
  // jitter do dedo no Android cruzando boundaries de zona rapidamente.
  const startValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // PanResponder com dois modos:
  // - GRANT (tap inicial): snap pra posição absoluta tocada (locationX)
  // - MOVE (drag): atualiza relativo ao valor inicial usando gesture.dx
  //
  // Isso elimina o jitter porque dx é acumulado pelo sistema e cresce
  // monotonicamente conforme o dedo se move, sem oscilações por sub-pixel.
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const w = trackWidthRef.current;
        if (w <= 0) return;
        const x = e.nativeEvent.locationX;
        const pct = Math.max(0, Math.min(1, x / w));
        const raw = MIN + pct * (MAX - MIN);
        const stepped = clampToStep(raw);
        // Snap pra posição tocada
        if (stepped !== currentValueRef.current) {
          currentValueRef.current = stepped;
          onChangeRef.current(parseFloat(stepped.toFixed(2)));
        }
        // Base do drag começa daqui
        startValueRef.current = stepped;
      },
      onPanResponderMove: (_, gesture) => {
        const w = trackWidthRef.current;
        if (w <= 0) return;
        // Delta acumulado desde o press → fração da largura → delta de valor
        const dxPct = gesture.dx / w;
        const raw = startValueRef.current + dxPct * (MAX - MIN);
        const stepped = clampToStep(raw);
        if (stepped !== currentValueRef.current) {
          currentValueRef.current = stepped;
          onChangeRef.current(parseFloat(stepped.toFixed(2)));
        }
      },
    }),
  ).current;

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidthRef.current = e.nativeEvent.layout.width;
  };

  const pct = (value - MIN) / (MAX - MIN);
  const fillColor = zone === 'fast' ? theme.warning : theme.primary;

  const pillCfg = {
    slow: {
      bg: theme.bgSubtle,
      color: theme.text,
      text:
        mode === 'gain'
          ? 'Devagar e firme. Ganho limpo de massa magra.'
          : 'Devagar e firme. Sustentável a longo prazo.',
    },
    mid: { bg: theme.bgSubtle, color: theme.text, text: 'Recomendado' },
    fast: {
      bg: theme.warningSoft,
      color: theme.warningDeep,
      text:
        mode === 'gain'
          ? 'Cuidado: pode acumular mais gordura que músculo. A Lu não recomenda.'
          : 'Cuidado: pode causar fadiga e perda de massa magra. A Lu não recomenda.',
    },
  }[zone];

  return (
    <View>
      {/* Velocímetro SVG — ponteiro acompanha o valor, número grande ao centro */}
      <View style={{ marginBottom: 18 }}>
        <SpeedGauge value={value} label={gaugeLabel} />
      </View>

      {/* Track + handle, recebe gestos via PanResponder */}
      <View
        {...pan.panHandlers}
        onLayout={onTrackLayout}
        style={{
          height: HANDLE + 8, // hit area maior que o track
          justifyContent: 'center',
        }}
      >
        {/* Track de fundo (cinza claro) */}
        <View
          style={{
            height: TRACK_H,
            backgroundColor: theme.bgSubtle,
            borderRadius: TRACK_H / 2,
          }}
        />
        {/* Fill preenchido até o handle */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: (HANDLE + 8 - TRACK_H) / 2,
            height: TRACK_H,
            width: `${pct * 100}%`,
            backgroundColor: fillColor,
            borderRadius: TRACK_H / 2,
          }}
        />
        {/* Handle circular */}
        <View
          style={{
            position: 'absolute',
            left: `${pct * 100}%`,
            marginLeft: -HANDLE / 2,
            width: HANDLE,
            height: HANDLE,
            borderRadius: HANDLE / 2,
            backgroundColor: '#FFFFFF',
            borderWidth: 2,
            borderColor: fillColor,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        />
      </View>

      {/* Labels do range */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 6,
        }}
      >
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>0,1 kg</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>0,8 kg</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>1,5 kg</Text>
      </View>

      {/* Pill de feedback contextual */}
      <View style={{ marginTop: 18, alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: pillCfg.bg,
            borderRadius: 14,
            paddingHorizontal: 18,
            paddingVertical: 12,
            maxWidth: 300,
          }}
        >
          <Text
            style={{
              fontFamily: FONT.bodyMedium,
              fontSize: 13,
              color: pillCfg.color,
              textAlign: 'center',
              lineHeight: 18,
            }}
          >
            {pillCfg.text}
          </Text>
        </View>
      </View>
    </View>
  );
};

