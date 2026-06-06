# Onboarding Spec — Nutri Lu v0.1

**Data:** 2026-06-05
**Referência principal:** Cal AI (22 telas analisadas a partir de prints do app)
**Escopo:** beta fechado em 5–7 dias úteis
**Status:** proposta pra aprovação do Raphael antes da implementação

---

## 0. TL;DR

- **17 telas** no fluxo Nutri Lu (vs 22 do Cal AI). Cortes justificados na seção 7.
- **ID visual nossa**: verde-sage primário, DM Serif Display nos momentos editoriais, Plus Jakarta no resto da UI, Lu como personagem em 1ª pessoa.
- **Cor de destaque "número personalizado do user"**: `warning #E59A5B` (já existe na palette, equivale ao coral do Cal AI).
- **Skip de auth no beta** (combinado): onboarding termina direto na app sem pedir login.
- **Sem promessas falsas**: dropei screens motivacionais que afirmam "80% dos users mantêm…" sem dados reais. Substituídas por estudos citáveis ou cortadas.
- **Microanimações leves**: tudo Animated nativo do React Native, sem Lottie/MP4 (zero asset externo). Lottie/vídeo real ficam pra v0.2.

---

## 1. Sequência das 16 telas (overview)

> **Atualização 2026-06-05:** Tela 11 (Sua projeção) foi removida após validação do protótipo
> Claude Design — a mensagem emocional já é entregue na Tela 16 (Plano pronto) com a pill
> da meta calculada. Total caiu de 17 → 16 telas.

| # | Tela | Fase | Tipo | Campo AppContext |
|---|---|---|---|---|
| 1 | Boas-vindas | Hero | Brand | — |
| 2 | Nome + foto | Dados | Form | `name`, `profilePhotoUri` |
| 3 | Gênero | Dados | Single-select | `gender` |
| 4 | Data nascimento | Dados | Wheel picker | `birthDate` |
| 5 | Altura e peso atual | Dados | Wheel picker | `heightCm`, `addWeightEntry` |
| 6 | Frequência de treino | Dados | Single-select | `activityLevel` |
| 7 | **Lu explica** (FEEDBACK único) | Atmosfera | Princípio citado | — |
| 8 | Objetivo | Objetivos | Single-select | `goal` |
| 9 | Peso desejado | Objetivos | Ruler scrollable | `weightGoalKg` |
| 10 | Velocidade de progresso | Objetivos | Slider c/ animais | `weeklyRate` |
| 11 | Barreiras (multi-select) | Empatia | Multi-select | `barriers[]` |
| 12 | Motivações (multi-select) | Empatia | Multi-select | `motivations[]` |
| 13 | Permissão de notificação | Permissões | Native prompt c/ priming | — |
| 14 | **Hora de gerar seu plano** | Cerimônia | Transição emocional | — |
| 15 | Gerando seu plano | Cerimônia | Animação 0→100% | `macroTargets` (output) |
| 16 | **Plano pronto** | Payoff | 4 cards macros | — |

Após a tela 16 → flag `@nutri-lu/onboarded=true` + navega pra `Tabs > Home` (sem auth).

---

## 2. Mapping Cal AI (22) → Nutri Lu (17)

### KEEP (com adaptações de copy/visual): 14 telas

| Cal AI | Nutri Lu | Adaptações |
|---|---|---|
| Choose your Gender | Tela 3 — Gênero | "Outro" → "Outro / Prefiro não dizer". Justificativa social mais empática |
| How many workouts | Tela 6 — Frequência treino | Mantém estrutura. Labels em pt-BR e ícones nossos |
| When were you born | Tela 4 — Data nascimento | Wheel picker pt-BR (Janeiro/Fevereiro/…). Sem toggle imperial |
| Height & Weight | Tela 5 — Altura e peso | **Remove toggle Imperial/Metric** (BR sempre métrico) |
| What is your goal | Tela 8 — Objetivo | Lose/Maintain/Gain → Perder/Manter/Ganhar |
| Desired weight | Tela 9 — Peso desejado | Régua scrollable kg, sem lbs |
| How fast (slider animais) | Tela 10 — Velocidade | Mantém slider + animais animados. **Animais BR**: preguiça → lebre → onça-pintada |
| Cal AI long-term results | Tela 7 — Lu explica | Substitui claim falso por **estudo real citável** (vide §5.7) |
| Cal AI 2x weight comparison | — | **DROP** (marketing falso, sem evidência nossa) |
| You have great potential | Tela 11 — Sua projeção | Mantém chart, mas usa **cálculo real** do peso atual + meta + ritmo |
| What's stopping you | Tela 12 — Barreiras | **Multi-select** (Cal AI é single, mas multi é mais real) |
| What would you like to accomplish | Tela 13 — Motivações | **Multi-select** mesmo motivo |
| Notification permission + priming | Tela 14 — Permissão | Priming HONESTO (mostrar benefícios, não imitar dialog iOS) |
| Thank you for trusting us | — | **Consolidada** com tela 15 |
| Time to generate | Tela 15 — Hora de gerar | Inclui agradecimento da Lu |
| Generating (animado) | Tela 16 — Gerando | Mantém animação. Subtítulos rotativos em pt-BR |
| Plan ready! | Tela 17 — Plano pronto | Mantém 4 cards. Cores das anéis seguem nossa palette de macros |
| Create an account | — | **DROP** (combinado, sem auth no beta) |

### NEW (Nutri Lu não tinha equivalente): 2 telas

| Tela | Por quê |
|---|---|
| Tela 1 — Boas-vindas | Cal AI já tem (Calorie tracking made easy) mas nosso visual/copy específico |
| Tela 2 — Nome + foto | Cal AI só pede no fim (auth). Pedimos cedo pra Lu poder personalizar ("Bem-vinda, Larissa") |

### CONSOLIDADAS

- **"Thank you for trusting us"** + **"Time to generate your custom plan"** → 1 tela só (15) com a Lu agradecendo E avisando que vai gerar

---

## 3. ID visual adaptada

### 3.1 Paleta

| Função | Cal AI | Nutri Lu |
|---|---|---|
| CTA primário | Preto puro `#000` | **Sage `#97AF8F`** (primary) |
| Background | Branco puro | `#F6F6F6` (bg) → `#FFFFFF` (cards/bgElev) |
| Texto principal | Preto | `#1B1B1B` |
| Texto secundário (subtítulos) | Cinza médio | `rgba(27,27,27,0.58)` (textMuted) |
| Card option (não selecionado) | Cinza claríssimo `#F5F5F7` | `bgSubtle #EEF0EC` |
| Card option (selecionado) | Bg preto, texto branco | **Bg sage `#97AF8F`, texto branco** |
| Acento "número personalizado" | Coral/laranja `#E59C5B` | **Warning `#E59A5B`** (já temos!) |
| Anéis macros (Tela 17) | preto/laranja/rosa/azul | sage/`carbsBlue`/`proteinPink`/`fatsGold` (palette atual) |
| Gradiente cerimônia (Telas 15, 16) | rosa→azul pastel | **`accentPink #EACBD1` → `accentBlue #C0CFE6`** (já existem) |

