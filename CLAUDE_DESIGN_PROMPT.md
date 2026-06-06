# Prompt otimizado pra Claude Design — Onboarding Nutri Lu v0.1

> Copia o conteúdo abaixo (entre os marcadores `---START---` e `---END---`) e cola em uma nova conversa no Claude Design. Anexa as referências visuais que tiver (fotos da Luciana versão Pixar + qualquer screenshot do Cal AI que quiser usar como referência adicional).

---START---

# Briefing — Onboarding Mobile do app "Nutri Lu"

## Quem é você nesse projeto

Você é uma designer mobile sênior especializada em produtos de saúde e bem-estar. Vai desenhar o fluxo completo de onboarding (17 telas) de um app de nutrição brasileiro chamado **Nutri Lu**, baseado nas especificações detalhadas abaixo.

## Contexto do produto

Nutri Lu é um app de nutrição que combina 3 pilares:
1. **Tracking de macros** (estilo MyFitnessPal)
2. **Receitas curadas** (estilo ReciMe)
3. **Foto IA do prato** que retorna macros estimados (estilo Cal AI)

O público é **brasileiro**, então toda a copy é em **português brasileiro coloquial e acolhedor** (sem ser informal demais). A persona central é a **Lu**, uma nutricionista virtual em estilo 3D Pixar (a mascote real do app, baseada na nutricionista Luciana — tia e sócia do fundador). A Lu fala em primeira pessoa e tem tom acolhedor, próximo, sem ser professoral.

## Objetivo desta entrega

Desenhar as **17 telas do onboarding** como protótipo navegável em React + Tailwind CSS, otimizado pra resolução mobile (375×812 — iPhone Pro), com **microanimações** em todas as telas usando Framer Motion. O fluxo precisa estar conectado por estado (next/back), simulando a navegação real.

**Todas as 17 telas em UM artefato só**, com botão de "próxima" funcional pra eu poder clicar e ver o fluxo inteiro.

---

## Identidade visual

### Paleta de cores (use exatamente esses códigos)

```
PRIMÁRIA (sage)
- primary:      #97AF8F   (CTAs, estados selecionados, anel de calorias)
- primaryDeep:  #6F8C68   (gradiente do CTA hover, headings sutis)
- primarySoft:  #D6E0CF   (fundo do item central do wheel, badge)

ACENTOS DOS MACROS
- proteinPink:  #E5A6B0   (anel de proteína)
- carbsBlue:    #A8BFE0   (anel de carboidratos)
- fatsGold:     #D6C28A   (anel de gordura)
- waterIce:     #B5D2E5   (anel de hidratação)

DESTAQUE / ATENÇÃO
- warning:      #E59A5B   (destaque de número personalizado do user — equivalente ao coral do Cal AI; também usado em zonas de alerta como velocidade rápida demais)
- warningDeep:  #C77642   (texto sobre warning)

GRADIENTE CERIMONIAL (telas 15, 16)
- accentPink:   #EACBD1   →   accentBlue:   #C0CFE6

BASE (modo claro — default)
- bg:           #F6F6F6   (background da tela)
- bgElev:       #FFFFFF   (cards principais)
- bgSubtle:     #EEF0EC   (cards de opção não selecionados)
- text:         #1B1B1B
- textMuted:    rgba(27,27,27,0.58)   (subtítulos)
- textFaint:    rgba(27,27,27,0.32)   (items fora do centro do wheel)
- border:       rgba(27,27,27,0.07)
```

### Tipografia

- **DM Serif Display** (`font-serif`) — usar SOMENTE em momentos editoriais/emocionais: títulos de telas de feedback (7, 11), título da tela de boas-vindas (1), título da cerimônia (15), título do plano pronto (17). Importar do Google Fonts.
- **Plus Jakarta Sans** Bold 700 e ExtraBold 800 — todos os títulos de perguntas, números grandes (peso/idade/macros). Importar do Google Fonts.
- **Nunito Sans** Regular 400 e SemiBold 600 — subtítulos, body, labels de cards.

### Voz da marca (copywriting)

- Português brasileiro próximo, evita "você ↔ o usuário" formal
- Lu fala em 1ª pessoa ("vou usar pra calibrar seu plano", "valeu pela confiança")
- Verbos no presente, frases curtas
- Emoji 💚 (verde-coração) é o único emoji aprovado nas telas finais (cerimônia)
- Nunca usa exclamação dupla, jamais usa caps lock, evita "incrível/maravilhoso"

