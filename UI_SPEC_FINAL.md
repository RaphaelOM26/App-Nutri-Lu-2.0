# App Nutri Lu 2.0 — Especificação de UI (Versão Final / Produto Completo)

> App de nutrição combinando rastreamento de macros (MyFitnessPal) + receitas (ReciMe) + IA visual de comida (Cal AI).
> Idioma: pt-BR. Plataforma: iOS + Android (mobile-first).
>
> **Esta é a visão completa do produto.** Para o escopo reduzido de primeira entrega, consulte `UI_SPEC_MVP.md`.
> Tudo que está aqui e NÃO aparece no MVP entra como roadmap pós-lançamento.

---

## 1. Visão Geral & Design System

### 1.1 Princípios
- Mobile-first, gestos naturais, ações principais ao alcance do polegar
- **1 toque para registrar comida** (foto, barcode ou voz) — fluxo principal de uso diário
- Minimalismo com personalidade: cards arredondados (16-24px), espaçamento generoso, tipografia hierárquica clara
- Modo claro e escuro nativos
- Microanimações em feedback (anéis enchendo, conquistas)

### 1.2 Paleta (sugestão)
- **Primária**: Verde nutrição `#22C55E`
- **Secundária**: Laranja `#F97316`
- **Macros**: Proteína `#EF4444` | Carb `#F59E0B` | Gordura `#8B5CF6`
- **Neutros**: `#0F172A` (texto), `#64748B` (secundário), `#F8FAFC` (fundo), `#FFFFFF` (cards)

### 1.3 Tipografia
- Heading: Inter / SF Pro Display Bold
- Body: Inter / SF Pro Text Regular/Medium
- Escala: 32 / 24 / 20 / 18 / 16 / 14 / 12

### 1.4 Componentes globais
Botão primário (full-width, 56px alt, radius 16px), secundário (outline), FAB de câmera, cards de refeição, anel de progresso de macro (3 concêntricos), slider de porção, input de busca com voz, toast, modal bottom sheet, picker de data horizontal, tab bar (5 tabs), header com avatar.

### 1.5 Navegação Principal (Tab Bar Inferior)
1. **Início** (Dashboard)
2. **Diário**
3. **+ Câmera** (FAB central destacado — atalho IA Foto)
4. **Receitas** (biblioteca + planejador)
5. **Eu** (perfil/progresso/config)

---

## 2. Onboarding & Autenticação

**2.1 Splash** — logo, animação 2s, versão no rodapé.

**2.2 Welcome Carousel** (3 slides):
- "Acompanhe seus macros sem esforço"
- "Bata uma foto e descubra as calorias"
- "Suas receitas, suas metas, seu app"

**2.3 Sign Up / Sign In** — Apple, Google, e-mail+senha, recuperar senha, aceite de Termos.

**2.4 Recuperar Senha** — input e-mail + confirmação.

**2.5 Onboarding (10-12 telas, 1 pergunta cada, barra de progresso)**:
1. Nome
2. Objetivo (perder/manter/ganhar/melhorar saúde)
3. Sexo biológico
4. Data de nascimento
5. Altura
6. Peso atual
7. Peso meta
8. Velocidade da meta (lenta/moderada/rápida, com aviso de saúde)
9. Nível de atividade (sedentário→atleta)
10. Restrições alimentares (multi-select)
11. Alergias e intolerâncias
12. Atribuição (como conheceu)

**2.6 Loading de cálculo** — Lottie 3-5s "Calculando seu plano…"

**2.7 Seu plano pronto** — meta calórica + macros (3 mini-cards) + data estimada + botões "Personalizar" / "Vamos lá".

**2.8 Permissões sequenciais**: Notificações → Câmera → Health/Google Fit → Localização (opcional).

**2.9 Paywall** — hero com benefícios, 2 planos (mensal / anual -50%), "Teste grátis 7 dias", link "continuar gratuito". Benefícios: foto IA ilimitada (vs 3/dia), importação receita link/vídeo, planejador + lista de compras, chat IA, exportação relatórios, sem ads.

---

## 3. Início / Dashboard (Tab 1)

