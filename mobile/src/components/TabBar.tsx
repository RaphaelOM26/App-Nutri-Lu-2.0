// Tab bar inferior customizada (5 tabs + FAB de câmera).
// Compatível com react-navigation's bottom-tabs — passe esse componente
// como `tabBar={(props) => <TabBar {...props} />}` no Tab.Navigator.

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View, Platform, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme, FONT } from '../theme';
import { Icon, type IconName } from './Icons';

// Mapa de rota → label/icone (igual ao protótipo)
const TAB_CONFIG: { name: string; label: string; icon: IconName }[] = [
  { name: 'Home', label: 'Início', icon: 'home' },
  { name: 'Diary', label: 'Diário', icon: 'diary' },
  { name: 'Recipes', label: 'Receitas', icon: 'recipe' },
  { name: 'Progress', label: 'Progresso', icon: 'chart' },
  { name: 'Profile', label: 'Eu', icon: 'user' },
];

type Props = BottomTabBarProps & {
  onFabPress: () => void;
};

export const TabBar: React.FC<Props> = ({ state, navigation, onFabPress }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;

  const containerShadow =
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: theme.dark ? '#000' : '#1B1B1B',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: theme.dark ? 0.5 : 0.1,
        shadowRadius: 40,
      },
      android: { elevation: 8 },
      default: {},
    }) ?? {};

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom > 0 ? insets.bottom : 24,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Pill com 5 tabs */}
      <View
        style={[
          {
            flex: 1,
            maxWidth: 360,
            backgroundColor: theme.bgElev,
            borderRadius: 28,
            paddingHorizontal: 8,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderWidth: theme.dark ? 1 : 0,
            borderColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'transparent',
          },
          containerShadow,
        ]}
      >
        {TAB_CONFIG.map((tab) => {
          const isActive = activeName === tab.name;
          const IconC = Icon[tab.icon];
          return (
            <Pressable
              key={tab.name}
              onPress={() => navigation.navigate(tab.name as never)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 6,
                gap: 2,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? theme.primarySoft : 'transparent',
                }}
              >
                <IconC size={20} color={isActive ? theme.primaryDeep : theme.textMuted} stroke={isActive ? 2 : 1.75} />
              </View>
              <Text
                style={{
                  fontFamily: FONT.body,
                  fontSize: 10,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? theme.text : theme.textMuted,
                  letterSpacing: 0.2,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* FAB camera */}
      <Fab onPress={onFabPress} />
    </View>
  );
};

const Fab: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.4)).current;
  const ringScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulsação suave do botão (1.0 → 1.06 → 1.0)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
    // Anel pulsante atrás do botão (cresce e some)
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, { toValue: 1.8, duration: 2400, useNativeDriver: true }),
          Animated.timing(ringScale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0, duration: 2400, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.4, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [scale, ringOpacity, ringScale]);

  const shadow =
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#1B1B1B',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.32,
        shadowRadius: 30,
      },
      android: { elevation: 12 },
      default: {},
    }) ?? {};

  return (
    <View style={{ marginLeft: 12, width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}>
      {/* Anel pulsante atrás */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: theme.primary,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          style={[
            {
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.text,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow,
          ]}
        >
          <Icon.camera size={26} color={theme.bg} stroke={2} />
        </Pressable>
      </Animated.View>
    </View>
  );
};