### Personagem Lu (mascote)

- Estilo: **3D Pixar/Disney**, mulher 40 anos, cabelos ondulados loiro-mel, olhos verde-avelã expressivos, tricot creme, expressão acolhedora
- **No protótipo, use placeholder**: círculo `primary #97AF8F` 64×64 com letra "L" branca em DM Serif Display centralizada
- Aparece nas telas: 1 (sutil), 7, 11, 15 (grande), 17
- Anota um comentário visível no código onde a Lu apareceria: `{/* TODO: substituir por <LuAvatar pose="welcome|greeting|celebration|thinking" /> quando assets prontos */}`

### Princípios de layout

- **Padding horizontal padrão**: 24px de cada lado
- **Safe area top**: 60px (notch + status bar)
- **Safe area bottom**: 32px (gesture bar Android/iOS)
- **CTA principal** (Continuar/Começar/etc): pill width-full, altura 56px, `primary` bg, texto branco Plus Jakarta 700 18px, posicionado fixo no rodapé com 24px de margin bottom
- **Header de progresso** (telas 2-17): back button circular (44×44, bg `bgSubtle`, ícone seta esquerda 20px) à esquerda + progress bar à direita ocupando o resto (height 4px, radius 999, track `bgSubtle`, fill gradient `primary → primaryDeep`, anima width quando muda de tela)
- **Cards de opção** (OptionCard):
  - Não selecionado: bg `bgSubtle`, texto `text`, sem border, padding 20px, radius 16px
  - Selecionado: bg `primary`, texto branco, escala 1.02, sombra sutil sage
  - Transição: 200ms easing

---

## As 17 telas — especificação completa

> Pra cada tela: implemente o layout exato, com a copy descrita, as microanimações listadas e o estado/botão de avançar funcional.

### Tela 1 — Boas-vindas (Hero)

- **Sem header de progresso** (essa é a tela 0/17)
- **Mockup de celular centralizado no topo** (60% da altura) — desenhe um celular preto bordas arredondadas mostrando crossfade entre 2 telas mockadas internamente:
  - Frame A: tela de câmera mockup com retículo enquadrando um prato bonito + pill "Foto" embaixo
  - Frame B: tela home mockup com "1739 kcal restantes" + anéis de macros
  - Crossfade a cada 2.5s em loop
- **Título**: `Foto. Macros. Pronto.` (DM Serif Display 38px, centralizado, cor `text`, line-height 1.1)
- **Subtítulo**: `Acompanhe seus macros sem esforço` (Plus Jakarta 16px, cor `textMuted`, centralizado, max-width 280px)
- **CTA**: pill `Começar` width-full no rodapé
- **Microanimação**:
  - Título e subtítulo: fade in + slide up 12px, duração 280ms, ease-out, stagger 80ms
  - Mockup: crossfade contínuo das 2 telas internas
  - CTA: fade in delay 600ms

### Tela 2 — Nome + foto opcional

- Header: back disabled (primeira tela do funil) + progress 1/16
- **Título**: `Como devo te chamar?` (Plus Jakarta 700 28px)
- **Subtítulo**: `Vou usar pra deixar tudo mais pessoal.` (textMuted)
- **Avatar grande clicável** (120×120, círculo, bg `bgSubtle` com inicial do nome digitado em sage; quando vazio, mostra ícone de câmera). Badge "+" sage no canto inferior direito.
- **Input de nome**: TextInput grande width-full, height 56px, bg white, border `border`, placeholder `Seu nome`, autoCapitalize first
- **CTA "Continuar"**: desabilitado (opacity 40% + `primarySoft`) até `name.trim().length >= 2`. Quando habilita, transição cor 200ms.
- **Microanimação**:
  - Título: fade + slide up 280ms ease-out
  - Avatar: spring bounce in (scale 0.8 → 1.0) 400ms
  - Input: fade in delay 200ms

### Tela 3 — Gênero

- Header: back + progress 2/16
- **Título**: `Qual seu gênero?`
- **Subtítulo**: `Vamos usar pra calibrar seu plano personalizado.`
- **3 OptionCards verticais empilhados** (margin 12px entre):
  - `Feminino`
  - `Masculino`
  - `Outro / Prefiro não dizer`
