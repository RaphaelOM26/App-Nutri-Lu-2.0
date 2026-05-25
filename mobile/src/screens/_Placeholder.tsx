// Tela placeholder reutilizável — usada como stub temporário pras telas
// ainda não totalmente implementadas. Mostra o nome da tela + botão "Voltar".

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONT } from '../theme';
import { Btn } from '../components/Btn';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Icon } from '../components/Icons';

type Props = {
  title: string;
  note?: string;
  showBack?: boolean;
  showTabBarSpace?: boolean;
};

export const PlaceholderScreen: React.FC<Props> = ({
  title,
  note = 'Tela em construção. UI completa do design vem na próxima onda.',
  showBack = false,
  showTabBarSpace = true,
}) => {
  const theme = useTheme();
  const nav = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title={title}
        large
        sub={note}
        left={
          showBack
            ? [<IconBtn key="b" icon={Icon.back} onPress={() => nav.goBack()} />]
            : undefined
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: showTabBarSpace ? 130 : 32 }}>
        <View
          style={{
            backgroundColor: theme.bgElev,
            borderRadius: 22,
            padding: 24,
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Icon.sparkle size={36} color={theme.primary} stroke={1.5} />
          <Text
            style={{
              fontFamily: FONT.head,
              fontSize: 18,
              fontWeight: '700',
              color: theme.text,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center' }}>
            {note}
          </Text>
        </View>

        {showBack && (
          <View style={{ marginTop: 24 }}>
            <Btn variant="outline" full onPress={() => nav.goBack()}>
              Voltar
            </Btn>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
