// Anamnese — as 8 perguntas não clínicas do questionário da nutricionista.
//
// Vêm DEPOIS do onboarding e ANTES da estimativa, a pedido dela: a paciente não
// deve ancorar num número antes de ser perguntada sobre si mesma.
//
// ⚠️ Estas respostas NÃO mudam a estimativa. A nutricionista chegou a pedir que
// mudassem e voltou atrás em 07/09: o Harris-Benedict usa sexo, idade, altura,
// peso e atividade, todos coletados no onboarding, e nenhuma pergunta daqui
// entra numa fórmula de caloria.
//
// O que elas mudam é o PLANO — é com elas que o rascunho respeita o que a
// pessoa não come, o que ela faz questão de manter e a rotina que ela tem.
// A exceção é `restricoes`, que vira FILTRO DURO no gerador.
//
// As três telas de abertura existem porque oito perguntas seguidas cansam. Elas
// separam a sequência em capítulos e dizem por que cada bloco está sendo
// perguntado — pergunta com motivo explicado tem resposta melhor.
//
// Os oito screens moram no mesmo arquivo, contra a convenção de um-por-arquivo
// do projeto, porque são uma sequência só: mudam juntos, se leem juntos e
// dividem o mesmo componente de abertura.

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../../theme';
import {
  OnboardingScreen,
  OnboardingTitle,
  OnboardingSubtitle,
} from '../../components/OnboardingScreen';
import { OptionCard } from '../../components/OptionCard';
import { LuAvatar } from '../../components/LuAvatar';
import { Icon } from '../../components/Icons';
import {
  loadAnamnese,
  salvarAnamnese,
  type Anamnese,
  type PeriodoFome,
  type FrequenciaDoces,
  type QualidadeSono,
  type RestricaoAlimentar,
} from '../../storage/anamnese';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

/** Cinco telas de pergunta. As de abertura não contam no progresso. */
const TOTAL_PERGUNTAS = 5;

// ─── Abertura de capítulo ──────────────────────────────────────────────────

const Capitulo: React.FC<{
  titulo: string;
  texto: string;
  cta: string;
  onNext: () => void;
  onBack: () => void;
}> = ({ titulo, texto, cta, onNext, onBack }) => {
  const theme = useTheme();
  return (
    <OnboardingScreen onBack={onBack} ctaLabel={cta} onCta={onNext}>
      <View style={{ paddingTop: 12 }}>
        <LuAvatar pose="default" size={56} />
        <Text
          style={{
            marginTop: 24,
            fontFamily: FONT.serif,
            fontSize: 28,
            lineHeight: 36,
            color: theme.text,
          }}
        >
          {titulo}
        </Text>
        <Text
          style={{
            marginTop: 16,
            fontFamily: FONT.head,
            fontSize: 16,
            lineHeight: 24,
            color: theme.textMuted,
          }}
        >
          {texto}
        </Text>
      </View>
    </OnboardingScreen>
  );
};

/** Campo de texto multilinha com rótulo. Usado nas perguntas abertas. */
const CampoTexto: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  linhas?: number;
}> = ({ label, placeholder, value, onChange, linhas = 3 }) => {
  const theme = useTheme();
  return (
    <View style={{ marginTop: 18 }}>
      <Text
        style={{
          fontFamily: FONT.head,
          fontSize: 13,
          color: theme.textMuted,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textFaint}
        multiline
        style={{
          minHeight: 22 * linhas,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.bgElev,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontFamily: FONT.body,
          fontSize: 15,
          lineHeight: 22,
          color: theme.text,
          textAlignVertical: 'top',
        }}
      />
    </View>
  );
};

/** Carrega o que já foi respondido, pra quem volta atrás não perder nada. */
function useAnamneseSalva(): Anamnese | null {
  const [dados, setDados] = useState<Anamnese | null>(null);
  useEffect(() => {
    loadAnamnese().then(setDados);
  }, []);
  return dados;
}

// ─── 1. Abertura — comida ──────────────────────────────────────────────────

export const AnamneseIntroComidaScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  return (
    <Capitulo
      titulo="Agora eu preciso te conhecer."
      texto="Plano bom não é o mais certinho — é o que você consegue seguir. Pra isso eu preciso saber o que você come de verdade, não o que seria ideal."
      cta="Vamos lá"
      onNext={() => nav.navigate('AnamnesePreferencias')}
      onBack={() => nav.goBack()}
    />
  );
};

