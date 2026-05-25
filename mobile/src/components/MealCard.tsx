// Card de refeição compartilhado entre Dashboard e Diário.
// Suporta toggle expandir/recolher com chevron.

import React, { useState } from 'react';
import { View, Text, Pressable, Platform, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme, FONT } from '../theme';
import { Card } from './Card';
import { FoodImg } from './FoodImg';
import { IconBtn } from './IconBtn';
import { Icon } from './Icons';
import type { Meal } from '../data/mockData';

type Props = {
  meal: Meal;
  onAdd?: () => void;
  defaultExpanded?: boolean;
  /** Se true, mostra o chevron pra colapsar/expandir manualmente. */
  collapsible?: boolean;
};

export const MealCard: React.FC<Props> = ({
  meal,
  onAdd,
  defaultExpanded = false,
  collapsible = true,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultExpanded);
  const hasItems = meal.items.length > 0;

  const chevronShadow =
    !theme.dark
      ? Platform.select<ViewStyle>({
          ios: { shadowColor: '#1B1B1B', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 },
          android: { elevation: 1 },
          default: {},
        }) ?? {}
      : {};

  return (
    <Card pad={14} radius={20}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <FoodImg q={meal.q} src={meal.iconSrc} w={42} h={42} style={{ borderRadius: 14 }} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ fontFamily: FONT.head, fontSize: 15, fontWeight: '700', color: theme.text }}>
              {meal.name}
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
              {meal.time}
            </Text>
          </View>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
            {meal.items.length === 0
              ? 'Nada registrado ainda'
              : `${meal.items.length} ${meal.items.length === 1 ? 'item' : 'itens'} · ${meal.kcal} kcal`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {collapsible && hasItems && (
            <Pressable
              onPress={() => setOpen(!open)}
              accessibilityLabel={open ? 'Recolher' : 'Expandir'}
              style={[
                {
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: theme.bgElev,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                chevronShadow,
              ]}
            >
              <Svg
                width={14}
                height={14}
                viewBox="0 0 14 14"
                style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
              >
                <Path
                  d="M3 5l4 4 4-4"
                  stroke={theme.text}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          )}
          <IconBtn icon={Icon.plus} onPress={onAdd} />
        </View>
      </View>

      {open && hasItems && (
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border, gap: 10 }}>
          {meal.items.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <FoodImg q={item.q} w={36} h={36} style={{ borderRadius: 10 }} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: '600', color: theme.text }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>{item.portion}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }}>
                  {item.kcal} kcal
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted }}>
                  P {item.p} · C {item.c} · G {item.f}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};