- **CTA "Continuar"** desabilitado até escolher
- **Microanimação**: cards stagger fade-in (80ms entre cada, slide up 8px) + transição de seleção

### Tela 4 — Data de nascimento

- Header: back + progress 3/16
- **Título**: `Quando você nasceu?`
- **Subtítulo**: `Sua idade entra no cálculo das suas metas diárias.`
- **3 wheel pickers lado a lado** (Mês | Dia | Ano):
  - Wheel: 7 itens visíveis, item central com bg `primarySoft` pill, itens fora do centro com opacity 0.32 → 0.58 → 0.85 → 1.0
  - Snap suave (spring)
  - Meses em pt-BR: Janeiro, Fevereiro, Março, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro
  - Dias: 1-31
  - Anos: 1940-2010
  - Default selecionado: 1 Janeiro 2000
- **CTA "Continuar"** sempre habilitado

### Tela 5 — Altura e peso atual

- Header: back + progress 4/16
- **Título**: `Sua altura e peso atual`
- **Subtítulo**: `Vamos usar pra calcular suas metas diárias.`
- **2 wheel pickers lado a lado**, com labels "Altura" e "Peso" acima:
  - Wheel altura: 140-220 cm, default 165 cm
  - Wheel peso: 35-200 kg, default 65 kg
  - NÃO inclui toggle Imperial/Metric (BR é sempre métrico)
- **CTA "Continuar"** sempre habilitado

### Tela 6 — Frequência de treino

- Header: back + progress 5/16
- **Título**: `Quantos treinos por semana?`
- **Subtítulo**: `Vamos usar pra calibrar seu plano.`
- **3 OptionCards com ícone à esquerda**:
  - `[1 ponto]` **0 – 2** · `De vez em quando`
  - `[3 pontos triângulo]` **3 – 5** · `Algumas vezes por semana`
  - `[6 pontos hexágono]` **6+** · `Atleta dedicado`
- Ícone num círculo branco 44×44 dentro do card
- **CTA "Continuar"** desabilitado até escolher

### Tela 7 — Lu explica (FEEDBACK editorial)

- Header: back + progress 6/16
- **Sem cards de opção** — tela puramente narrativa, com Lu em destaque
- **Avatar Lu pequeno** (56×56, placeholder círculo sage com "L") canto superior esquerdo do bloco de texto
- **Texto principal em DM Serif Display 28px** com hierarquia interna:
  - `Pessoas que acompanham o que comem têm` (linha 1, cor `text`)
  - `2x mais chance` (linha 2, cor `primary` em destaque)
  - `de bater suas metas.` (linha 3, cor `text`)
- **Texto secundário (Plus Jakarta 16px textMuted)**:
  - `Junto comigo, vai ser muito mais fácil.`
- **CTA "Continuar"**
- **Microanimação**:
  - Texto entra parte por parte com fade-in stagger 200ms entre blocos
  - "2x mais chance" pulsa scale 1.0 → 1.05 → 1.0 (600ms) ao aparecer
  - Avatar fade-in com slight bounce

### Tela 8 — Objetivo

- Header: back + progress 7/16
- **Título**: `Qual seu objetivo?`
- **Subtítulo**: `Vou usar pra gerar um plano calórico personalizado.`
- **3 OptionCards verticais**:
  - `Perder peso`
  - `Manter peso`
  - `Ganhar peso`
- **CTA "Continuar"** desabilitado até escolher
- **Comportamento condicional**: se o user escolher "Manter peso", o fluxo deve PULAR as telas 9 e 10 (peso desejado e velocidade) e ir direto pra 11. Implementa isso no estado.

### Tela 9 — Peso desejado

- Header: back + progress 8/16
- **Título**: `Qual seu peso desejado?`
- **Contexto dinâmico acima do número grande**:
  - se goal=lose: `Perder peso` (cor `textMuted`)
  - se goal=gain: `Ganhar peso`
- **Número gigante centralizado**: `54,0 kg` (Plus Jakarta 800 48px, atualiza ao deslizar)
- **Régua scrollable horizontal** abaixo do número:
  - Ticks: grandes a cada 5 kg, pequenos a cada 1 kg, valores: 30 a 200 kg
  - Indicador central (linha sage 2px vertical)
  - Ao deslizar, número atualiza com spring suave
  - Haptic light a cada kg (simular visualmente com brief opacity flash do indicador)
