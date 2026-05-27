// Tela de voz — captura de refeição via áudio (Whisper + GPT).
// Fluxo:
//   1) Toca botão → permissão de mic → grava
//   2) Toca de novo → para, faz upload, Whisper transcreve, Lu estrutura
//   3) Mostra items detectados → user escolhe refeição → adiciona ao diário

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Easing, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Btn } from '../components/Btn';
import { Card } from '../components/Card';
import { Icon } from '../components/Icons';
import { transcribeMealAudio, ApiError, type VoiceMealResponse } from '../api/client';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

type Stage = 'idle' | 'recording' | 'transcribing' | 'result' | 'error';

export const VoiceScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation();
  const toast = useToast();
  const { displayedMeals, addToMeal } = useApp();

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [stage, setStage] = useState<Stage>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<VoiceMealResponse | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  // Animação de "respiração" do botão de mic enquanto grava
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (stage === 'recording') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [stage, pulse]);

  // Permissão antecipada
  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync().catch(() => {
      // Tratada no início da gravação se falhar
    });
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setStage('error');
        setErrorMsg('Permissão de microfone negada. Habilite nas configurações do celular.');
        return;
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      elapsedTimerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 200);
      setStage('recording');
    } catch (err) {
      setStage('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao iniciar gravação');
    }
  };

  const stopAndTranscribe = async () => {
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setStage('transcribing');
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('Arquivo de áudio não encontrado');
      // Lê o arquivo gravado e converte pra base64 (RN não tem Blob bem suportado)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // expo-audio grava em .m4a por padrão (HIGH_QUALITY)
      const response = await transcribeMealAudio(base64, 'm4a');
      if (response.items.length === 0) {
        setStage('error');
        setErrorMsg('Não consegui identificar nenhum alimento na sua fala. Tente de novo descrevendo o que comeu.');
        return;
      }
      setResult(response);
      setStage('result');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erro ao transcrever';
      setStage('error');
      setErrorMsg(msg);
    }
  };

  const reset = () => {
    setStage('idle');
    setErrorMsg(null);
    setResult(null);
    setElapsedMs(0);
  };

  const addToDiary = (mealId: string) => {
    if (!result) return;
    const items = result.items.map((it) => ({
      name: it.name,
      portion: `${Math.round(it.portion_grams)}g`,
      amount: 1,
      kcal: Math.round(it.kcal),
      p: Math.round(it.protein_g),
      c: Math.round(it.carbs_g),
      f: Math.round(it.fat_g),
    }));
    const total = {
      kcal: Math.round(result.total.kcal),
      p: Math.round(result.total.protein_g),
      c: Math.round(result.total.carbs_g),
      f: Math.round(result.total.fat_g),
    };
    addToMeal(mealId, items, total);
    const mealName = displayedMeals.find((m) => m.id === mealId)?.name || 'refeição';
    toast(`Adicionado a ${mealName} · ${total.kcal} kcal`);
    nav.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Diga o que comeu"
        sub={stage === 'recording' ? 'Lu está ouvindo… toque pra parar.' : stage === 'idle' ? 'Toque no microfone e fale o que comeu.' : undefined}
        left={[<IconBtn key="close" icon={Icon.close} onPress={() => nav.goBack()} />]}
      />

      {stage !== 'result' && (
        <View style={{ flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          {/* Botão mic */}
          <Pressable
            onPress={stage === 'recording' ? stopAndTranscribe : startRecording}
            disabled={stage === 'transcribing'}
            accessibilityLabel={stage === 'recording' ? 'Parar gravação' : 'Iniciar gravação'}
          >
            <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
              {/* Anéis de fundo (só quando gravando) */}
              {stage === 'recording' && (
                <>
                  <View
                    style={{
                      position: 'absolute',
                      width: 180,
                      height: 180,
                      borderRadius: 90,
                      backgroundColor: theme.proteinPink,
                      opacity: 0.12,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      backgroundColor: theme.proteinPink,
                      opacity: 0.22,
                    }}
                  />
                </>
              )}
              {stage === 'idle' && (
                <>
                  <View
                    style={{
                      position: 'absolute',
                      width: 180,
                      height: 180,
                      borderRadius: 90,
                      backgroundColor: theme.primary,
                      opacity: 0.14,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      backgroundColor: theme.primarySoft,
                      opacity: 0.7,
                    }}
                  />
                </>
              )}
              <Animated.View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: stage === 'recording' ? theme.proteinPink : theme.text,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ scale: pulse }],
                }}
              >
                {stage === 'transcribing' ? (
                  <ActivityIndicator size="large" color={theme.bg} />
                ) : (
                  <Icon.mic size={42} color={theme.bg} stroke={2} />
                )}
              </Animated.View>
            </View>
          </Pressable>

          {/* Label/estado */}
          <View style={{ alignItems: 'center', gap: 6 }}>
            {stage === 'idle' && (
              <Text style={{ fontFamily: FONT.head, fontSize: 16, fontWeight: '700', color: theme.text }}>
                Toque pra começar
              </Text>
            )}
            {stage === 'recording' && (
              <>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: theme.proteinPink }}>
                  {formatElapsed(elapsedMs)}
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center', maxWidth: 280 }}>
                  Ex.: "No almoço comi arroz, feijão, frango grelhado e salada verde."
                </Text>
              </>
            )}
            {stage === 'transcribing' && (
              <Text style={{ fontFamily: FONT.head, fontSize: 15, fontWeight: '700', color: theme.text }}>
                Lu está transcrevendo…
              </Text>
            )}
            {stage === 'error' && (
              <>
                <Text style={{ fontFamily: FONT.head, fontSize: 15, fontWeight: '700', color: theme.proteinPink, textAlign: 'center' }}>
                  Algo deu errado
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', maxWidth: 300 }}>
                  {errorMsg}
                </Text>
                <View style={{ marginTop: 8 }}>
                  <Btn variant="outline" size="md" icon={Icon.mic} onPress={reset}>
                    Tentar de novo
                  </Btn>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {stage === 'result' && result && (
        <ResultView
          result={result}
          meals={displayedMeals.map((m) => ({ id: m.id, name: m.name, time: m.time, color: m.color, kcal: m.kcal, items: m.items.length }))}
          suggestedMealId={result.mealType}
          onPickMeal={addToDiary}
          onRetry={reset}
        />
      )}
    </SafeAreaView>
  );
};

