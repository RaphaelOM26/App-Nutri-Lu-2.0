// Chat IA Lu — UI mock (sem backend de chat no MVP).

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Icon } from '../components/Icons';

type Message = { role: 'lu' | 'user'; text: string };

export const ChatLuScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'lu', text: 'Oi! No MVP, eu ainda não converso de verdade — mas a interface já está pronta. 🍃' },
    { role: 'lu', text: 'Em breve eu vou poder responder sobre suas metas, sugerir receitas e adicionar refeições ao diário.' },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'lu', text: 'Recebido! No MVP estou em modo demo — backend de chat vem na v2.' }]);
    }, 600);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        left={[<IconBtn key="b" icon={Icon.back} onPress={() => nav.goBack()} />]}
        right={[<IconBtn key="m" icon={Icon.more} />]}
        title={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon.sparkle size={16} color={theme.primaryDeep} stroke={2} />
            </View>
            <View>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, fontWeight: '800', color: theme.text }}>Lu</Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.primaryDeep, fontWeight: '600' }}>● Sua nutri IA</Text>
            </View>
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 140 }}>
        {messages.map((m, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <View
              style={{
                maxWidth: '82%',
                paddingVertical: 12,
                paddingHorizontal: 14,
                backgroundColor: m.role === 'user' ? theme.text : theme.bgElev,
                borderRadius: m.role === 'user' ? 18 : 18,
                borderBottomRightRadius: m.role === 'user' ? 4 : 18,
                borderBottomLeftRadius: m.role === 'user' ? 18 : 4,
              }}
            >
              <Text style={{ fontFamily: FONT.body, fontSize: 14, color: m.role === 'user' ? theme.bg : theme.text, lineHeight: 20 }}>
                {m.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, paddingHorizontal: 16 }}>
        <View
          style={{
            backgroundColor: theme.bgElev,
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            placeholder="Pergunte a Lu…"
            placeholderTextColor={theme.textFaint}
            style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, color: theme.text, paddingVertical: 10 }}
          />
          <Pressable
            onPress={send}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.text, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon.send size={16} color={theme.bg} />
          </Pressable>
        </View>
        <Text style={{ marginTop: 6, fontFamily: FONT.body, fontSize: 10, color: theme.textFaint, textAlign: 'center' }}>
          Lu não substitui consulta com nutricionista
        </Text>
      </View>
    </SafeAreaView>
  );
};