### 3.2 Tipografia

| Uso | Cal AI | Nutri Lu |
|---|---|---|
| Title de pergunta | Sans bold gigante | **Plus Jakarta 700 32px** (head) |
| Subtitle explicativo | Sans regular cinza | **Nunito Sans 400 16px** (body) cinza |
| **Feedback screens** (Telas 7, 11) | Sans bold | **DM Serif Display** — momentos editoriais/motivacionais |
| **Tela 17 "Pronto! Seu plano…"** | Sans bold | **DM Serif Display** + Plus Jakarta no card |
| Botão | Sans 600 | Plus Jakarta 700 |
| Números grandes (peso, kg) | Sans bold | Plus Jakarta 800 (headExtra) |

**Regra:** DM Serif Display só nos momentos brand/emocionais (boas-vindas, feedbacks, payoff). Tudo "funcional" (perguntas, forms, cards) usa Plus Jakarta.

### 3.3 Lu como personagem

Cal AI não tem mascote. Nutri Lu tem a Lu. Onde ela aparece no onboarding:

| Tela | Como a Lu aparece |
|---|---|
| 1 — Boas-vindas | Apenas no logo (sutil) |
| 7 — Lu explica | **Lu fala em 1ª pessoa**: "Pessoas que acompanham o que comem têm 2x mais chance de bater suas metas. Comigo do seu lado, vai ser mais fácil." Avatar pequeno da Lu ao lado |
| 11 — Sua projeção | "Olha o que dá pra alcançar, Larissa." Avatar |
| 15 — Hora de gerar | "Valeu pela confiança! Vou montar seu plano agora 💚" Avatar grande, gesto de "vamos lá" |
| 17 — Plano pronto | "Aqui tá, Larissa. Pode editar a qualquer hora!" Avatar pequeno |

Avatar da Lu: usar o mesmo SVG/ilustração já usada em `JourneySummaryScreen` (quote editorial). Se ainda não tem, podemos gerar via texto de avatar genérico verde-sage com inicial "L" como fallback.

### 3.4 Ilustrações

Cal AI usa ilustrações hand-drawn b&w dentro de círculo gradiente pastel (Telas "Thank you" + "Time to generate"). Nutri Lu vai usar:

- **Tela 15 (Hora de gerar)** — círculo com gradiente `accentPink → accentBlue`, ilustração simples no centro. **Opções**:
  - **(a) Mão fazendo coração** (cópia conceito Cal AI) — fácil de achar grátis
  - **(b) Logo da Lu animado** com micro-pulsação (mais brand, mas precisa do asset)
  - **(c) Coração sage pulsando** com pequenas partículas (zero asset, 100% Animated)

  **Recomendação: (c)** pra v0.1, (b) pra v0.2 quando tivermos o asset.

- **Tela 17 (Plano pronto)** — checkmark grande verde-sage circular (zero ilustração), ou ilustração de "selo" estampando. Recomendação: checkmark sage circular, mais sóbrio e nossa cara.

### 3.5 Componentes que vão precisar ser construídos

Lista do que NÃO existe no app hoje e precisa ser criado:

| Componente | Onde usa | Complexidade |
|---|---|---|
| `OnboardingHeader` (back + progress bar) | TODAS | Baixa |
| `OnboardingScreen` wrapper (padding + footer fixo Continue) | TODAS | Baixa |
| `OptionCard` (card pill com ícone + texto, estado selected sage) | 3, 6, 8, 12, 13 | Baixa |
| `WheelPicker` (date/height/weight) | 4, 5 | **Média-Alta** (custom UX iOS-style) |
| `RulerSlider` (régua scrollable horizontal) | 9 | Média |
| `AnimalSpeedSlider` (slider com 3 ilustrações reativas) | 10 | Alta |
| `LineProjectionChart` (curva 3/7/30d) | 11 | Média |
| `GeneratingProgress` (% + barra gradiente + checklist) | 16 | Média |
| `MacroRingCard` (anel + número + lápis edit) | 17 | Baixa (já temos componentes parecidos) |
| `WelcomeMockupLoop` (crossfade 2 PNGs) | 1 | Baixa |

---

## 4. Inventário de campos do AppContext

### 4.1 Já existem (não precisa criar)

| Campo | Setter | Storage |
|---|---|---|
| `weightGoalKg` | `setWeightGoal(kg)` | `userProfile.ts` |
| `MacroTargets {kcal, p, c, f}` | `setMacroTargets({...})` | `userProfile.ts` |
| `profilePhotoUri` | `setProfilePhoto(uri)` | `userProfile.ts` |
| `weightEntries[]` | `addWeightEntry(kg, date?)` | `weightEntries.ts` |
| `mealReminders` | `setMealReminders(cfg)` | `userProfile.ts` |
| `silenceAllNotifications` | `setSilenceAllNotifications(b)` | `userProfile.ts` |

### 4.2 Precisa criar

| Campo | Tipo | Setter novo | Storage |
|---|---|---|---|
| `name` | `string \| null` | `setName(name)` | adicionar em `userProfile.ts` (`NAME_KEY`) |
| `gender` | `'female' \| 'male' \| 'other' \| null` | `setGender(g)` | adicionar em `userProfile.ts` |
| `birthDate` | `number \| null` (timestamp) | `setBirthDate(ts)` | adicionar em `userProfile.ts` |
| `heightCm` | `number \| null` | `setHeight(cm)` | adicionar em `userProfile.ts` |
| `activityLevel` | `'sedentary' \| 'moderate' \| 'athlete' \| null` | `setActivityLevel(level)` | adicionar em `userProfile.ts` |
| `goal` | `'lose' \| 'maintain' \| 'gain' \| null` | `setGoal(g)` | adicionar em `userProfile.ts` |
| `weeklyRateKg` | `number \| null` (0.1 a 1.5) | `setWeeklyRate(kg)` | adicionar em `userProfile.ts` |
| `barriers[]` | `string[]` | `setBarriers(ids)` | adicionar em `userProfile.ts` |
| `motivations[]` | `string[]` | `setMotivations(ids)` | adicionar em `userProfile.ts` |
| `onboardedAt` | `number \| null` (timestamp) | `setOnboardedAt(ts)` | adicionar em `userProfile.ts` |

### 4.3 Hardcoded a substituir

O nome "Larissa Souza" aparece hardcoded em:
- `HomeScreen.tsx` — header
- `ProfileScreen.tsx` — avatar
- `JourneySummaryScreen.tsx` — quote

Substituir todas por `state.name ?? 'você'` ou similar (com fallback gracioso).