- **Header**: avatar + saudação dinâmica + sino notificações + streak 🔥
- **Card principal — Anéis de progresso**: 1 anel grande (kcal restantes) + 3 anéis P/C/G ao redor
- **Quick Actions (grid 4)**: 📷 Foto IA · 🔍 Buscar · 📊 Barcode · 🎤 Voz
- **Refeições de Hoje**: card por refeição (ícone, nome, kcal, miniaturas, botão +)
- **Card de Água**: visual de copo enchendo, meta, botão +1
- **Insights (carrossel horizontal)**: streaks, déficits, sugestões, resumos
- **Atividade Física**: passos (Health/Fit), kcal queimadas, + exercício manual
- **Pull-to-refresh**

---

## 4. Diário Alimentar (Tab 2)

- **Header**: picker de data horizontal (semana visível), botão "Hoje", ícone calendário
- **Resumo do dia (sticky)**: mini anel + barras de macros
- **Lista de refeições** (Café/Almoço/Lanche/Jantar — customizável):
  - Header: nome + kcal total + horário sugerido
  - Itens com foto miniatura, nome + porção, kcal + P/C/G
  - Swipe ← deletar, → duplicar
  - "+ Adicionar alimento" full-width
- **Card de água**, **Card de exercícios**, **Card de notas (humor/sintomas)**
- **Rodapé**: Consumido | Meta | Restante + botão "Completar dia"

---

## 5. Adicionar Alimento (Modal/Tela)

**5.1 Header**: "Adicionar a [Café da Manhã]" + X

**5.2 Tabs**: Buscar | Recentes | Favoritos | Meus Alimentos | Receitas | Refeições

**5.3 Barra de busca**: input + microfone + barcode + câmera (IA)

**5.4 Resultados**: nome + marca + porção padrão + kcal + estrela favoritar. Long-press = adicionar rápido.

**5.5 Detalhe do alimento**: tabela nutricional (100g e porção), seletor de unidade (g/ml/colher/xícara/unidade), slider de quantidade, preview de impacto nos macros, botão "Adicionar".

**5.6 Quick Add**: só kcal (+ macros opcional).

**5.7 Criar alimento customizado**: form completo (nome, marca, porção base, kcal, P/C/G/fibras/sódio/açúcar), foto opcional, privado/comunidade.

---

## 6. Scanner de Código de Barras

- Câmera fullscreen com frame de mira, lanterna, instrução, animação de scan
- Botão "Digitar manualmente"
- Resultado: tela de detalhe do alimento. Se não encontrar → criar manual com OCR do rótulo pré-preenchido.

---

## 7. Foto IA — Reconhecimento de Comida (Core Cal AI)

**7.1 Câmera**: fullscreen, captura central, toggle foto/vídeo, galeria, lanterna, dica "Foto de cima funciona melhor".

**7.2 Loading de análise**: foto com overlay + animação IA.

**7.3 Resultado**:
- Foto no topo com bounding boxes sobre cada item
- Lista de itens: ícone + nome + porção estimada + kcal/macros
- Slider "mais / igual / menos" por item
- Editar / deletar item / + adicionar não detectado
- Total consolidado no rodapé
- Botões "Salvar no diário" / "Salvar como receita"
- Indicador de confiança (alto/médio/baixo)

**7.4 Múltiplas fotos**: vários ângulos para precisão.

---

## 8. Entrada por Voz / Texto

**8.1 Voz**: microfone pulsando, transcrição em tempo real, parar/refazer.

**8.2 Resultado parsing IA**: lista de itens extraídos com porções (mesma UI 7.3).

---

## 9. Receitas (Tab 4) — Biblioteca

**9.1 Header**: título + busca + filtro + "+"

**9.2 Tabs**: Minhas Receitas | Descobrir | Coleções | Planejador | Lista de Compras | Despensa

**9.3 Minhas Receitas**: grid 2 col (foto, nome, tempo, tags, kcal/porção, favorito). Filtros chip: Todas/Café/Almoço/Jantar/Lanche/Sobremesa. Long-press = ações.