// ─── 2. Preferências ───────────────────────────────────────────────────────

const RESTRICOES: Array<{ id: RestricaoAlimentar; label: string; sub: string }> = [
  { id: 'sem-gluten', label: 'Sem glúten', sub: 'Nada com trigo, centeio ou cevada' },
  { id: 'sem-lactose', label: 'Sem lactose', sub: 'Nada com leite e derivados' },
  { id: 'vegetariana', label: 'Vegetariana', sub: 'Sem carne, peixe ou frango' },
  { id: 'vegana', label: 'Vegana', sub: 'Nada de origem animal' },
];

export const AnamnesePreferenciasScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const salvo = useAnamneseSalva();
  const [naoGosta, setNaoGosta] = useState('');
  const [indispensavel, setIndispensavel] = useState('');
  const [restricoes, setRestricoes] = useState<RestricaoAlimentar[]>([]);

  useEffect(() => {
    if (!salvo) return;
    setNaoGosta(salvo.naoGosta ?? '');
    setIndispensavel(salvo.indispensavel ?? '');
    setRestricoes(salvo.restricoes ?? []);
  }, [salvo]);

  const alternar = (id: RestricaoAlimentar) =>
    setRestricoes((atual) => (atual.includes(id) ? atual.filter((r) => r !== id) : [...atual, id]));

  const continuar = async () => {
    await salvarAnamnese({
      naoGosta: naoGosta.trim(),
      indispensavel: indispensavel.trim(),
      restricoes,
    });
    nav.navigate('AnamneseIntroRotina');
  };

  return (
    <OnboardingScreen
      step={1}
      total={TOTAL_PERGUNTAS}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      onCta={continuar}
    >
      <OnboardingTitle>O que entra e o que não entra</OnboardingTitle>
      <OnboardingSubtitle>Pode ser direta. Ninguém precisa gostar de tudo.</OnboardingSubtitle>

      {/* As caixas vêm ANTES do texto livre de propósito: elas são o que vira
          filtro no plano. O texto livre logo abaixo captura o resto — aversões,
          alergias que não estão na lista, o jiló. */}
      <Text
        style={{
          marginTop: 18,
          marginBottom: 4,
          fontFamily: FONT.head,
          fontSize: 13,
          color: theme.textMuted,
        }}
      >
        Alguma dessas se aplica a você?
      </Text>
      {RESTRICOES.map((r) => (
        <OptionCard
          key={r.id}
          label={r.label}
          secondaryLabel={r.sub}
          selected={restricoes.includes(r.id)}
          showRadio
          onPress={() => alternar(r.id)}
        />
      ))}

      <CampoTexto
        label="E o que você não gosta ou não pode comer?"
        placeholder="Ex: peixe, jiló, castanhas"
        value={naoGosta}
        onChange={setNaoGosta}
      />
      <CampoTexto
        label="O que você faz questão de manter"
        placeholder="Ex: café com leite de manhã, pão francês"
        value={indispensavel}
        onChange={setIndispensavel}
      />
    </OnboardingScreen>
  );
};

// ─── 3. Abertura — rotina ──────────────────────────────────────────────────

export const AnamneseIntroRotinaScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  return (
    <Capitulo
      titulo="Como é o seu dia?"
      texto="Um plano que não cabe na sua rotina não é seguido por ninguém. Me conta como as coisas funcionam de verdade — inclusive o que você já come hoje."
      cta="Continuar"
      onNext={() => nav.navigate('AnamneseDiaNormal')}
      onBack={() => nav.goBack()}
    />
  );
};

// ─── 4. Um dia normal ──────────────────────────────────────────────────────