### 4.4 Cálculo de macros (output da Tela 16)

Quando o onboarding termina, os macros são calculados via:

```
BMR (Mifflin-St Jeor):
  Female: 10*W + 6.25*H - 5*A - 161
  Male:   10*W + 6.25*H - 5*A + 5
  Other:  média dos dois

TDEE = BMR * fator atividade:
  0-2 treinos/sem  → 1.375 (sedentário)
  3-5 treinos/sem  → 1.55  (moderado)
  6+ treinos/sem   → 1.725 (atleta)

Calorias alvo:
  Lose:     TDEE - (weeklyRateKg * 7700 / 7)  // 7700 kcal por kg
  Maintain: TDEE
  Gain:     TDEE + (weeklyRateKg * 7700 / 7)

Macros padrão (30/40/30):
  Proteína: 30% das kcal / 4
  Carbs:    40% das kcal / 4
  Gordura:  30% das kcal / 9
```

Esse cálculo vira `utils/macroCalc.ts` (novo).

---

## 5. Tela por tela — DETALHADO

### Tela 1 — Boas-vindas

**Função:** brand + hook + product promise em 1 só tela. O mockup conta a história
literal do "Foto → Macros": câmera scaneando o prato → tela de resultado com os macros
DAQUELE prato (não o home do dia).

**Visual:**
```
┌───────────────────────────────┐
│                               │
│  ┌─────────────────┐          │
│  │ [mockup celular │          │
│  │  loop:          │          │
│  │ A] câmera+prato │          │
│  │ B] resultado    │          │
│  │    foto + macros│          │
│  └─────────────────┘          │
│                               │
│  Foto. Macros. Pronto.        │  ← DM Serif Display 36px
│  Acompanhe seus macros sem    │  ← Plus Jakarta 16px, cinza
│            esforço            │
│                               │
│  ╭───────────────────────╮    │
│  │     Começar           │    │  ← Sage pill width-full
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Frame A do mockup (câmera scaneando):**
- Tela de câmera estilo iOS com retículo de enquadramento
- Foto/render de um prato (frango grelhado, salada bowl, etc.) dentro do retículo
- Pill no rodapé "Scan Food" ou ícone de câmera

**Frame B do mockup (resultado do scan):**
- Foto do prato no topo (mesma do Frame A, pra dar sensação de continuidade)
- Título do alimento detectado (ex: `Frango grelhado com arroz integral`)
- 3 badges/chips abaixo do título (ex: `Almoço · Alto em proteína · Sem glúten`)
- Card abaixo com 4 stats inline:
  - **Kcal**: 480 (com mini-ring sage)
  - **P**: 38g (cor proteinPink)
  - **C**: 45g (cor carbsBlue)
  - **G**: 12g (cor fatsGold)
- Microcopy: "Tempo 25min" e "Porções 2" opcionais

**Copy da tela:**
- Título: `Foto. Macros. Pronto.`
- Subtítulo: `Acompanhe seus macros sem esforço`
- CTA: `Começar`

**Microanimação:**
- Texto: title e subtítulo fade in + slide up (250ms, easing out) ao montar
- Mockup interno: crossfade entre Frame A → Frame B a cada 2.5s, loop infinito
- No instante do crossfade A→B, dá pra adicionar um "scan line" descendo no Frame A
  (efeito de "processando") logo antes da transição — dá vibe de "AI analisando"
- CTA: fade in com delay 600ms

**AppContext:** —

**Componentes:**
- `WelcomeMockupLoop` (novo)
- `Button primary pill` (já existe em estilo, mas usar sage)

---

### Tela 2 — Nome + foto

**Função:** personalização inicial (Lu vai usar o nome dali pra frente)
**Visual:**
```
┌───────────────────────────────┐
│ ←   ─────                     │  ← back + progress 1/15
│                               │
│  Como devo te chamar?         │  ← Plus Jakarta 700 28px
│  Vou usar pra deixar tudo     │  ← cinza
│  mais pessoal.                │
│                               │
│          (●)                  │  ← Avatar grande clicável
│       [camera badge]          │  ← com badge "+"
│                               │
│  ┌─────────────────────────┐  │
│  │ Seu nome                │  │  ← TextInput
│  └─────────────────────────┘  │
│                               │
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │  ← Sage, desabilitado se vazio
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Como devo te chamar?`
- Subtítulo: `Vou usar pra deixar tudo mais pessoal.`
- Placeholder input: `Seu nome`
- CTA: `Continuar`

**Microanimação:**
- Título fade in + slide up 200ms
- Avatar bounce in 400ms (scale 0.8 → 1.0 spring)
- Input fade in delay 200ms
- CTA: desabilitado (sage suave 40% opacity) até `name.trim().length >= 2`. Fica sólido com transição cor 200ms.

**AppContext:**
- `setName(input.trim())`
- `setProfilePhoto(uri)` (opcional)

**Componentes:**
- `Avatar` (já existe) com prop `onPress` + camera badge
- ActionSheet "Tirar foto / Galeria / Remover" — já existe pattern em ProfileScreen

---

### Tela 3 — Gênero

**Função:** input pro cálculo de BMR
**Visual:**
```
┌───────────────────────────────┐
│ ←   ──────                    │  ← progress 2/15
│                               │
│  Qual seu gênero?             │
│  Vamos usar pra calibrar       │
│  seu plano personalizado.      │
│                               │
│  ┌─────────────────────────┐  │
│  │     Feminino            │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │     Masculino           │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │  Outro / Prefiro não    │  │
│  │       dizer             │  │
│  └─────────────────────────┘  │
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │  ← desabilitado até escolher
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Qual seu gênero?`
- Subtítulo: `Vamos usar pra calibrar seu plano personalizado.`
- Opções: `Feminino` / `Masculino` / `Outro / Prefiro não dizer`

**Microanimação:**
- Title/subtitle: stagger fade-in (100ms entre eles)
- Cards: stagger fade-in (80ms entre cada, slide up 8px)
- Seleção: card vira sage bg + texto branco (transição 200ms)

**AppContext:** `setGender('female' | 'male' | 'other')`

**Componentes:** `OptionCard` (novo)

---

### Tela 4 — Data de nascimento

**Função:** input pra idade no BMR
**Visual:** wheel picker triplo iOS-style (Mês | Dia | Ano)
```
┌───────────────────────────────┐
│ ←   ────────                  │
│                               │
│  Quando você nasceu?          │
│  Sua idade entra no cálculo    │
│  das suas metas diárias.       │
│                               │
│              1998             │  ← fade 30%
│              1999             │  ← fade 60%
│              2000             │  ← fade 80%
│  Janeiro    01    [2001]      │  ← selected (bg sage soft)
│  Fevereiro  02    2002        │  ← fade 80%
│  Março      03    2003        │  ← fade 60%
│  Abril      04    2004        │  ← fade 30%
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Quando você nasceu?`
- Subtítulo: `Sua idade entra no cálculo das suas metas diárias.`
- Meses em pt-BR: Janeiro/Fevereiro/Março/…
- CTA: `Continuar`

**Microanimação:**
- Wheels: snap suave (spring), fade dos números fora do centro (0.3, 0.6, 0.8, 1.0 baseado em distância do centro)
- Haptic ao mudar valor (se possível com `expo-haptics`)
- Default: 1 Jan 2000

**AppContext:** `setBirthDate(timestamp)`

**Componentes:** `WheelPicker` (novo, 3 instâncias side-by-side)

---

### Tela 5 — Altura e peso atual

**Função:** input H + W pro BMR
**Visual:** 2 wheels lado a lado, **SEM toggle imperial** (BR é sempre métrico)
```
┌───────────────────────────────┐
│ ←   ──────────                │
│                               │
│  Sua altura e peso atual      │
│  Vamos usar pra calcular       │
│  suas metas diárias.           │
│                               │
│   Altura          Peso        │  ← labels
│                               │
│   165 cm          51 kg       │  ← fade
│   166 cm          52 kg       │  ← fade
│   167 cm          53 kg       │  ← fade
│  [168 cm]        [54 kg]      │  ← selected
│   169 cm          55 kg       │  ← fade
│   170 cm          56 kg       │  ← fade
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Sua altura e peso atual`
- Subtítulo: `Vamos usar pra calcular suas metas diárias.`
- Labels: `Altura` | `Peso`
- CTA: `Continuar`

**Microanimação:** mesma do Tela 4

**AppContext:**
- `setHeight(cm)`
- `addWeightEntry(kg, Date.now())` — cria a primeira `WeightEntry` (vai virar ponto inicial do gráfico de peso)

**Componentes:** `WheelPicker` x2

**Default:** 165 cm / 65 kg

---

### Tela 6 — Frequência de treino

**Função:** input do fator de atividade pro TDEE
**Visual:** 3 OptionCards verticais com ícones (pontos crescentes) + 2 linhas de texto
```
┌───────────────────────────────┐
│ ←   ────────────              │
│                               │
│  Quantos treinos por semana?  │
│  Vamos usar pra calibrar       │
│  seu plano.                    │
│                               │
│  ┌──┬──────────────────────┐  │
│  │● │ 0 - 2                │  │
│  │  │ De vez em quando     │  │
│  └──┴──────────────────────┘  │
│                               │
│  ┌──┬──────────────────────┐  │
│  │∴ │ 3 - 5                │  │
│  │  │ Algumas vezes/semana │  │
│  └──┴──────────────────────┘  │
│                               │
│  ┌──┬──────────────────────┐  │
│  │∷∵│ 6+                   │  │
│  │  │ Atleta dedicado      │  │
│  └──┴──────────────────────┘  │
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Quantos treinos por semana?`
- Subtítulo: `Vamos usar pra calibrar seu plano.`
- Opções:
  - **0 – 2** · `De vez em quando`
  - **3 – 5** · `Algumas vezes por semana`
  - **6+** · `Atleta dedicado`
- CTA: `Continuar`

**Microanimação:** Cards fade-in stagger + select transition

**AppContext:** `setActivityLevel('sedentary' | 'moderate' | 'athlete')`

**Componentes:** `OptionCard` com prop `icon` + `secondaryText`

---

### Tela 7 — Lu explica (FEEDBACK #1)

**Função:** quebra emocional pós-cluster de perguntas frias. Princípio nutricional citável.

**Visual:**
```
┌───────────────────────────────┐
│ ←   ─────────────             │
│                               │
│                               │
│  ┌─────┐                      │
│  │ Lu  │  Pessoas que          │  ← Avatar Lu pequeno
│  │     │  acompanham           │
│  └─────┘  o que comem têm      │  ← DM Serif Display 28px
│                               │
│  2x mais chance de bater       │  ← número em sage destaque
│  suas metas.                   │
│                               │
│  Junto comigo, vai ser muito   │  ← Plus Jakarta 16px
│  mais fácil.                   │
│                               │
│                               │
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- (Avatar Lu) `Pessoas que acompanham o que comem têm`
- (destaque sage) `2x mais chance` `de bater suas metas.`
- (Lu) `Junto comigo, vai ser muito mais fácil.`
- CTA: `Continuar`