- **CTA "Continuar"**
- **Validação**: se goal=lose e peso desejado ≥ peso atual (vem da tela 5), mostrar texto cinza pequeno abaixo da régua: `Pra perder peso, escolha um valor menor que seu peso atual.` e desabilitar CTA.

### Tela 10 — Velocidade de progresso

- Header: back + progress 9/16
- **Título**: `Em qual ritmo?`
- **Label acima do número**: `Perda de peso por semana` (textMuted, 14px) — ou `Ganho de peso por semana` se goal=gain
- **Número grande centralizado**: `0,8 kg` (Plus Jakarta 800 36px)
- **Linha horizontal abaixo com 3 ilustrações de animais brasileiros**:
  - Esquerda: 🦥 **Preguiça** (lento)
  - Centro: 🐰 **Lebre** (médio)
  - Direita: 🐆 **Onça-pintada** (rápido)
  - Use emojis no protótipo (substitui por SVG depois)
- **Slider horizontal** com handle (círculo sage 32×32) — range 0.1 a 1.5 kg, step 0.05
- **Labels embaixo**: `0,1 kg` à esquerda, `0,8 kg` no centro, `1,5 kg` à direita
- **Pill de feedback contextual** abaixo do slider (atualiza com a posição):
  - Slow (0.1-0.3): bg `bgSubtle`, texto `Devagar e firme`
  - Recomendado (0.4-1.0): bg `bgSubtle`, texto `Recomendado`
  - Rápido (1.1-1.5): bg warning suave (`#F5C8A0`), texto warningDeep, `Cuidado: pode causar fadiga e perda de massa magra. A Lu não recomenda.`
- **Microanimação**:
  - Animal ativo (zona do slider): scale 1.15 + cor `primary` (mid) ou `warning` (fast) + animação loop específica:
    - Preguiça: rotateZ -3° ↔ +3° (2s)
    - Lebre: translateY 0 → -8 → 0 (600ms a cada 1.5s)
    - Onça: translateX -4 ↔ +4 (200ms loop)
  - Animais inativos: opacity 0.4, sem animação, cinza
  - Pill cross-fade ao mudar de zona (250ms)
- **CTA "Continuar"**

### Tela 11 — Sua projeção (FEEDBACK editorial #2)

- Header: back + progress 10/16
- **Título grande** (DM Serif Display 28px, cor `text`): `Você consegue, {nome}.` (substitui pelo nome digitado na tela 2; se vazio, usar `Você consegue!`)
- **Card central** (bg `bgSubtle`, radius 20, padding 24):
  - Label superior: `Sua projeção` (Plus Jakarta 600 14px)
  - **Gráfico de linha** ocupando o card:
    - Curva sage suave subindo da esquerda inferior pra direita superior, com gradiente sutil de fill abaixo (sage transparente)
    - 3 pontos circulares (sage outline + white fill) nos marcos: `3 dias`, `7 dias`, `30 dias`
    - Labels dos marcos abaixo do eixo X
  - **Texto abaixo do gráfico**:
    - `Em 30 dias você pode perder até **2,4 kg**` (a parte em negrito usa cor `primary`)
    - Calcular dinamicamente: `weeklyRate × (30/7)` arredondado a 1 casa
- **CTA "Continuar"**
- **Microanimação**:
  - Card fade in delay 200ms
  - Curva: stroke animation left → right 800ms easing
  - Pontos aparecem em sequência conforme a curva passa por eles (bounce in)
  - Texto "Em 30 dias..." digita aparecendo com fade-in 1000ms delay após curva

### Tela 12 — Barreiras (multi-select)

- Header: back + progress 11/16
- **Título**: `O que tá te impedindo?`
- **Subtítulo**: `Pode marcar quantos fizerem sentido.`
- **5 OptionCards multi-select** (cada um com ícone à esquerda em círculo branco + texto + radio circle vazio/cheio à direita):
  - `[gráfico de barras]` `Falta de constância`
  - `[hamburger]` `Alimentação ruim`
  - `[mãos dadas]` `Falta de apoio`
  - `[calendário]` `Agenda corrida`
  - `[maçã]` `Falta de ideias de refeição`