function formatElapsed(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Resultado: lista de items + escolha de refeição ───────────────

const ResultView: React.FC<{
  result: VoiceMealResponse;
  meals: { id: string; name: string; time: string; color: string; kcal: number; items: number }[];
  suggestedMealId: string | null;
  onPickMeal: (mealId: string) => void;
  onRetry: () => void;
}> = ({ result, meals, suggestedMealId, onPickMeal, onRetry }) => {
  const theme = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
      {/* Transcrição */}
      <Card pad={14} radius={16} style={{ backgroundColor: theme.accentIce }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <Icon.sparkle size={16} color={theme.insightAccent} stroke={2} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.insightAccent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Você disse
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 14, color: theme.text, marginTop: 4, lineHeight: 20, fontStyle: 'italic' }}>
              "{result.transcript}"
            </Text>
          </View>
        </View>
      </Card>

      {/* Items detectados */}
      <View>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, paddingLeft: 4 }}>
          Itens detectados · {result.items.length}
        </Text>
        <Card pad={0} radius={16}>
          {result.items.map((it, i) => (
            <View
              key={`${it.name}-${i}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: i < result.items.length - 1 ? 1 : 0,
                borderBottomColor: theme.border,
                gap: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text }}>{it.name}</Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  {Math.round(it.portion_grams)}g · P {Math.round(it.protein_g)}g · C {Math.round(it.carbs_g)}g · G {Math.round(it.fat_g)}g
                </Text>
              </View>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, fontWeight: '800', color: theme.text }}>
                {Math.round(it.kcal)} kcal
              </Text>
            </View>
          ))}
        </Card>
        {/* Total */}
        <View style={{ marginTop: 8, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, fontWeight: '600' }}>
            Total da refeição
          </Text>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>
            {Math.round(result.total.kcal)} kcal
          </Text>
        </View>
        {result.confidence === 'low' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 4 }}>
            <Icon.sparkle size={12} color={theme.warningDeep} stroke={2} />
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.warningDeep, flex: 1 }}>
              Confiança baixa — confira os valores antes de adicionar.
            </Text>
          </View>
        )}
      </View>

      {/* Escolha de refeição */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, paddingLeft: 4 }}>
          Adicionar a qual refeição?
        </Text>
        <View style={{ gap: 8 }}>
          {meals.map((meal) => {
            const isSuggested = suggestedMealId && meal.id === suggestedMealId;
            return (
              <Pressable
                key={meal.id}
                onPress={() => onPickMeal(meal.id)}
                style={{
                  backgroundColor: theme.bgElev,
                  borderRadius: 16,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: isSuggested ? 1.5 : 0,
                  borderColor: isSuggested ? theme.primary : 'transparent',
                }}
              >
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: meal.color || theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.drumstick size={18} color={theme.text} stroke={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontFamily: FONT.bodyBold, fontSize: 15, fontWeight: '700', color: theme.text }}>{meal.name}</Text>
                    {isSuggested && (
                      <View style={{ backgroundColor: theme.primarySoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 }}>
                        <Text style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: '800', color: theme.primaryDeep, letterSpacing: 0.4 }}>SUGESTÃO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                    {meal.time} · {meal.items} {meal.items === 1 ? 'item' : 'itens'} · {meal.kcal} kcal
                  </Text>
                </View>
                <Icon.forward size={18} color={theme.textMuted} stroke={2} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ marginTop: 6 }}>
        <Btn variant="outline" size="md" icon={Icon.mic} onPress={onRetry} full>
          Gravar de novo
        </Btn>
      </View>
    </ScrollView>
  );
};