**Justificativa do número "2x"**: estudo Kaiser Permanente / J. Hollis et al. (2008) — usuários que registram alimentação diária perdem ~2x mais peso que não-registradores. Fonte real, **podemos citar isso sem mentir**.

**Microanimação:**
- Texto entra parte por parte com fade-in stagger (200ms entre blocos)
- "2x mais chance" pulsa levemente (scale 1.0 → 1.05 → 1.0) ao aparecer
- Avatar da Lu fade-in com slight bounce

**AppContext:** —

---

### Tela 8 — Objetivo

**Função:** lose/maintain/gain — define se o cálculo aplica déficit ou superávit
**Visual:** 3 OptionCards simples
```
┌───────────────────────────────┐
│ ←   ──────────────            │
│                               │
│  Qual seu objetivo?           │
│  Vou usar pra gerar um plano   │
│  calórico personalizado.       │
│                               │
│  ┌─────────────────────────┐  │
│  │     Perder peso         │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │     Manter peso         │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │     Ganhar peso         │  │
│  └─────────────────────────┘  │
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Qual seu objetivo?`
- Subtítulo: `Vou usar pra gerar um plano calórico personalizado.`
- Opções: `Perder peso` / `Manter peso` / `Ganhar peso`
- CTA: `Continuar`

**AppContext:** `setGoal('lose' | 'maintain' | 'gain')`

**Comportamento condicional:**
- Se goal = 'maintain' → **PULA telas 9, 10** (peso desejado + velocidade) e vai direto pra 11. Vai usar peso atual como meta.

---

### Tela 9 — Peso desejado

**Função:** input `weightGoalKg`
**Visual:** régua horizontal scrollable (não wheel), seguindo padrão Cal AI
```
┌───────────────────────────────┐
│ ←   ────────────────          │
│                               │
│  Qual seu peso desejado?      │
│                               │
│                               │
│          Perder peso          │  ← contexto dinâmico
│                               │
│             54.0 kg           │  ← Plus Jakarta 800 36px
│                               │
│  │││││││||│||│||│|||│││││││  │  ← régua ticks
│              ▲                │  ← indicador central
│                               │
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Qual seu peso desejado?`
- Contexto dinâmico acima do número:
  - se goal=lose: `Perder peso`
  - se goal=gain: `Ganhar peso`
- CTA: `Continuar`

**Microanimação:**
- Régua: ticks animados ao deslizar, haptic em cada tick principal
- Número: animação spring ao mudar
- Validação: se goal=lose e weightGoalKg >= peso atual, mostra texto cinza "Pra perder peso, escolha um valor menor que seu peso atual ({W} kg)" e desabilita Continuar

