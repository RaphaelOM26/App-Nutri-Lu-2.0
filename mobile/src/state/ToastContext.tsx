// Toast global do app — pequeno feedback positivo de ações.
// Estilo sutil (pill clara, ícone check), aparece no topo, fade in/out, não bloqueia toque.
// Uso: const toast = useToast(); toast('Refeição adicionada');

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { useTheme, FONT } from '../theme';
import { Icon } from '../components/Icons';

type ToastKind = 'success' | 'info' | 'error';

type ToastContextValue = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<ToastContextValue | null>(null);

type State = { id: number; message: string; kind: ToastKind } | null;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [toast, setToast] = useState<State>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const counter = useRef(0);

  const show = useCallback<ToastContextValue>((message, kind = 'success') => {
    counter.current += 1;
    setToast({ id: counter.current, message, kind });
  }, []);

  useEffect(() => {
    if (!toast) return;
    // Anima entrada
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    // Programa saída
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -8, duration: 220, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, 2200);
    return () => clearTimeout(timer);
  }, [toast?.id, opacity, translateY]);

  const iconColor =
    toast?.kind === 'error' ? theme.warning : toast?.kind === 'info' ? theme.insightAccent : theme.primaryDeep;
  const IconC = toast?.kind === 'error' ? Icon.close : toast?.kind === 'info' ? Icon.sparkle : Icon.check;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 60,
            left: 20,
            right: 20,
            opacity,
            transform: [{ translateY }],
            zIndex: 9999,
            elevation: 9999,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              maxWidth: '95%',
              backgroundColor: theme.bgElev,
              borderRadius: 100,
              paddingVertical: 8,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              shadowColor: '#1B1B1B',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
            }}
          >
            <IconC size={13} color={iconColor} stroke={2.5} />
            <Text
              numberOfLines={2}
              style={{ fontFamily: FONT.body, fontSize: 12, fontWeight: '600', color: theme.text }}
            >
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