**9.4 Descobrir** (feed curado):
- "Para suas metas" (baseado em macros restantes)
- "Em alta"
- "De nutricionistas que você segue"
- "Combina com seu humor de hoje"

**9.5 Coleções**: grid com capas mosaico ("Café proteico", "Pré-treino" etc.) + "+ Nova".

**9.6 Despensa**: lista por categoria (Hortifruti/Proteínas/Grãos/Laticínios/Temperos), item com qtd + validade (alerta), "+ manual / barcode / foto da geladeira IA", toggle "Mostrar receitas que cabem".

---

## 10. Detalhe da Receita

- **Header parallax**: foto cover + voltar/favorito/compartilhar/menu
- **Info**: nome, autor, rating, tags, tempo, dificuldade, porções (com +/- escala dinâmica)
- **Tabela nutricional**: por porção e receita inteira + anel
- **Tabs**: Ingredientes | Modo de Preparo | Notas
  - Ingredientes: checkboxes, escala automática, "✓ tem na despensa" / "🛒 adicionar à lista"
  - Modo de preparo: passos numerados, foto opcional, timer integrado, **botão "Modo Cozinhar" fullscreen** (tela acordada, navegação por passo)
  - Notas: pessoais + histórico "vezes que fiz" (data + nota + fotos)
- **Rodapé sticky**: "Adicionar ao Diário" + "Planejar"

---

## 11. Criar/Importar Receita

**11.1 Seleção do método** (4 cards):
- 🔗 Importar de link (Insta/TikTok/YouTube/blog)
- 📷 Foto de receita (OCR de livro/papel/print)
- 🎥 Vídeo (transcrição + IA)
- ✏️ Criar do zero

**11.2-11.4 Importações**: cola link / tira foto / upload vídeo → loading IA → resultado editável.

**11.5 Editor**: foto cover, nome, descrição, categoria/tags/dietas, tempo/dificuldade/porções, ingredientes (qtd+unidade+nome com autocomplete, drag reordena), modo de preparo (texto+foto+tempo por passo, drag), **cálculo nutricional automático em tempo real**, **visibilidade (Privada / Amigos / Pública)**, coleção, salvar.

---

## 12. Planejador Semanal

- Grid: colunas Seg-Dom × linhas Café/Almoço/Lanche/Jantar
- Drag & drop receitas entre células
- Botão "Gerar plano com IA" (baseado em metas + restrições + despensa)
- Sidebar/bottom sheet de receitas para arrastar
- Resumo no topo: média kcal/macros vs meta (✓/⚠️)
- Ações: "Gerar lista de compras" / "Aplicar ao diário" / "Duplicar para próxima semana"

---

## 13. Lista de Compras

- Agrupada por categoria (Hortifruti/Proteínas/Grãos/Laticínios/Temperos/Outros)
- Item: checkbox + nome + qtd consolidada + "✓ na despensa"
- Swipe ← deletar, long-press editar
- "+ Adicionar manual" com autocomplete
- **Modo Mercado** (fullscreen, fonte grande, vibração ao marcar)
- **Compartilhar via link/WhatsApp com sincronia colaborativa** (multi-usuário)

---

## 14. Progresso & Métricas

Tabs: **Peso** | **Medidas** | **Fotos** | **Macros** | **Hábitos**

- **Peso**: gráfico linha (7/30/90/365/Tudo), atual/meta/variação, registro + histórico
- **Medidas**: gráficos por região (cintura/quadril/peito/braço/coxa/pescoço) + boneco visual
- **Fotos**: grid por data, **comparador antes/depois com slider**, tags frente/lado/costas, privado
- **Macros**: gráficos semanais/mensais, média por período, **heatmap consistência (GitHub-style)**
- **Hábitos**: streak atual + recorde, conquistas, hábitos custom (dormi 8h, treinei…)
- **Relatório semanal/mensal**: insights por IA (aderência, ofensores, vitórias, sugestões)

---

## 15. Chat IA Nutricional ("Lu")

- Header: "Lu, sua nutri IA" + avatar
- Bolhas de mensagem, sugestões rápidas em chips:
  - "Monta meu cardápio de amanhã"
  - "O que faço com o que tenho na despensa?"
  - "Tô com vontade de doce"
  - "Sugere receita pré-treino"
