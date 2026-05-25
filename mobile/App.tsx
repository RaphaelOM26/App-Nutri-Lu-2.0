// Entry component da app:
// - Carrega fontes Plus Jakarta Sans (heading) + Nunito Sans (body)
// - Envolve em SafeArea + GestureHandler + AppProvider + NavigationContainer
// - Renderiza o RootNavigator (tabs + modais)

import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import { AppProvider } from './src/state/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useTheme } from './src/theme';

function AppContent() {
  const theme = useTheme();
  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

function SplashFallback() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>{fontsLoaded ? <AppContent /> : <SplashFallback />}</AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