- Estado selecionado: card vira sage bg + texto branco + check sage no radio circle
- **CTA "Continuar"** habilitado se >=1 selecionado

### Tela 13 — Motivações (multi-select)

- Header: back + progress 12/16
- **Título**: `O que você quer alcançar?`
- **Subtítulo**: `Pode marcar quantos fizerem sentido.`
- **4 OptionCards multi-select**:
  - `[maçã]` `Comer e viver melhor`
  - `[sol]` `Mais energia e disposição`
  - `[músculo]` `Manter motivação e constância`
  - `[meditação]` `Me sentir bem com meu corpo`
- **CTA "Continuar"** habilitado se >=1 selecionado

### Tela 14 — Permissão de notificação

- Header: back + progress 13/16
- **Título**: `Posso te lembrar?`
- **Subtítulo**: `Lembretes leves nos horários certos.`
- **3 cards mockup de notificação** empilhados verticalmente (simula como vai aparecer no celular):
  - Bg white, radius 16, padding 16, sombra leve, ícone de app à esquerda (placeholder círculo sage 32×32 com "L")
  - Card 1: `Hora do almoço!` + `Lembrete de refeição` + `12:30`
  - Card 2: `Hidratação` + `Falta beber 800 ml hoje` + `18:00`
  - Card 3: `Insight da Lu` + `Vi seus macros — tem uma dica pra você` + `21:00`
- **CTA primário "Permitir"** width-full sage
- **Link secundário discreto abaixo**: `Agora não` (textMuted, sublinhado, sem botão)
- **Microanimação**: cards stagger fade-in 100ms entre cada; card 1 pulsa sutil (scale 1.0 → 1.02 → 1.0) loop 2.5s pra chamar atenção

### Tela 15 — Hora de gerar seu plano

- Header: back + progress 14/16
- **Sem subtítulo** — tela cerimonial
- **Centro da tela: círculo gradient grande** (220×220):
  - Border 8px gradient `accentPink → accentBlue`
  - Centro com fill cream `#FAF7F2`
  - Dentro: coração sage `#97AF8F` 64×64 pulsando (scale 1.0 ↔ 1.08, 1.2s)
  - 4-6 partículas sage pequenas (4×4 pontinhos) flutuando ao redor com opacity oscilando
  - O círculo todo rotaciona lentamente (12s/volta)
- **Texto abaixo do círculo**:
  - `Tudo pronto, {nome}.` (DM Serif Display 28px, centralizado)
  - `Valeu pela confiança 💚` (Plus Jakarta 16px textMuted)
  - `Vou montar seu plano agora.` (Plus Jakarta 16px textMuted)
- **CTA**: `Vamos lá!` (sage pill)
- **Microanimação**: tudo o que já descrevi do círculo + texto fade + slide up stagger

### Tela 16 — Gerando seu plano

- **SEM header** — imersivo
- **Centralizado verticalmente**:
  - Número gigante de progresso: `0%` → `100%` (Plus Jakarta 800 64px, centralizado, anima em 4s easing)
  - Abaixo: título `Tô preparando tudo pra você` (DM Serif Display 22px)
  - Barra de progresso width-full (height 6, radius 999, track `bgSubtle`, fill gradient `accentPink → accentBlue`) preenchendo conforme número
  - Subtítulo rotativo abaixo da barra (textMuted 14px, cross-fade 800ms a cada troca):
    - 0-20%: `Calculando seu metabolismo basal…`
    - 20-40%: `Definindo suas metas de macros…`
    - 40-60%: `Selecionando receitas pro seu perfil…`
    - 60-80%: `Configurando seus lembretes…`
    - 80-100%: `Quase lá…`
- **Card embaixo** (bg `bgSubtle`, radius 16, padding 20):
  - Label: `Recomendação diária pra você` (Plus Jakarta 600)
  - Lista vertical com check à direita:
    - `Calorias` ✓ (preenche em 20%)
    - `Carboidratos` ✓ (preenche em 40%)
    - `Proteína` ✓ (preenche em 60%)
    - `Gordura` ✓ (preenche em 80%)
    - `Hidratação` ✓ (preenche em 95%)
  - Check inicial: círculo cinza vazio (`bgSubtle` border `borderStrong`)
  - Check preenchido: círculo `primary` com check branco dentro (bounce in 300ms)
- **Sem CTA** — auto-avança pra tela 17 quando chega em 100%