**AppContext:** `setWeightGoal(kg)`

**Componentes:** `RulerSlider` (novo)

**Default:** se goal=lose, peso atual − 5kg. Se gain, peso atual + 3kg.

---

### Tela 10 — Velocidade de progresso

**Função:** ritmo semanal (define o déficit calórico)
**Visual:** slider com 3 ilustrações animadas (preguiça/lebre/onça) + pill de feedback contextual
```
┌───────────────────────────────┐
│ ←   ──────────────────        │
│                               │
│  Em qual ritmo?               │
│                               │
│                               │
│      Perda de peso por        │
│           semana              │
│                               │
│           0.8 kg              │  ← Plus Jakarta 800 28px
│                               │
│   🦥          🐰         🐆   │  ← animais (centro ativo)
│   ●━━━━━━━━━━●━━━━━━━━━━●     │  ← slider
│  0.1 kg     0.8 kg    1.5 kg  │  ← labels
│                               │
│  ╭───────────────────────╮    │
│  │     Recomendado       │    │  ← pill cinza
│  ╰───────────────────────╯    │
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Em qual ritmo?`
- Label do número: `Perda de peso por semana` (ou `Ganho de peso por semana` se goal=gain)
- Pill de feedback (muda com posição):
  - Slow zone (0.1 a 0.3 kg/sem): `Devagar e firme`
  - Recomendado zone (0.4 a 1.0 kg/sem): `Recomendado`
  - Fast zone (1.1 a 1.5 kg/sem): `Cuidado: pode causar fadiga e perda de massa magra. A Lu não recomenda.`
- CTA: `Continuar`

**Animais (sugestão BR):**
- Slow: 🦥 **Preguiça** (lenta e estável)
- Mid: 🐰 **Lebre** (ágil, equilibrado) — ou capivara como opção mais brasileira
- Fast: 🐆 **Onça-pintada** (rápida e arriscada)

**Microanimação chave:**
- O animal correspondente à zona do slider fica **colorido em sage** (ou warning na fast zone) e **animado em loop** (preguiça balança, lebre/coelho pula, onça corre — animação simples Animated.loop)
- Os outros 2 animais ficam **silhueta cinza estática**
- Número grande do peso: spring update ao deslizar
- Pill: cross-fade 250ms ao mudar de zona
- Cor de fundo da pill: cinza claro (Slow/Mid) ou `warning` claro com texto warningDeep (Fast)

**AppContext:** `setWeeklyRate(kg)`

**Componentes:** `AnimalSpeedSlider` (novo, alta complexidade)

**Default:** 0.8 kg (zona Recomendado)

---

### ~~Tela 11 — Sua projeção (FEEDBACK #2)~~ — REMOVIDA (2026-06-05)

> **Decisão:** dropada após validação do protótipo Claude Design. O número projetado
> (`weeklyRate × 30/7`) é uma extrapolação especulativa que pode soar falsa pro user,
> e a mensagem emocional "você consegue" já é entregue na **Tela 16 (Plano pronto)**
> com a pill da meta calculada (`Pode perder X kg até Y data`).
>
> Componente `LineProjectionChart` **não precisa ser construído**.
> Helper `daysToReachGoal` em [macroCalc.ts](mobile/src/utils/macroCalc.ts) continua
> útil pra Tela 16 (calcula a data da meta na pill).

---

### Tela 11 — Barreiras (multi-select)

**Função:** entender o que trava o user (vai informar Lu IA depois). Multi-select.
**Visual:** lista de cards selecionáveis com ícones, igual Cal AI mas multi
```
┌───────────────────────────────┐
│ ←   ─────────────────────     │
│                               │
│  O que tá te impedindo?       │
│  Pode marcar quantos          │
│  fizerem sentido.             │
│                               │
│  ┌──┬──────────────────┬───┐  │
│  │📊│ Falta de constância│ ○ │  │
│  └──┴──────────────────┴───┘  │
│                               │
│  ┌──┬──────────────────┬───┐  │
│  │🍔│ Alimentação ruim │ ● │  │  ← selecionado
│  └──┴──────────────────┴───┘  │
│                               │
│  ┌──┬──────────────────┬───┐  │
│  │🤝│ Falta de apoio   │ ○ │  │
│  └──┴──────────────────┴───┘  │
│                               │
│  ┌──┬──────────────────┬───┐  │
│  │📅│ Agenda corrida   │ ● │  │  ← selecionado
│  └──┴──────────────────┴───┘  │
│                               │
│  ┌──┬──────────────────┬───┐  │
│  │🥗│ Falta de ideias  │ ○ │  │
│  │  │ de refeição      │   │  │
│  └──┴──────────────────┴───┘  │
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │  ← habilitado se >=1
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `O que tá te impedindo?`
- Subtítulo: `Pode marcar quantos fizerem sentido.`
- Opções (id : label):
  - `consistency` : `Falta de constância`
  - `unhealthy_food` : `Alimentação ruim`
  - `no_support` : `Falta de apoio`
  - `busy` : `Agenda corrida`
  - `no_inspiration` : `Falta de ideias de refeição`
- CTA: `Continuar` (habilitado se >=1)

**Microanimação:** stagger fade-in + transition de selected state (radio circle → check sage)

**AppContext:** `setBarriers(string[])`

---

### Tela 12 — Motivações (multi-select)

**Função:** entender o que motiva (informa Lu IA). Multi-select.
**Visual:** igual tela 12
```
┌───────────────────────────────┐
│ ←   ────────────────────────  │
│                               │
│  O que você quer alcançar?    │
│  Pode marcar quantos          │
│  fizerem sentido.             │
│                               │
│  ┌──┬──────────────────┬───┐  │
│  │🍎│ Comer e viver    │ ● │  │
│  │  │ melhor           │   │  │
│  └──┴──────────────────┴───┘  │
│                               │
│  ┌──┬──────────────────┬───┐  │
│  │☀️ │ Mais energia e   │ ○ │  │
│  │  │ disposição       │   │  │
│  └──┴──────────────────┴───┘  │
│                               │
│  ┌──┬──────────────────┬───┐  │
│  │💪│ Manter motivação │ ● │  │
│  │  │ e constância     │   │  │
│  └──┴──────────────────┴───┘  │
│                               │
│  ┌──┬──────────────────┬───┐  │
│  │🧘│ Me sentir bem    │ ○ │  │
│  │  │ com meu corpo    │   │  │
│  └──┴──────────────────┴───┘  │
│                               │
│  ╭───────────────────────╮    │
│  │     Continuar         │    │
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `O que você quer alcançar?`
- Opções:
  - `eat_better` : `Comer e viver melhor`
  - `energy` : `Mais energia e disposição`
  - `motivation` : `Manter motivação e constância`
  - `body` : `Me sentir bem com meu corpo`