export const AnamneseDiaNormalScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const salvo = useAnamneseSalva();
  const [cafe, setCafe] = useState('');
  const [almoco, setAlmoco] = useState('');
  const [lanche, setLanche] = useState('');
  const [jantar, setJantar] = useState('');

  useEffect(() => {
    if (!salvo?.diaNormal) return;
    setCafe(salvo.diaNormal.cafe ?? '');
    setAlmoco(salvo.diaNormal.almoco ?? '');
    setLanche(salvo.diaNormal.lanche ?? '');
    setJantar(salvo.diaNormal.jantar ?? '');
  }, [salvo]);

  const continuar = async () => {
    await salvarAnamnese({
      diaNormal: {
        cafe: cafe.trim(),
        almoco: almoco.trim(),
        lanche: lanche.trim(),
        jantar: jantar.trim(),
      },
    });
    nav.navigate('AnamneseLimitacoes');
  };

  return (
    <OnboardingScreen
      step={2}
      total={TOTAL_PERGUNTAS}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      onCta={continuar}
    >
      <OnboardingTitle>Um dia comum seu</OnboardingTitle>
      <OnboardingSubtitle>Sem maquiar. É daqui que sai um plano parecido com a sua vida.</OnboardingSubtitle>

      <CampoTexto label="Café da manhã" placeholder="Ex: café com leite e pão com ovo" value={cafe} onChange={setCafe} linhas={2} />
      <CampoTexto label="Almoço" placeholder="Ex: arroz, feijão, frango e salada" value={almoco} onChange={setAlmoco} linhas={2} />
      <CampoTexto label="Lanche" placeholder="Ex: fruta, ou às vezes nada" value={lanche} onChange={setLanche} linhas={2} />
      <CampoTexto label="Jantar" placeholder="Ex: o que sobrou do almoço" value={jantar} onChange={setJantar} linhas={2} />
    </OnboardingScreen>
  );
};

// ─── 5. Limitações ─────────────────────────────────────────────────────────

export const AnamneseLimitacoesScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const salvo = useAnamneseSalva();
  const [limitacoes, setLimitacoes] = useState('');

  useEffect(() => {
    if (salvo) setLimitacoes(salvo.limitacoes ?? '');
  }, [salvo]);

  const continuar = async () => {
    await salvarAnamnese({ limitacoes: limitacoes.trim() });
    nav.navigate('AnamneseIntroCorpo');
  };

  return (
    <OnboardingScreen
      step={3}
      total={TOTAL_PERGUNTAS}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      onCta={continuar}
    >
      <OnboardingTitle>O que atrapalha</OnboardingTitle>
      <OnboardingSubtitle>Tempo, dinheiro, o que tem perto de casa. Isso muda o plano.</OnboardingSubtitle>

      <CampoTexto
        label="Alguma dificuldade de rotina, acesso ou custo?"
        placeholder="Ex: almoço fora todo dia, cozinho só no fim de semana"
        value={limitacoes}
        onChange={setLimitacoes}
        linhas={4}
      />
    </OnboardingScreen>
  );
};

// ─── 6. Abertura — corpo ───────────────────────────────────────────────────

export const AnamneseIntroCorpoScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  return (
    <Capitulo
      titulo="Últimas perguntas."
      texto="Fome, doce, água e sono. São esses detalhes que separam um plano que funciona de um que fica no papel."
      cta="Quase lá"
      onNext={() => nav.navigate('AnamneseFomeDoces')}
      onBack={() => nav.goBack()}
    />
  );
};

// ─── 7. Fome e doces ───────────────────────────────────────────────────────

const PERIODOS: Array<{ id: PeriodoFome; label: string }> = [
  { id: 'manha', label: 'De manhã' },
  { id: 'apos-almoco', label: 'Depois do almoço' },
  { id: 'tarde', label: 'À tarde' },
  { id: 'noite', label: 'À noite' },
];

const DOCES: Array<{ id: FrequenciaDoces; label: string }> = [
  { id: 'nao', label: 'Não sinto' },
  { id: 'as-vezes', label: 'Às vezes' },
  { id: 'frequentemente', label: 'Com frequência' },
  { id: 'todos-os-dias', label: 'Todos os dias' },
];

