// Primitivos de motion do app — Animated core do RN, zero deps nativas novas
// (tudo OTA-safe). Filosofia: molas suaves, durações curtas, useNativeDriver
// sempre que a propriedade permite (transform/opacity).
//
// - SheetModal: bottom sheet com subida em mola + backdrop com fade gradual.
//   Substitui o padrão antigo <Modal animationType="fade"> + 2 Pressables.
// - PressableScale: Pressable que encolhe ~3% no toque com mola na volta.
// - FadeInUp: entrada fade + slide sutil; com `delay` cria cascata em listas.
// - AnimatedNumber: número que rola até o valor novo em vez de teleportar.

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

// ─── SheetModal ──────────────────────────────────────────────────
type SheetModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Estilo do container do sheet (bg, radius, padding — igual ao Pressable interno antigo). */
  sheetStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export const SheetModal: React.FC<SheetModalProps> = ({ visible, onClose, sheetStyle, children }) => {
  // `mounted` mantém o Modal vivo durante a animação de saída.
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(progress, {
        toValue: 1,
        useNativeDriver: true,
        damping: 24,
        stiffness: 260,
        mass: 0.7,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, progress]);

  if (!mounted) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [42, 0] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', opacity: progress }]}
      />
      <Pressable onPress={onClose} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={{ opacity: progress, transform: [{ translateY }] }}>
          {/* Pressable vazio impede que toque no conteúdo feche o sheet */}
          <Pressable onPress={() => {}} style={sheetStyle}>
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ─── PressableScale ──────────────────────────────────────────────
type PressableScaleProps = Omit<PressableProps, 'style'> & {
  /** Escala no toque. Default 0.97 (sutil). */
  scaleTo?: number;
  /** Estilo visual/layout — aplicado no Animated.View interno. */
  style?: StyleProp<ViewStyle>;
  /** Estilo do Pressable externo (layout: flex, width...). Raramente necessário. */
  containerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export const PressableScale: React.FC<PressableScaleProps> = ({
  scaleTo = 0.97,
  style,
  containerStyle,
  children,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      {...rest}
      style={containerStyle}
      onPressIn={(e) => {
        Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, damping: 28, stiffness: 420, mass: 0.6 }).start();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 280, mass: 0.7 }).start();
        onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
};

// ─── FadeInUp ────────────────────────────────────────────────────
type FadeInUpProps = {
  /** Atraso em ms — listas usam index*45 pra cascata. */
  delay?: number;
  /** Deslocamento inicial em px (default 14). */
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export const FadeInUp: React.FC<FadeInUpProps> = ({ delay = 0, distance = 14, style, children }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      damping: 22,
      stiffness: 200,
      mass: 0.8,
      delay,
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

// ─── AnimatedNumber ──────────────────────────────────────────────
type AnimatedNumberProps = {
  value: number;
  style?: StyleProp<TextStyle>;
  /** Duração da rolagem (default 450ms). */
  duration?: number;
};

/**
 * Texto numérico que ANIMA até o valor novo (rolagem) em vez de trocar seco.
 * Usa listener + setState (driver JS) — ok pra UM número por tela; não usar
 * em listas grandes.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, style, duration = 450 }) => {
  const anim = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      // Primeiro render mostra o valor direto — animar do zero no boot fica teatral.
      first.current = false;
      setDisplay(value);
      anim.setValue(value);
      return;
    }
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // valor numérico → precisa do driver JS
    }).start(() => anim.removeListener(id));
    return () => anim.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <Text style={style}>{display}</Text>;
};