- Input com microfone + anexar foto
- **Contexto**: acesso a perfil, metas, diário, receitas, despensa
- Pode sugerir receitas (cards inline), adicionar refeição ao diário com confirmação, explicar nutrição, gerar planos
- Disclaimer: "Não substitui um nutricionista"

---

## 16. Social & Comunidade

- **Feed**: posts de quem você segue (receitas, conquistas, fotos opt-in), like/comentar/salvar
- **Perfil de criador**: foto, bio, seguidores, receitas públicas em grid, botão seguir
- **Busca de criadores/nutricionistas**: filtro por especialidade, selo verificado
- **Compartilhar**: card visual bonito para Stories

---

## 17. Modo Nutricionista (B2B2C)

- Toggle no perfil + validação CRN
- **Painel de clientes**: lista, busca, filtro por aderência, card com % adesão da semana
- **Detalhe do cliente**: diário, anel de macros, gráfico de peso, consistência, notas privadas, "Enviar receita" / "Ajustar meta", chat direto
- **Convidar cliente**: link/código, cliente controla nível de acesso (só macros / diário / tudo)

---

## 18. Perfil "Eu" (Tab 5)

- Topo: avatar + nome + objetivo + editar + streak/badge
- Lista de acessos:
  - 📊 Progresso & Métricas
  - 🎯 Metas e Macros
  - 💪 Atividade Física
  - 🔔 Notificações
  - 🔗 Conectar Apps (Health/Fit/Strava)
  - 👨‍⚕️ Meu Nutricionista
  - 💎 Plano Premium
  - ⚙️ Configurações
  - ❓ Ajuda & Suporte
  - 📤 Convidar amigos
  - 🚪 Sair

---

## 19. Configurações

- **Conta**: e-mail, senha, telefone, deletar
- **Preferências**: idioma (pt/en/es), unidades (métrico/imperial), primeira refeição, número de refeições/dia (3-6, nomes custom), tema
- **Privacidade**: perfil público/privado, visibilidade receitas/progresso, exportar dados (LGPD JSON/CSV), deletar conta
- **Notificações**: lembretes refeição/água, resumo diário/semanal, conquistas, social, promoções
- **Integrações**: Apple Health, Google Fit, Strava, Garmin, Fitbit, Calendário
- **Assinatura**: plano atual, próxima cobrança, gerenciar, histórico, código promocional

---

## 20. Notificações Inbox

- Categorias: Sistema / Social / Conquistas / Nutri
- Item com ícone + título + descrição + tempo
- Toque vai pra tela relacionada, swipe marca lida/arquiva

---

## 21. Pesquisa Global

- Input com microfone
- Tabs: Tudo | Alimentos | Receitas | Pessoas | Coleções
- Buscas recentes + sugestões

---

## 22-23. Estados Vazios, Loading e Erro

- **Empty states ilustrados** para cada lista
- **Loading**: skeleton screens, spinners contextuais, Lottie em IA
- **Erro**: toast pequeno / tela cheia "Tentar novamente"
- **Offline**: banner topo, cache de favoritos + diário do dia

---

## 24. Conversão & Engajamento

- **Paywall contextual** em: 4ª foto IA do dia, importar link, planejador, chat IA
- **Conquistas**: modal com confete + compartilhar
- **NPS / review** após 14 dias ativos
- **Referral**: convide amigos = 1 mês Premium

---

## 25. Widgets & Extensões

- **Widgets iOS/Android**: pequeno (anel kcal), médio (anel + macros), grande (anel + macros + próxima refeição)
- **Share Extension**: "Compartilhar para Nutri Lu" em qualquer link/foto → vira receita
- **Apple Watch / Wear OS**: kcal restantes, +1 água, refeição rápida
- **Siri / Google Assistant**: comandos por voz

---

## 26. Acessibilidade

- VoiceOver / TalkBack em todas as telas
- Fontes dinâmicas
- Contraste WCAG AA
- Toque mínimo 44×44pt
- Labels descritivas
- Modo daltônico (paleta alternativa para macros)

---

