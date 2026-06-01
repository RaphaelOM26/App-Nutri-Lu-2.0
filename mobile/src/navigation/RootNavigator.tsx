// Root navigator: bottom tabs (5 abas) dentro de um native stack que contém
// também as telas fullscreen/modais (câmera, detalhe de receita, etc.).

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabBar } from '../components/TabBar';
import type { RootStackParamList, TabParamList } from './types';

// Telas (todas exportadas em src/screens/index.ts)
import {
  HomeScreen,
  DiaryScreen,
  RecipesScreen,
  ProgressScreen,
  ProfileScreen,
  AddFoodScreen,
  FoodDetailScreen,
  CameraScreen,
  CameraLoadingScreen,
  CameraResultScreen,
  VoiceScreen,
  BarcodeScreen,
  ImportRecipeScreen,
  RecipeDetailScreen,
  LuRecipesScreen,
  ChatLuScreen,
  PlannerScreen,
  ShoppingListScreen,
  JourneySummaryScreen,
  InviteFriendsScreen,
} from '../screens';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type RootNav = NativeStackNavigationProp<RootStackParamList>;

function Tabs() {
  // O FAB no TabBar navega pra Camera (que está no root stack acima das tabs).
  const navigation = useNavigation<RootNav>();
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} onFabPress={() => navigation.navigate('Camera', {})} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Diary" component={DiaryScreen} />
      <Tab.Screen name="Recipes" component={RecipesScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} />

      {/* Modais sem tab bar */}
      <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="CameraLoading" component={CameraLoadingScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="CameraResult" component={CameraResultScreen} />
      <Stack.Screen name="Voice" component={VoiceScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Barcode" component={BarcodeScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="ImportRecipe" component={ImportRecipeScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="LuRecipes" component={LuRecipesScreen} />
      <Stack.Screen name="ChatLu" component={ChatLuScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Planner" component={PlannerScreen} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
      <Stack.Screen name="JourneySummary" component={JourneySummaryScreen} />
      <Stack.Screen name="InviteFriends" component={InviteFriendsScreen} />
    </Stack.Navigator>
  );
}