### Tela 17 — Plano pronto (PAYOFF)

- **SEM header** — tela cerimonial final
- **Centralizado verticalmente no topo**:
  - Checkmark sage gigante: círculo `primary` 80×80 com check branco dentro (spring bounce in scale 0 → 1.1 → 1.0, 600ms)
  - Abaixo título DM Serif Display 26px centralizado: `Pronto, {nome}! Seu plano tá feito` (line-height 1.2, 2 linhas)
  - Pill cinza claro (bg `bgSubtle`, radius 999, padding 12 24) com texto: `Pode perder 5,0 kg até 28 de junho` (calcular data dinamicamente: hoje + dias necessários pra atingir meta no ritmo escolhido)
- **Card grande abaixo** (bg `bgSubtle`, radius 20, padding 20):
  - Título: `Recomendação diária` (Plus Jakarta 700 18px)
  - Subtítulo: `Você pode editar a qualquer momento` (textMuted 14px)
  - **Grid 2×2 de mini-cards** (bg white, radius 16, padding 16):
    - **🔥 Calorias** | número grande Plus Jakarta 800 24px (ex: `1850`) | label "Kcal" | anel circular sage atrás do número | ícone de lápis ✏️ canto inferior direito
    - **🌾 Carboidratos** | `180g` | label "Carbs" | anel `carbsBlue` | lápis
    - **🍗 Proteína** | `140g` | label "Prot" | anel `proteinPink` | lápis
    - **💧 Hidratação** | `2.3L` | label "Água" | anel `waterIce` | lápis
  - Os números são fictícios pro protótipo, mas a fórmula no código real será:
    - Calorias: BMR * fator_atividade ± déficit/superávit calórico
    - Carbs: 40% das kcal / 4
    - Proteína: 30% das kcal / 4
    - Gordura: 30% das kcal / 9
    - Hidratação: peso_kg * 35 / 1000 (em litros, arredondar 0.1)
- **CTA**: `Bora começar!` (sage pill)
- **Microanimação**:
  - Checkmark: spring bounce in
  - Título: fade in delay 200ms
  - Pill da meta: slide up + fade delay 400ms
  - Mini-cards: stagger fade-in (100ms entre eles) delay 600ms
  - **Anéis dos mini-cards**: stroke animation 0% → valor final em 800ms
  - **Números dentro dos anéis**: count-up animation (0 → valor final) durante a animação do stroke
  - CTA: pulse sutil 1× ao montar
- **Ao clicar CTA**: pode mostrar um toast ou simplesmente "fim do onboarding" no protótipo.

---

## Microanimações — padrões globais

### Header de progresso
- Progress bar anima width quando muda de tela (350ms ease-out)
- Back button: scale 0.92 ao tocar, rebote suave

### Entrada de cada tela (default — sobrepõe quando tela tem animação própria)
1. Background fade-in (0 → 1, 200ms)
2. Header já no lugar
3. Título: fade + translateY 12 → 0, 280ms ease-out
4. Subtítulo: fade + translateY 12 → 0, 280ms ease-out delay 80ms
5. Conteúdo principal: stagger por elemento (60-100ms entre cada), delay 200ms
6. CTA: fade-in delay 400ms

### Transição entre telas
- Slide horizontal da direita (slide_from_right padrão iOS)
- Duração 300ms easing

### OptionCards
- Press: scale 0.97 (haptic light visual: brief flash)
- Selected transition: 200ms ease

### Wheels (Telas 4, 5)
- Snap suave (spring leve)
- Item central: bg `primarySoft` pill
- Items fora do centro: opacity 0.32 / 0.58 / 0.85 baseado em distância

### Slider de animais (Tela 10)
- Animal da zona ativa: scale 1.15 + cor + loop específico (descrito na Tela 10)
- Pill de feedback: cross-fade 250ms ao mudar zona

### Charts (Telas 11, 16)
- Stroke animation left → right
- Easing cubic-bezier(0.65, 0, 0.35, 1)
- Números chave: count-up
- Pontos: bounce in em sequência

---

## Stack técnica esperada

