// Planejador semanal — porte simplificado.

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Card } from '../components/Card';
import { Btn } from '../components/Btn';
import { FoodImg } from '../components/FoodImg';
import { Icon } from '../components/Icons';
import { useApp } from '../state/AppContext';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const PlannerScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const { recipes } = useApp();
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const meals = ['Café', 'Almoço', 'Jantar'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Planejador"
        large
        sub="Semana de 25 mai · 31 mai"
        left={[<IconBtn key="b" icon={Icon.back} onPress={() => nav.goBack()} />]}
        right={[<IconBtn key="m" icon={Icon.more} />]}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Card pad={14} radius={18} style={{ backgroundColor: theme.text }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Icon.sparkle size={22} color={theme.bg} stroke={2} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, fontWeight: '800', color: theme.bg }}>Gerar plano com Lu</Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.bg, opacity: 0.7 }}>Baseado em metas + despensa</Text>
              </View>
              <Icon.forward size={18} color={theme.bg} />
            </View>
          </Card>
        </View>

        <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 60 }} />
              {days.map((d) => (
                <View key={d} style={{ width: 110, alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ fontFamily: FONT.head, fontSize: 12, fontWeight: '700', color: theme.text }}>{d}</Text>
                </View>
              ))}
            </View>
            {meals.map((meal, mi) => (
              <View key={meal} style={{ flexDirection: 'row', marginTop: 6 }}>
                <View style={{ width: 60, justifyContent: 'flex-start', paddingTop: 20 }}>
                  <Text
                    style={{
                      fontFamily: FONT.body,
                      fontSize: 11,
                      color: theme.textMuted,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 0.4,
                    }}
                  >
                    {meal}
                  </Text>
                </View>
                {days.map((_, di) => {
                  const filled = (mi + di) % 2 === 0;
                  const recipe = recipes[(mi + di) % recipes.length];
                  return (
                    <View
                      key={di}
                      style={{
                        width: 104,
                        marginHorizontal: 3,
                        backgroundColor: filled ? theme.bgElev : 'transparent',
                        borderWidth: filled ? 0 : 1.5,
                        borderColor: theme.border,
                        borderStyle: 'dashed',
                        borderRadius: 14,
                        padding: 8,
                        minHeight: 100,
                        gap: 6,
                      }}
                    >
                      {filled ? (
                        <>
                          <FoodImg q={recipe.q} w="100%" h={48} style={{ borderRadius: 8 }} />
                          <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: theme.text, lineHeight: 12 }} numberOfLines={2}>
                            {recipe.name}
                          </Text>
                          <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.textMuted }}>{recipe.kcal} kcal</Text>
                        </>
                      ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                          <Icon.plus size={20} color={theme.textFaint} />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingTop: 20, flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Btn variant="outline" icon={Icon.cart} onPress={() => nav.navigate('ShoppingList')} full>
              Lista de compras
            </Btn>
          </View>
          <View style={{ flex: 1 }}>
            <Btn variant="primary" icon={Icon.check} full>
              Aplicar ao diário
            </Btn>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