export const AnamneseFomeDocesScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const salvo = useAnamneseSalva();
  const [fome, setFome] = useState<PeriodoFome | null>(null);
  const [doces, setDoces] = useState<FrequenciaDoces | null>(null);
  const [quando, setQuando] = useState('');

  useEffect(() => {
    if (!salvo) return;
    setFome(salvo.maisFome ?? null);
    setDoces(salvo.doces ?? null);
    setQuando(salvo.docesQuando ?? '');
  }, [salvo]);

  const continuar = async () => {
    await salvarAnamnese({
      maisFome: fome ?? undefined,
      doces: doces ?? undefined,
      docesQuando: quando.trim(),
    });
    nav.navigate('AnamneseAguaSono');
  };

  return (
    <OnboardingScreen
      step={4}
      total={TOTAL_PERGUNTAS}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      ctaDisabled={!fome || !doces}
      onCta={continuar}
    >
      <OnboardingTitle>Quando bate a fome</OnboardingTitle>
      <OnboardingSubtitle>Serve pra decidir onde colocar as refeições maiores.</OnboardingSubtitle>

      {PERIODOS.map((p) => (
        <OptionCard
          key={p.id}
          label={p.label}
          selected={fome === p.id}
          onPress={() => setFome(p.id)}
        />
      ))}

      <Text
        style={{
          marginTop: 26,
          marginBottom: 10,
          fontFamily: FONT.head,
          fontSize: 17,
          color: theme.text,
        }}
      >
        E vontade de doce?
      </Text>
      {DOCES.map((d) => (
        <OptionCard
          key={d.id}
          label={d.label}
          selected={doces === d.id}
          onPress={() => setDoces(d.id)}
        />
      ))}

      {doces && doces !== 'nao' && (
        <CampoTexto
          label="Quando costuma acontecer?"
          placeholder="Ex: depois do jantar, quando estou cansada"
          value={quando}
          onChange={setQuando}
          linhas={2}
        />
      )}
    </OnboardingScreen>
  );
};

// ─── 8. Água e sono ────────────────────────────────────────────────────────

const SONO: Array<{ id: QualidadeSono; label: string; sub: string }> = [
  { id: 'bom', label: 'Bom', sub: 'Durmo bem na maioria das noites' },
  { id: 'regular', label: 'Regular', sub: 'Tem noite boa e noite ruim' },
  { id: 'ruim', label: 'Ruim', sub: 'Durmo mal quase sempre' },
];

export const AnamneseAguaSonoScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const salvo = useAnamneseSalva();
  const [agua, setAgua] = useState('');
  const [sono, setSono] = useState<QualidadeSono | null>(null);
  const [horas, setHoras] = useState('');

  useEffect(() => {
    if (!salvo) return;
    setAgua(salvo.aguaLitros != null ? String(salvo.aguaLitros).replace('.', ',') : '');
    setSono(salvo.sonoQualidade ?? null);
    setHoras(salvo.sonoHoras != null ? String(salvo.sonoHoras) : '');
  }, [salvo]);

  const numero = (v: string): number | undefined => {
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const continuar = async () => {
    await salvarAnamnese({
      aguaLitros: numero(agua),
      sonoQualidade: sono ?? undefined,
      sonoHoras: numero(horas),
      respondidaEm: Date.now(),
    });
    nav.navigate('Estimate');
  };

  return (
    <OnboardingScreen
      step={5}
      total={TOTAL_PERGUNTAS}
      onBack={() => nav.goBack()}
      ctaLabel="Terminar"
      ctaDisabled={!sono}
      onCta={continuar}
    >
      <OnboardingTitle>Água e sono</OnboardingTitle>
      <OnboardingSubtitle>Dois que mexem com a fome mais do que parece.</OnboardingSubtitle>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
        <CampoNumero
          label="Água por dia"
          sufixo="litros"
          placeholder="2"
          value={agua}
          onChange={setAgua}
          icon={<Icon.droplet size={18} color={theme.primaryDeep} stroke={2} />}
        />
        <CampoNumero
          label="Horas de sono"
          sufixo="por noite"
          placeholder="7"
          value={horas}
          onChange={setHoras}
          icon={<Icon.clock size={18} color={theme.primaryDeep} stroke={2} />}
        />
      </View>

      <Text
        style={{
          marginTop: 26,
          marginBottom: 10,
          fontFamily: FONT.head,
          fontSize: 17,
          color: theme.text,
        }}
      >
        Como anda seu sono?
      </Text>
      {SONO.map((s) => (
        <OptionCard
          key={s.id}
          label={s.label}
          secondaryLabel={s.sub}
          selected={sono === s.id}
          onPress={() => setSono(s.id)}
        />
      ))}
    </OnboardingScreen>
  );
};

const CampoNumero: React.FC<{
  label: string;
  sufixo: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
}> = ({ label, sufixo, placeholder, value, onChange, icon }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.bgElev,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text style={{ fontFamily: FONT.head, fontSize: 13, color: theme.textMuted }}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textFaint}
        keyboardType="decimal-pad"
        style={{
          marginTop: 6,
          fontFamily: FONT.headExtra,
          fontSize: 26,
          color: theme.text,
          padding: 0,
        }}
      />
      <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textFaint }}>{sufixo}</Text>
    </View>
  );
};