- **React** funcional com hooks
- **Tailwind CSS** pra estilização (configurar JIT no preview)
- **Framer Motion** pra todas as animações (`<motion.div>` com `initial`, `animate`, `exit`, `transition`)
- **Estado**: useState no componente raiz, com objeto `{ name, gender, birthDate, height, weight, activityLevel, goal, weightGoal, weeklyRate, barriers, motivations }`
- **Navegação**: `currentScreen` index 0-16, com botões `next()` e `back()`
- **Persistência**: NÃO precisa (é protótipo)
- **Fonts**: importar Plus Jakarta Sans (400, 700, 800), Nunito Sans (400, 600), DM Serif Display (400, 400-italic) via `<link>` Google Fonts no topo

## Restrições importantes

- **NÃO use bibliotecas pesadas além das listadas** (sem react-router, sem zustand, sem styled-components)
- **NÃO crie multiple files** — tudo em UM componente React único pra rodar no preview
- **Lu placeholder**: use `<div>` redondo sage com letra "L" branca centralizada (Plus Jakarta 700) — nunca uma imagem real (vamos trocar depois)
- **Animais Tela 10**: use emojis 🦥 🐰 🐆 — o tradutor vai trocar por SVG depois
- **Datas em pt-BR**: formato "28 de junho" (mês por extenso, minúsculo)
- **Numerais com vírgula**: 5,0 kg / 1,8 m / 0,8 kg (não "5.0")

## O que o output precisa ter

1. Um componente React único e completo (1 arquivo)
2. Estilo via Tailwind classes (já com config padrão)
3. Framer Motion configurado
4. **Botões de "Próxima" e "Anterior" funcionando entre todas as 17 telas**
5. Estado do formulário sendo coletado (mesmo que só pra console.log no final)
6. **TODAS as 17 telas implementadas** — sem placeholders tipo "Tela 7 — TODO"
7. Microanimações funcionando em pelo menos: entrada de tela, OptionCards selecionados, wheels, slider de animais, charts da Tela 11/16, checkmark Tela 17

## Arquitetura sugerida

```
<App>
  <div className="iphone-frame"> // wrapper 375×812 com background bg
    <ProgressHeader currentScreen={...} onBack={...} />  // condicional (esconde nas telas 1, 16, 17)
    <AnimatePresence mode="wait">
      {currentScreen === 0 && <Screen1 onNext={next} />}
      {currentScreen === 1 && <Screen2 form={form} setForm={setForm} onNext={next} />}
      ... até 17
    </AnimatePresence>
    <CTAFooter visible={...} disabled={...} label={...} onPress={next} />
  </div>
</App>
```

## Critério de sucesso

- Quando eu abrir o preview, consigo clicar "Começar" e navegar pelas 17 telas até o final, com microanimações suaves em cada uma.
- O estado é coletado corretamente (posso ver no console ao chegar na Tela 17).
- O visual remete imediatamente a um app de nutrição premium brasileiro — limpo, acolhedor, sage tones, com momentos editoriais em DM Serif Display.
- As 4 telas de Lu (7, 11, 15, 17) têm peso emocional diferente das telas de formulário.

Manda o protótipo. Pode iterar comigo depois pra ajustar detalhes.

---END---

## Notas pra você (Raphael) sobre como usar

1. **Cola o conteúdo entre `---START---` e `---END---`** numa nova conversa no Claude Design (claude.ai/new com modo artifact, ou Claude Design Studio se for separado)
2. **Anexa as 2 fotos da Luciana** (real + Pixar) pra Claude ter referência visual da Lu — vai usar pra animar o placeholder com mais empatia
3. **Anexa também 1-2 screenshots do Cal AI** que você gostou (escolhe os que melhor traduzem o tipo de feedback editorial que queremos — telas 11 e 12 minhas (do Cal AI) recomendaria)
4. **Espera o protótipo gerar** (vai ser longo, ~2-3 min)
5. **Itera**: depois de ver, pede ajustes pontuais (ex: "muda a curva do gráfico da tela 11 pra ser mais sutil", "deixa a velocidade da preguiça na tela 10 mais lenta", etc.)
6. **Quando aprovar**: salva os mockups (screenshot de cada tela) e me manda. Eu uso isso pra implementar pixel-accurate em React Native com Expo
7. **Se o resultado vier em inglês por engano**: pede explicitamente "tudo em português brasileiro" no follow-up

## Sobre o paralelo

Enquanto você gera no Claude Design, eu vou começando a Fase A da implementação (infra + AppContext + storage) — esse trabalho não bloqueia nem depende do design final.