## 27. Lista Resumida de Telas (~75 únicas — Versão Final)

**Auth & Onboarding** (15): Splash, Welcome, Sign up/in, Recuperar, Onboarding 1-12, Loading, Plano pronto, 3 permissões, Paywall.

**Tab Início** (5): Dashboard, Detalhe macros, Detalhe água, Insights, Notificações inbox.

**Tab Diário** (8): Diário, Adicionar alimento (modal 6 tabs), Detalhe alimento, Quick add, Criar custom, Barcode, Exercício, Nota.

**Câmera IA** (4): Câmera, Loading, Resultado, Voz/texto.

**Tab Receitas** (12): Minhas, Descobrir, Coleções, Detalhe coleção, Despensa, Detalhe receita, Modo cozinhar, Seleção método criar, Import link, Import foto, Import vídeo, Editor.

**Planejador & Compras** (4): Planejador, Lista, Modo mercado, Compartilhar.

**Progresso** (7): Peso, Medidas, Fotos, Macros, Hábitos, Registrar (modais), Relatório.

**Chat IA** (1): Conversa Lu.

**Social** (5): Feed, Perfil criador, Busca, Comentários, Compartilhar card.

**Nutricionista** (4): Painel, Detalhe cliente, Chat cliente, Convidar.

**Tab Eu** (3): Perfil, Editar perfil, Convidar amigos.

**Configurações** (8): Menu, Conta, Preferências, Privacidade, Notificações, Integrações, Assinatura, Ajuda.

**Outros** (3): Busca global, Conquista modal, Erro/offline.

**Total Versão Final: ~75 telas únicas**.

---

## 28. Notas para o Designer / Ferramenta de UI

- **Priorize o fluxo "registrar refeição"** — 4-6×/dia, precisa ser rápido e prazeroso (<5s)
- **FAB central de câmera** é a identidade do produto — pulsa levemente em idle
- Telas longas com **scroll header parallax** + bottom action sticky
- Animações de **enchimento dos anéis** geram dopamina (estilo Apple Activity Rings)
- Considerar **modo lite** para devices low-end
- **IA visual**: nunca mentir — baixa confiança sempre oferece "ajustar"
- Toda lista: pull-to-refresh + skeleton + empty state ilustrado
- **Premium**: badge sutil em features bloqueadas, não pop-ups agressivos

---

## 29. Diferenças entre MVP e Versão Final

| Feature | MVP | Final |
|---|:---:|:---:|
| Diário de macros + Foto IA + Voz + Barcode | ✅ | ✅ |
| Receitas (criar/importar link/foto/vídeo) | ✅ | ✅ |
| Planejador semanal + Lista de compras + Despensa | ✅ | ✅ |
| Progresso (peso/medidas/fotos/macros/hábitos) | ✅ | ✅ |
| Chat IA Lu | ✅ | ✅ |
| Widgets, Watch, Siri | ✅ | ✅ |
| Card de Atividade Física no Dashboard | ❌ | ✅ |
| Card de Exercícios no Diário | ❌ | ✅ |
| Menu Perfil — Atividade Física | ❌ | ✅ |
| Menu Perfil — Conectar Apps (Health/Fit) | ❌ | ✅ |
| Menu Perfil — Meu Nutricionista | ❌ | ✅ |
| Integrações em Configurações (Health/Fit/Strava/Garmin/Fitbit/Calendar) | ❌ | ✅ |
| Permissão de Health no onboarding | ❌ | ✅ |
| Visibilidade de receita (Privada/Amigos/Pública) | só Privada | 3 opções |
| Lista de compras colaborativa multi-usuário | ❌ (só share one-way) | ✅ |
| Aba "De nutricionistas que você segue" em Descobrir | ❌ | ✅ |
| Social: Feed, Perfil criador, Comentários | ❌ | ✅ |
| Modo Nutricionista (B2B2C) | ❌ | ✅ |
| Tab "Pessoas" na Busca Global | ❌ | ✅ |
| Categoria "Social" em Notificações | ❌ | ✅ |
| Configurações de privacidade (perfil público) | ❌ | ✅ |
| Total estimado de telas | ~67 | ~75 |