- CTA: `Continuar`

**AppContext:** `setMotivations(string[])`

---

### Tela 13 — Permissão de notificação

**Função:** pedir permissão de notificação local com priming honesto

**Visual:**
```
┌───────────────────────────────┐
│ ←   ──────────────────────────│
│                               │
│  Posso te lembrar?            │
│  Lembretes leves nos          │
│  horários certos.             │
│                               │
│                               │
│  ┌────────────────────────┐   │  ← preview card de notificação
│  │ ⏰ Hora do almoço!     │   │
│  │ Lembrete de refeição   │   │
│  │ 12:30                  │   │
│  └────────────────────────┘   │
│                               │
│  ┌────────────────────────┐   │
│  │ 💧 Hidratação          │   │
│  │ Falta beber 800 ml hoje│   │
│  │ 18:00                  │   │
│  └────────────────────────┘   │
│                               │
│  ┌────────────────────────┐   │
│  │ ✨ Insight da Lu       │   │
│  │ Vi seus macros — tem   │   │
│  │ uma dica pra você      │   │
│  │ 21:00                  │   │
│  └────────────────────────┘   │
│                               │
│  ╭───────────────────────╮    │
│  │     Permitir          │    │  ← dispara prompt nativo
│  ╰───────────────────────╯    │
│                               │
│         Agora não             │  ← link discreto cinza
└───────────────────────────────┘
```

**Copy:**
- Título: `Posso te lembrar?`
- Subtítulo: `Lembretes leves nos horários certos.`
- Cards preview (mockup de notificação visual):
  1. ⏰ `Hora do almoço!` · `Lembrete de refeição` · `12:30`
  2. 💧 `Hidratação` · `Falta beber 800 ml hoje` · `18:00`
  3. ✨ `Insight da Lu` · `Vi seus macros — tem uma dica pra você` · `21:00`
- CTA primário: `Permitir`
- Link discreto: `Agora não`

**Microanimação:**
- 3 cards stagger fade-in
- Pulse sutil no primeiro card (chamada de atenção)

**AppContext:** —
**Side effect:**
- Botão "Permitir" → `Notifications.requestPermissionsAsync()` (API expo-notifications v56). Se concedido, pode pré-configurar reminders padrão de meals.
- "Agora não" → next sem fazer nada

**Comportamento:**
- Não imita o iOS dialog (Cal AI faz, é ligeiramente enganoso). O nosso priming é mostrar **conteúdo real** que o user vai receber.

---

### Tela 14 — Hora de gerar seu plano

**Função:** cerimônia + agradecimento + transição emocional pré-geração
**Visual:**
```
┌───────────────────────────────┐
│ ←   ───────────────────────── │
│                               │
│                               │
│       ╱─────────────╲         │
│      ╱  gradiente    ╲        │  ← círculo com gradiente
│     ╱  pink → blue    ╲       │     accentPink → accentBlue
│    │                    │     │
│    │      💚            │     │  ← coração sage pulsando
│    │                    │     │     com partículas
│     ╲                  ╱      │
│      ╲                ╱       │
│       ╲──────────────╱        │
│                               │
│                               │
│  Tudo pronto, {nome}.         │  ← DM Serif Display 28px
│                               │
│  Valeu pela confiança 💚      │  ← Plus Jakarta 16px
│  Vou montar seu plano agora.  │
│                               │
│                               │
│  ╭───────────────────────╮    │
│  │     Vamos lá!         │    │  ← Sage CTA
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Tudo pronto, {nome}.`
- Subtítulo: `Valeu pela confiança 💚 Vou montar seu plano agora.`
- CTA: `Vamos lá!`

**Microanimação:**
- Círculo gradiente: rotação lenta contínua (12s/volta)
- Coração sage no centro: scale pulse infinito (1.0 ↔ 1.08, 1.2s)
- Partículas: 4-6 pontinhos sage flutuando ao redor com opacity oscilando
- Texto: fade in + slide up stagger

**AppContext:** —

**Componentes:** `CeremonialCircle` (novo, mas só Animated, zero asset)

---

### Tela 15 — Gerando seu plano

**Função:** coreografia visual durante cálculo do BMR/TDEE/macros (pode ser instantâneo, mas a animação dá peso emocional)
**Visual:**
```
┌───────────────────────────────┐
│                               │
│                               │
│         42%                   │  ← Plus Jakarta 800 64px
│                               │
│   Tô preparando tudo pra você │  ← DM Serif Display 22px
│                               │
│   ━━━━━━━━━━━●━━━━━━━━━━━━    │  ← barra gradiente
│   pink ────────── blue        │
│                               │
│   Calculando seu metabolismo… │  ← subtítulo rotativo
│                               │
│                               │
│   ┌─────────────────────────┐ │
│   │ Recomendação diária     │ │
│   │                         │ │
│   │ • Calorias            ✓ │ │
│   │ • Carboidratos        ✓ │ │
│   │ • Proteína              │ │  ← preenche sequencial
│   │ • Gordura               │ │
│   │ • Hidratação            │ │
│   └─────────────────────────┘ │
│                               │
└───────────────────────────────┘
```

**Copy:**
- Título estático: `Tô preparando tudo pra você`
- Subtítulos rotativos (cada 1.5s):
  - `Calculando seu metabolismo basal…`
  - `Definindo suas metas de macros…`
  - `Selecionando receitas pro seu perfil…`
  - `Configurando seus lembretes…`
  - `Quase lá…`
- Card label: `Recomendação diária pra você`
- Itens do card:
  - `Calorias`
  - `Carboidratos`
  - `Proteína`
  - `Gordura`
  - `Hidratação`

**Microanimação:**
- Sem CTA — auto-avança ao chegar em 100%
- Duração total: **4 segundos** (não real — performance show, mas calculo é instantâneo)
- Número 0 → 100% com easing
- Barra gradiente preenchendo
- Checkmarks aparecem nos 20% / 40% / 60% / 80% / 95%
- Subtítulo: cross-fade 800ms a cada troca

**AppContext:**
- No START: dispara cálculo `computeMacros(profile)` em `utils/macroCalc.ts`
- No END: chama `setMacroTargets({kcal, p, c, f})` e `setOnboardedAt(Date.now())`
- Auto-navega pra Tela 17

**Componentes:** `GeneratingProgress` (novo)

---

### Tela 16 — Plano pronto (PAYOFF)

