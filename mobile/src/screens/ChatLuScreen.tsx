// Chat IA Lu — conectado ao backend /chat (versão MVP simples).
// Envia macros do dia + refeições + perfil mock como contexto pra cada turno.
// Versão completa (Semana 2): tool calling, histórico persistido, stream.

import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Icon } from '../components/Icons';
import { MarkdownText } from '../components/MarkdownText';
import { chatWithLu, ApiError, type ChatMessage, type LuContext } from '../api/client';
import { useApp } from '../state/AppContext';
import { addReport } from '../storage/luReports';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'lu',
  text: 'Oi, Larissa! Sou a Lu, sua nutri IA 🍃 No que posso te ajudar hoje?',
};

export const ChatLuScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation();
  const { water, displayedMacros, displayedMeals } = useApp();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const lastLuMessage = [...messages].reverse().find((m) => m.role === 'lu');

  const clearConversation = () => {
    setMessages([INITIAL_MESSAGE]);
    setMenuOpen(false);
  };

  const openReport = () => {
    setMenuOpen(false);
    if (!lastLuMessage || lastLuMessage === INITIAL_MESSAGE) {
      // Sem resposta real ainda — nada pra reportar
      return;
    }
    setReportReason('');
    setReportFeedback(null);
    setReportOpen(true);
  };

  const submitReport = async () => {
    if (!lastLuMessage) return;
    try {
      await addReport({
        id: `${Date.now()}`,
        ts: Date.now(),
        messageText: lastLuMessage.text,
        reason: reportReason.trim() || undefined,
      });
      setReportFeedback('Obrigada pelo feedback! Vou aprender com isso. 🙏');
      setTimeout(() => setReportOpen(false), 1400);
    } catch {
      setReportFeedback('Não consegui salvar agora. Tenta de novo?');
    }
  };

  const buildContext = (): LuContext => ({
    profile: {
      name: 'Larissa',
      goal: 'Perder peso',
      weightKg: 85.2,
      goalWeightKg: 82.0,
    },
    macros: {
      kcal: displayedMacros.kcal,
      p: displayedMacros.p,
      c: displayedMacros.c,
      f: displayedMacros.f,
    },
    meals: displayedMeals.map((m) => ({
      name: m.name,
      items: m.items.map((it) => ({ name: it.name, portion: it.portion, kcal: it.kcal })),
    })),
    water,
  });

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = { role: 'user', text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const { reply } = await chatWithLu(nextMessages, buildContext());
      setMessages((m) => [...m, { role: 'lu', text: reply || '(sem resposta)' }]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não consegui responder agora. Tenta de novo?';
      setMessages((m) => [...m, { role: 'lu', text: `⚠️ ${msg}` }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        left={[<IconBtn key="b" icon={Icon.back} onPress={() => nav.goBack()} />]}
        right={[<IconBtn key="m" icon={Icon.more} onPress={() => setMenuOpen(true)} />]}
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

      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 140 }}>
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
              {m.role === 'user' ? (
                <Text style={{ fontFamily: FONT.body, fontSize: 14, color: theme.bg, lineHeight: 20 }}>
                  {m.text}
                </Text>
              ) : (
                <MarkdownText
                  style={{ fontFamily: FONT.body, fontSize: 14, color: theme.text, lineHeight: 20 }}
                >
                  {m.text}
                </MarkdownText>
              )}
            </View>
          </View>
        ))}
        {sending && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                backgroundColor: theme.bgElev,
                borderRadius: 18,
                borderBottomLeftRadius: 4,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ActivityIndicator size="small" color={theme.primaryDeep} />
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>Lu está pensando…</Text>
            </View>
          </View>
        )}
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

      {/* Menu ⋮ — bottom-sheet com ações do chat */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable onPress={() => setMenuOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: theme.bg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 16,
              paddingBottom: 28,
              gap: 6,
            }}
          >
            <View style={{ alignItems: 'center', paddingBottom: 6 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <Pressable
              onPress={clearConversation}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, backgroundColor: theme.bgElev }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.trash size={18} color={theme.text} stroke={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: theme.text }}>Limpar conversa</Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  Começa um novo papo do zero
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={openReport}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, backgroundColor: theme.bgElev, opacity: lastLuMessage && lastLuMessage !== INITIAL_MESSAGE ? 1 : 0.5 }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme.accentPink, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.flag size={18} color={theme.text} stroke={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: theme.text }}>Reportar última resposta</Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  Dá feedback se a Lu falou algo errado
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de feedback do report */}
      <Modal visible={reportOpen} transparent animationType="fade" onRequestClose={() => setReportOpen(false)}>
        <Pressable onPress={() => setReportOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 360, backgroundColor: theme.bg, borderRadius: 20, padding: 20, gap: 12 }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
              Reportar resposta
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, lineHeight: 17 }}>
              Conta o que ficou errado — pode ser uma frase. Ajuda a melhorar a Lu nas próximas versões.
            </Text>
            <View style={{ backgroundColor: theme.bgElev, borderRadius: 12, padding: 12, maxHeight: 100 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginBottom: 4 }}>Resposta reportada:</Text>
              <Text numberOfLines={3} style={{ fontFamily: FONT.body, fontSize: 12, color: theme.text }}>
                {lastLuMessage?.text || ''}
              </Text>
            </View>
            <TextInput
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="O que estava errado? (opcional)"
              placeholderTextColor={theme.textFaint}
              multiline
              style={{
                backgroundColor: theme.bgElev,
                borderRadius: 12,
                padding: 12,
                minHeight: 60,
                fontFamily: FONT.body,
                fontSize: 13,
                color: theme.text,
                textAlignVertical: 'top',
              }}
            />
            {reportFeedback && (
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.primaryDeep, textAlign: 'center' }}>
                {reportFeedback}
              </Text>
            )}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={() => setReportOpen(false)}
                style={{ flex: 1, padding: 14, alignItems: 'center', borderRadius: 14, backgroundColor: theme.bgElev }}
              >
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, color: theme.textMuted, fontWeight: '700' }}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={submitReport}
                disabled={!!reportFeedback}
                style={{ flex: 1, padding: 14, alignItems: 'center', borderRadius: 14, backgroundColor: theme.text }}
              >
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, color: theme.bg, fontWeight: '700' }}>Enviar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};
