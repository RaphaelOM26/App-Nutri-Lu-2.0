// Velocímetro semicircular pra Tela 10 (Velocidade) do onboarding.
//
// Renderiza:
// - Arco em 3 zonas coloridas (sage suave / sage / laranja) proporcionais
//   ao range 0,1–1,5 kg/semana, refletindo os thresholds do RateSlider
//   (0,3 e 1,0 kg).
// - Ponteiro + pivô central apontando pro valor atual.
// - Bloco central com label (ex.: "PERDA POR SEMANA") + número grande + "kg".
//
// Sem animação Animated.Value: o ponteiro recalcula instantâneo a cada mudança
// de value, o que já dá fluidez porque o slider emite com frequência alta
// durante o drag e snap discreto nos taps.

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme, FONT } from '../theme';

// Geometria do gauge — values em px do viewBox.
const SIZE = 240;
const HEIGHT = 150;
const CX = SIZE / 2;
const CY = 128; // pivô fica perto da base
const R = 96; // raio do arco
const STROKE = 16;

// Thresholds das zonas (precisam casar com os do RateSlider).
const MIN = 0.1;
const MAX = 1.5;
const SLOW_END = 0.3;
const MID_END = 1.0;

type Zone = 'slow' | 'mid' | 'fast';
function zoneForValue(v: number): Zone {
  if (v <= SLOW_END) return 'slow';
  if (v <= MID_END) return 'mid';
  return 'fast';
}

// Mapeia value (0.1–1.5) → ângulo em graus (180°=esquerda até 360°=direita,
// passando pelo topo a 270°). SVG usa y crescendo pra baixo, então o eixo
// vertical fica invertido — angle=270° → ponto acima do pivô.
function angleForValue(v: number): number {
  const t = (v - MIN) / (MAX - MIN);
  return 180 + t * 180;
}

function pointAt(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

// Path SVG de um arco entre dois ângulos, raio fixo.
function arcPath(startAngle: number, endAngle: number, radius: number): string {
  const start = pointAt(startAngle, radius);
  const end = pointAt(endAngle, radius);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

type Props = {
  value: number;
  /** Caps label acima do número. Ex.: "PERDA POR SEMANA". */
  label: string;
};

export const SpeedGauge: React.FC<Props> = ({ value, label }) => {
  const theme = useTheme();

  const slowEndAngle = angleForValue(SLOW_END);
  const midEndAngle = angleForValue(MID_END);
  const markerAngle = angleForValue(value);
  const marker = pointAt(markerAngle, R);
  const zone = zoneForValue(value);
  const markerColor =
    zone === 'fast' ? theme.warning : zone === 'mid' ? theme.primary : theme.primarySoft;

  return (
    <View style={{ width: SIZE, height: HEIGHT, alignSelf: 'center' }}>
      <Svg width={SIZE} height={HEIGHT}>
        {/* Zona 1 — devagar (sage suave) */}
        <Path
          d={arcPath(180, slowEndAngle, R)}
          stroke={theme.primarySoft}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />
        {/* Zona 2 — recomendado (sage) */}
        <Path
          d={arcPath(slowEndAngle, midEndAngle, R)}
          stroke={theme.primary}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Zona 3 — cuidado (laranja) */}
        <Path
          d={arcPath(midEndAngle, 360, R)}
          stroke={theme.warning}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />
        {/* Marcador na borda do arco — círculo branco com borda da cor da zona */}
        <Circle
          cx={marker.x}
          cy={marker.y}
          r={STROKE / 2 + 3}
          fill={theme.bg}
          stroke={markerColor}
          strokeWidth={3}
        />
      </Svg>

      {/* Overlay central — número grande + kg + label caps abaixo.
          top: 48 garante que nenhum glifo encoste no stroke interno do arco
          (que termina em y≈40 no centro). */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 48,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: FONT.headExtra,
            fontSize: 40,
            color: theme.text,
            letterSpacing: -1,
            lineHeight: 44,
          }}
        >
          {value.toFixed(1).replace('.', ',')}
        </Text>
        <Text
          style={{
            fontFamily: FONT.bodyMedium,
            fontSize: 12,
            color: theme.textMuted,
            marginTop: -2,
          }}
        >
          kg
        </Text>
        <Text
          style={{
            fontFamily: FONT.bodyBold,
            fontSize: 10,
            letterSpacing: 1.2,
            color: theme.textMuted,
            textTransform: 'uppercase',
            marginTop: 6,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};