**Função:** entrega final + reveal do plano calculado
**Visual:**
```
┌───────────────────────────────┐
│                               │
│             ✓                 │  ← checkmark sage circular grande
│                               │
│  Pronto, {nome}! Seu plano    │  ← DM Serif Display 26px
│      tá feito                 │
│                               │
│   ╭─────────────────────────╮ │
│   │ Pode perder 5,0 kg até   │ │  ← pill cinza claro
│   │      28 de junho         │ │
│   ╰─────────────────────────╯ │
│                               │
│  ┌────────────────────────┐   │  ← card cinza claro
│  │ Recomendação diária    │   │
│  │ Você pode editar a      │   │
│  │ qualquer momento        │   │
│  │                         │   │
│  │  ┌───────┐  ┌───────┐   │   │
│  │  │🔥1850 │  │🌾180g │   │   │
│  │  │Kcal ✏ │  │Carb ✏ │   │   │
│  │  └───────┘  └───────┘   │   │  ← anéis nas cores
│  │                         │   │
│  │  ┌───────┐  ┌───────┐   │   │
│  │  │🍗140g │  │💧2L   │   │   │
│  │  │Prot ✏ │  │Hidrat │   │   │
│  │  └───────┘  └───────┘   │   │
│  └────────────────────────┘   │
│                               │
│  ╭───────────────────────╮    │
│  │   Bora começar!       │    │  ← Sage CTA
│  ╰───────────────────────╯    │
└───────────────────────────────┘
```

**Copy:**
- Título: `Pronto, {nome}! Seu plano tá feito`
- Pill da meta:
  - se goal=lose: `Pode perder {X} kg até {data}`
  - se goal=gain: `Pode ganhar {X} kg até {data}`
  - se goal=maintain: `Sua meta diária pra manter o peso`
- Card title: `Recomendação diária`
- Card subtitle: `Você pode editar a qualquer momento`
- 4 mini-cards:
  - 🔥 `{kcal}` `Kcal` (anel sage)
  - 🌾 `{c}g` `Carboidratos` (anel carbsBlue)
  - 🍗 `{p}g` `Proteína` (anel proteinPink)
  - 💧 `2 L` `Hidratação` (anel waterIce, valor fixo no MVP)
- CTA: `Bora começar!`

**Microanimação:**
- Checkmark sage: spring bounce in (scale 0 → 1.1 → 1.0) 600ms
- Título: fade in delay 200ms
- Pill da meta: slide up + fade delay 400ms
- Mini-cards: stagger fade-in (100ms entre eles) delay 600ms
- **Anéis circulares dos mini-cards**: stroke animation de 0% → 100% em 800ms cada, easing
- Números dentro dos anéis: count-up animation (0 → valor final) durante a animação do stroke
- CTA: pulse sutil 1× ao montar pra chamar atenção

**AppContext:**
- Toque no lápis ✏ de cada card → abre nosso `EditMetricsModal` existente
- Toque no CTA → seta `setOnboardedAt(Date.now())` + navega `navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })`

---

## 6. Microanimações — padrões globais

### 6.1 Header de progresso

- Back button: fade-in/out conforme history. Bounce sutil ao tocar.
- Progress bar: anima de tela anterior pra próxima quando navega (slide + width fill, 350ms)
- **Largura**: cada tela adiciona `1/17 ≈ 5.9%` à barra
- **Cor da barra**: gradient sutil sage (primary → primaryDeep) pra dar profundidade

### 6.2 Entrada de tela

Padrão pra TODAS as telas (exceto cerimônia que tem entrada própria):

1. Background fade-in (0 → 1, 200ms)
2. Header (back + progress) já no lugar
3. Título: fade + translateY 12 → 0, 280ms ease-out
4. Subtítulo: fade + translateY 12 → 0, 280ms ease-out delay 80ms
5. Conteúdo principal (cards/sliders/wheels): stagger por elemento (60-100ms entre cada), delay 200ms
6. CTA: fade-in delay 400ms (chega por último, sinaliza "leia tudo antes de prosseguir")

### 6.3 Saída de tela

- Slide horizontal pra próxima tela (entra da direita)
- Tela atual: fade out + slide left
- Duração 300ms easing
- React Navigation cuida disso nativamente — só precisa configurar `animation: 'slide_from_right'`

### 6.4 Cards selecionáveis (OptionCard)

- Não selecionado: bg `bgSubtle` (#EEF0EC), texto `text`, sem border
- Hover/press: scale 0.97 (haptic light)
- Selecionado: bg sage (#97AF8F), texto branco, scale 1.02, com leve sombra sage
- Transição: 200ms easing

### 6.5 Wheels

- Snap suave (spring leve)
- Fade dos itens fora do centro: 0.32, 0.58, 0.85, 1.0 (centro)
- Item central: bg `primarySoft` (#D6E0CF) pill arredondada
- Haptic medium em cada snap

### 6.6 Slider de animais (Tela 10)

- O animal da zona ativa: scale 1.15, cor sage (mid) / warning (fast)
- Animação loop do animal:
  - Preguiça: oscilação suave de tronco (rotateZ -3° ↔ +3°, 2s)
  - Lebre: jump curto (translateY 0 → -8 → 0, 600ms) — repete a cada 1.5s
  - Onça: corrida (translateX -4 → +4, 200ms) — loop contínuo
- Animais inativos: opacity 0.4, sem animação, cor cinza

### 6.7 Charts (Telas 11, 16)

- Stroke animation left → right (curva ou barra)
- Easing: cubic-bezier(0.65, 0, 0.35, 1) pra suavidade
- Números chave (delta projetado): typewriter ou count-up
- Pontos do chart: aparecem em sequência conforme a curva passa por eles (bounce in)

---

## 7. Escopo v0.1 vs v0.2

### v0.1 (beta — 5–7 dias)

**Incluído (17 telas):** tudo descrito acima.

**Justificativa de cortes vs Cal AI:**
- ❌ "Lose twice as much weight" (claim sem evidência) → removido
- ❌ "Thank you for trusting us" → consolidado com Tela 15
- ❌ "Create an account" → removido (sem auth no beta)
- ✂️ Toggle Imperial/Metric na Tela 5 → removido (BR sempre métrico)
- ✂️ Skip nas perguntas pesadas (sem condicionais com Tela 10 quando goal='maintain') → mantido

### v0.2 (pós-beta — 1-2 semanas após validar)

Adicionar:
- ➕ **Vídeo real** (MP4 do app funcionando) na Tela 1 substituindo crossfade de PNGs
- ➕ **Tela "Como a Nutri Lu te ajuda"** entre 11 e 12 — 4 pilares (foto AI, macros, receitas, hábitos) com mini-animações de cada
- ➕ **Tela "Thank you" separada** antes da Tela 15 (mais cerimônia, como Cal AI faz)
- ➕ **Lottie animations** nos momentos chave (avatar Lu, animais Tela 10, checkmark Tela 17) — substitui Animated nativo
- ➕ **Voice over opcional** da Lu (TTS) lendo títulos das telas
- ➕ **Skip individual** em telas não-essenciais (motivações, barreiras) com flag "responder depois"
- ➕ **Telemetria por tela** (PostHog) — onde users dropam, quanto tempo levam, qual opção mais escolhida
- ➕ **Versão Auth** (Google Sign-in pra sync entre devices) — fim do funnel

---

## 8. Próximos passos / implementação

### 8.1 Ordem proposta de desenvolvimento

| Fase | Entrega | Tempo estimado |
|---|---|---|
| **A** | Infra: navegação, OnboardingHeader, wrapper, AppContext fields novos, storage userProfile expandido | 3-4h |
| **B** | Telas 1-3 (boas-vindas, nome, gênero) — simples, valida o pattern | 3-4h |
| **C** | Telas 4-5 (data nasc, altura+peso) — requer `WheelPicker` custom | 4-6h |
| **D** | Tela 6 (treinos) — simples, reusa OptionCard | 1h |
| **E** | Tela 7 (Lu explica) — DM Serif Display + Avatar | 2h |
| **F** | Telas 8-10 (objetivo, peso desejado, velocidade) — RulerSlider + AnimalSpeedSlider | 6-8h |
| **G** | Tela 11 (projeção) — LineProjectionChart custom | 3-4h |
| **H** | Telas 12-13 (barreiras, motivações) — OptionCard multi-select | 2-3h |
| **I** | Tela 14 (permissão) — preview cards + native prompt | 2-3h |
| **J** | Telas 15-17 (cerimônia, gerando, payoff) — animações + cálculo | 5-7h |
| **K** | Cálculo de macros (`macroCalc.ts`) + integração com setMacroTargets | 1-2h |
| **L** | Substituição de "Larissa Souza" hardcoded por nome dinâmico em 3 telas | 1h |
| **M** | Flag `@nutri-lu/onboarded` + condicional no App.tsx | 1h |
| **N** | Testes no Android + iOS via Expo Go (esperar EAS Build pra real) | 2-3h |

**Total estimado:** ~36-50 horas (4-6 dias úteis cheios)

### 8.2 Dependências

- ✅ Já temos: `expo-image-picker`, `expo-notifications`, AppContext infra, fonts (DM Serif + Plus Jakarta), theme sage
- ⚠️ Verificar v56: **API de `expo-notifications`** mudou — checar `Notifications.SchedulableTriggerInputTypes` e `requestPermissionsAsync` antes de codar Tela 14 + Tela 16
- ⚠️ Verificar v56: **`expo-image-picker`** pra avatar Tela 2 — checar nova API `MediaTypeOptions`
- 🆕 Pode precisar: `react-native-reanimated` v3 (mais performance pra wheels/animais). Conferir se já tá instalado — caso negativo, peso de adicionar ~1.5MB no bundle, vale a pena

### 8.3 Critério de "pronto" pro v0.1

- [ ] Onboarding completo flui de 1 → 17 sem crashes em Android + iOS
- [ ] Todos os 10 campos novos salvam corretamente no AsyncStorage e hidratam ao reabrir
- [ ] Cálculo de macros gera valores plausíveis (testar com 3 perfis: female 25/65kg/perder/0.5; male 35/85kg/manter/0; female 18/55kg/ganhar/0.3)
- [ ] "Larissa Souza" não aparece mais em lugar nenhum (busca global)
- [ ] Flag `onboardedAt` impede que onboarding rode 2x
- [ ] Designer (você) aprovou visual em 3 telas-chave: 1, 11, 17
- [ ] Animações não derrubam o frame rate <55fps no celular alvo (Samsung do Raphael)

---

## 9. Decisões tomadas (2026-06-05)

| # | Tópico | Decisão |
|---|---|---|
| 1 | Animais Tela 10 | **Preguiça / Lebre / Onça-pintada** (mantém onça) |
| 2 | Avatar da Lu | **Pendente.** Raphael vai mandar foto da Luciana (nutricionista real) + referência Disney/Pixar pra gerar avatar 3D estilo Pixar. Versão temporária com placeholder sage + inicial "L" enquanto o asset oficial fica pronto |
| 3 | Tela 11 projeção | `Em 30 dias você pode perder até **X kg**` (estimativa positiva) |
| 4 | Hidratação Tela 17 | **Calcular por peso** (`~35 ml × peso_kg`, arredondar a 0.1L) |
| 5 | Goal=manter pula telas 9 e 10 | **OK** — pula peso desejado + velocidade. WeightGoalKg = peso atual |
| 6 | Skip de notificação | **OK** — pino visual no item "Notificações" do ProfileScreen quando permissão não concedida (badge laranja warning) |
| 7 | Foto Tela 2 | **Opcional.** Se não tiver, avatar com inicial do nome em círculo sage (componente `Avatar` já existente faz isso) |

---

## 10. Apêndice — texto completo dos copies em pt-BR

(consolidado pra revisão rápida)

| Tela | Título | Subtítulo / Contexto | CTA |
|---|---|---|---|
| 1 | Foto. Macros. Pronto. | Acompanhe seus macros sem esforço | Começar |
| 2 | Como devo te chamar? | Vou usar pra deixar tudo mais pessoal. | Continuar |
| 3 | Qual seu gênero? | Vamos usar pra calibrar seu plano personalizado. | Continuar |
| 4 | Quando você nasceu? | Sua idade entra no cálculo das suas metas diárias. | Continuar |
| 5 | Sua altura e peso atual | Vamos usar pra calcular suas metas diárias. | Continuar |
| 6 | Quantos treinos por semana? | Vamos usar pra calibrar seu plano. | Continuar |
| 7 | (Lu fala) | Pessoas que acompanham o que comem têm **2x mais chance** de bater suas metas. Junto comigo, vai ser muito mais fácil. | Continuar |
| 8 | Qual seu objetivo? | Vou usar pra gerar um plano calórico personalizado. | Continuar |
| 9 | Qual seu peso desejado? | Perder peso / Ganhar peso (contexto dinâmico) | Continuar |
| 10 | Em qual ritmo? | Perda/Ganho de peso por semana | Continuar |
| ~~11~~ | ~~Sua projeção~~ | **REMOVIDA — ver §5** | — |
| 11 | O que tá te impedindo? | Pode marcar quantos fizerem sentido. | Continuar |
| 12 | O que você quer alcançar? | Pode marcar quantos fizerem sentido. | Continuar |
| 13 | Posso te lembrar? | Lembretes leves nos horários certos. | Permitir |
| 14 | Tudo pronto, {nome}. | Valeu pela confiança 💚 Vou montar seu plano agora. | Vamos lá! |
| 15 | Tô preparando tudo pra você | (subtítulos rotativos) | (auto-avança) |
| 16 | Pronto, {nome}! Seu plano tá feito | Pode perder {X} kg até {data} | Bora começar! |

---

**Fim do spec.** Próximo passo: revisar este documento, responder as 7 decisões abertas na seção 9, e dar OK pra eu começar a implementação na fase A (infra + AppContext novos + storage).
