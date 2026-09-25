# Bot de WhatsApp do Nutri Lu

Um número só (Cloud API da Meta, sem intermediário) atende todas as pacientes:
a **Luna** (IA), o registro de refeição por **foto e áudio**, os avisos da
**Nutri Luciana** e o **time de suporte**, que responde pelo painel.

Construído em 17/09/2026. Tudo abaixo roda hoje em **modo simulado** (sem
falar com a Meta) e está coberto por `backend/scripts/teste-whatsapp.mjs`.

## Como a paciente chega no WhatsApp

Dois caminhos, que convivem:

1. **Pela compra (automático).** A Hotmart manda o telefone do checkout junto
   com a compra aprovada. A compradora recebe o modelo `boas_vindas_luna` com o
   botão **Começar**; ao tocar, o número fica ligado à conta do e-mail da
   compra (a conta é criada se ela ainda não entrou na área de membros) e a
   Luna manda as boas-vindas e o primeiro passo (entrar e responder o
   questionário). O telefone do checkout **sozinho não vincula nada**: pode
   estar errado ou ser de quem pagou. É o toque no botão que vincula.
2. **Pelo código (manual).** Perfil → Vincular WhatsApp gera um código de 30
   minutos; ela manda pro número e pronto. É o plano B pra telefone errado no
   checkout, troca de celular ou compra feita por outra pessoa.

### Desligar ou trocar por uma ferramenta

As boas-vindas pela compra moram inteiras em
`backend/src/services/whatsapp/convites.js` e só rodam com
`WHATSAPP_BOAS_VINDAS=1`. Pra trocar por uma ferramenta externa: tirar a
variável no Railway (sem deploy) e apontar o webhook da Hotmart **também** pra
ferramenta (a Hotmart aceita várias URLs; o nosso continua liberando o acesso).
Atenção: um número da API só fica ligado a UM sistema. Ferramenta no MESMO
número tira a Luna do ar; o normal é a ferramenta usar outro número.

Na Hotmart: telefone **obrigatório** no checkout e a frase de consentimento na
página ("Ao comprar, você aceita receber no WhatsApp as orientações do seu
acompanhamento").

## O que a paciente faz por lá

| Ela manda | O que acontece | Custa IA? |
|---|---|---|
| Código de vínculo | O número fica ligado à conta; a Luna dá as boas-vindas | não |
| Foto | Pergunta "Refeição ou Evolução?" **antes de qualquer IA**. Refeição → IA → diário (com botões pra mudar de refeição ou apagar), porções em **medida caseira**; depois, se houver sinal, UMA pergunta de confirmação (ver "Confirmação da foto"). Evolução → guarda em Evolução, sem IA | só refeição |
| Áudio | Transcreve. Se descreve comida, registra; se é pergunta, segue como texto | sim |
| `macros` | Resumo do dia contra a meta | não |
| `o que como hoje` / `amanhã` | O plano do dia, com as trocas | não |
| `peso 72,4` | Registra o peso | não |
| `materiais` | Lista; PDF vai como arquivo, vídeo como link | não |
| `lista de compras` | A Luna pergunta o formato com 3 botões: **Marcar no celular** (link da página `/lista` da área de membros), **PDF pra imprimir** (arquivo anexado) e **Ver aqui no chat** (texto por seção, com "Ver por dia"). De sexta a domingo é a da semana que vem. O botão "Receber pela Luna" da tela Meu plano abre o WhatsApp com esse texto pré-digitado | não |
| `dúvida pra nutri` | A próxima mensagem vira pergunta na caixa da Luciana (mesma triagem da web) | não |
| Algo de saúde | Por **dicionário**, sem modelo: oferece mandar pra Nutri Luciana | não |
| `atendente` | A Luna se cala; a conversa vai pro painel de Atendimento | não |
| `meu nome é Mari` | Troca como a Luna a chama (grava `users.apelido`) | não |
| `PARAR` / `AVISOS` | Desliga / religa os avisos por modelo | não |
| Qualquer outra coisa | Luna, com o dia e o plano dela no contexto | sim |

Os tetos de IA são **os mesmos contadores da web** (30 fotos, 30 áudios, 60
mensagens por dia pra assinante): o teto é da conta, não do canal.

## Como a Luna chama a paciente

O nome vem de três fontes, nesta ordem (`src/utils/nomes.js`, usado também
pela web): **`users.apelido`** (o que ela escolheu) → **`users.display_name`**
(o nome da compra) → **nome do perfil do WhatsApp**. Sem nenhum, a frase sai
sem nome; a Luna nunca inventa "querida" nem "amiga".

O nome da compra é chute — vem `MARIA DA SILVA SANTOS`, vem o nome de quem
pagou. Por isso ele é tratado (primeiro nome, caixa arrumada) e, na primeira
mensagem, a Luna **pergunta com botão**: "posso te chamar de *Maria*?" ·
`Pode sim` / `Prefiro outro`. O "Pode sim" grava o apelido; o "Prefiro outro"
abre uma pergunta e a próxima mensagem vira o apelido. Se ela não responder,
segue o nome da compra: **a pergunta nunca segura o onboarding**. O
`display_name` nunca é sobrescrito — é por ele que a Luciana acha a paciente
no painel e que a gente bate com a Hotmart.

Dosagem (decidida em 21/09/2026): o nome entra na **primeira fala** de cada
conversa, em **elogio/incentivo** e em **notícia ruim** (limite batido, acesso
inativo). Confirmação curta de um toque ("Feito! Passei pra Almoço ✅") NÃO
leva nome: repetir em toda mensagem soa disparo automático, que é o que faz
gente denunciar o número. A regra está no `SYSTEM_PROMPT` da Luna, então vale
igual na web e aqui.

## Confirmação da foto (25/09/2026)

Medição de 25/09 (12 fotos pesadas, 2 rodadas): o modelo identifica bem
(93–95% dos itens) e erra a **quantidade** (erro por item de 24% no gpt-5.4,
41% no mini). A paciente não pesa comida, então a Luna **nunca pergunta em
gramas**. O registro nasce na hora, e o código (`services/whatsapp/confirmacao.js`)
decide se vale UMA pergunta:

| Sinal | Pergunta | Resposta vira |
|---|---|---|
| Item de um par que a foto confunde (abóbora × batata-doce, batata × mandioca, frango × carne desfiada) **e** confiança baixa, nome hesitante ("abóbora/batata-doce") ou o plano daquele horário tem o outro lado | "Isso é *abóbora* ou *batata-doce*?" (2 botões) | troca o ingrediente e recalcula pelas gramas (tabela por 100 g) |
| Refeição da foto difere >25% da refeição do **plano** naquele horário | "No plano, o almoço de hoje era X (520 kcal). Pela foto ficou abaixo. Se foi o do plano, me diz quanto:" (Menos / Igual / Mais que o plano) | igual → itens do plano; mais/menos → a foto, se ela já apontava pra esse lado; senão o plano × 1,25 / × 0,75 |
| Nenhum | nada (silêncio = está certo) | — |

- A porção sai como o modelo devolve em `medida_caseira` ("2 colheres de
  servir"); as gramas ficam em `grams`/`portion` pra área de membros.
- **Correção por texto** ("eram 3 colheres de arroz", "era batata-doce"): a
  conversa chama `corrigir_refeicao`, que age no último registro (até 8 h).
  Par conhecido recalcula pela tabela; o resto passa pela IA de texto do áudio.
- **Memória**: cada correção entra em `client_profiles.data.correcoes_foto`
  (até 20) e vira "Pistas da pessoa" nas próximas fotos dela, junto com a
  legenda da foto. Só comida; nunca dado clínico.
- A taxa de correção é a métrica de precisão real em produção: se cair com o
  tempo, a foto está melhorando sem ninguém pesar prato.

## Lista de compras

Uma lista só, montada no servidor (`services/plano/listaCompras.js` +
`ingredientes.js`) e usada pelos dois canais: a área de membros lê
`GET /me/lista-compras` e desenha; a Luna manda o mesmo conteúdo em texto.
Decisões do Raphael em 22/09/2026, depois de ver a saída real:

- **A · Seções do mercado**: Hortifruti · Açougue e peixaria · Ovos e
  laticínios · Mercearia · Despensa · Também no plano (item solto sem gramas).
- **B · Despensa sem gramas**: azeite, temperos, mel, cacau, chia, castanhas —
  "confere se tem", ninguém compra 6 g de azeite.
- **C · Grãos em peso cru**: o livro pesa cozido (macros); a compra é crua.
  Fator por dicionário (arroz e feijão ×0,4; macarrão ×0,45; cuscuz ×0,65;
  polenta ×0,25) — só quando o nome diz "cozido/hidratado/pronto".
- **D · Sinônimos e preparo por dicionário**: "Ovo"/"Ovos", "Aveia"/"Aveia em
  flocos", "Frango cozido e desfiado" → "Peito de frango". Nunca IA — o mesmo
  nome dá sempre o mesmo item, e alergia continua casando por texto. Nome
  fora do dicionário passa pelo genérico (tira preparo) e vai pra Mercearia:
  nunca some da lista. ⏳ Limpar a coluna de ingredientes da planilha PR é o
  complemento (fonte única).
- **E · Só geral e por dia**: "por refeição" saiu — era lista de preparo, e a
  tela Meu plano já mostra as refeições.
- **F · Unidade de compra + peso**: "Tomate — ~5 un (560 g)", "Iogurte
  proteico — 7 potes (1,05 kg · 150 g cada)", carnes em peso com a unidade
  de apoio ("400 g (~2 filés)"). Pesos médios por unidade (tabela de medidas
  caseiras IBGE/TACO) em `UNIDADES`; "~" avisa que é média.

Como chega até ela (decisão de 21/09): **nunca a empresa puxa** — sem modelo
de lista e sem envio de sexta. Ela pede (`lista de compras` ou o botão da
web, que abre o WhatsApp já com o texto) ou toca em "Mandar a lista" no
aviso de plano pronto. Tudo dentro da janela: R$ 0.

**A folha com a marca (22/09, exemplo aprovado pelo Raphael).** O mesmo
objeto (`dadosDaLista()`) vira três coisas:

- a página `/lista` da área de membros (papel cream, seções em colunas,
  carrinho pra marcar, "Imprimir" e "Baixar PDF");
- `GET /me/lista-compras.pdf` — o PDF desenhado no servidor
  (`services/plano/listaPdf.js`, pdfkit, fontes da marca via @fontsource, ~27 KB, ~230 ms);
- no WhatsApp, "lista de compras" (ou o botão "Mandar a lista" do aviso de
  plano pronto) faz a Luna **perguntar o formato**, com 3 botões:
  **Marcar no celular** (link de `/lista?ws=` na área de membros: toca no
  item, risca, fica salvo no celular), **PDF pra imprimir** (arquivo anexado)
  e **Ver aqui no chat** (texto por seção, com "Ver por dia"). O PDF é
  gravado no R2 em `<user>/listas/<semana>.pdf` (sobrescreve a mesma semana;
  10 mil pacientes × 4 semanas ≈ 1 GB) e a Meta baixa pela URL assinada. Se o
  PDF falhar ou não houver R2, vai o texto com um aviso — ela nunca fica sem
  lista. O PDF não é interativo (caixas desenhadas): a versão de marcar é a
  página.

## Login por link mágico (22/09)

Todo link da área de membros que a Luna manda pra uma paciente VINCULADA vai
"já logado": `services/loginPorLink.js` grava um token de uso único (hash
SHA-256, 10 minutos, amarrado ao `user_id`, destino relativo) e o link vira
`/membros/entrar?t=…&para=/lista?ws=…`. A página mostra "Você chegou pelo
link da Luna" e troca o token por sessão só depois do toque em **Entrar**
(`POST /auth/link`): prévia de link (GET) não consome o acesso. Vencido ou
usado → 410 e a tela cai no login por e-mail. Já logada → vai direto ao
destino sem gastar o token. O risco que sobra é o do próprio WhatsApp (celular
desbloqueado); por isso o número precisa estar vinculado (prova por código).
Usado em: primeiro passo pós-compra (`/comecar`), lista (`/lista`), plano
(`/plano`), materiais, perfil. A área de membros também é instalável
("Adicionar à tela inicial", `manifest.webmanifest` + ícones): abre pelo
ícone, já logada, e o WhatsApp vira atalho.

## Regras que o código garante

- **Anamnese clínica nunca é lida** pelo bot nem entra em prompt.
- **Foto de corpo nunca vai pra IA**: sem legenda clara, o bot pergunta antes.
- **Saúde não chega em modelo**: `services/triagem.js` (dicionário) decide.
- **Suporte não vê saúde**: mensagem marcada como saúde aparece oculta pra
  quem não é `nutri`; o papel `suporte` só vê a conversa durante o
  atendimento humano, nunca o que a paciente falou com a Luna.
- **O conteúdo só sai dentro da janela de 24 h.** Fora dela sai um modelo
  curto e genérico; a resposta da Luciana nunca viaja dentro de um modelo.
- **Um modelo por pessoa a cada 20 h**, no máximo.
- **Um convite por compra**, nunca reenviado. Se a Meta recusar por limite
  diário, o convite volta pra fila e tenta de hora em hora por até 3 dias.
- **Webhook só grava e responde 200**; IA e envio rodam no trabalhador da
  fila (`services/whatsapp/fila.js`), até 6 em paralelo.

## Conta em 10 mil pacientes

- Mensagens: ~6 por paciente por dia → ~60 mil webhooks/dia, ~120 mil linhas
  de histórico/dia (retenção de 90 dias, fora do backup diário).
- Pico do almoço: ~6 mil fotos em 2 h ≈ 0,8 foto/s × 8 s de IA ≈ 7 análises
  simultâneas. Cabe na concorrência padrão (6) com fila de segundos; subir
  `WHATSAPP_CONCORRENCIA` ou separar o trabalhador (`npm run worker` +
  `WHATSAPP_WORKER=0` no serviço web) quando o site começar a disputar CPU.
- Custo da Meta: responder quem escreveu é grátis. Modelos de utilidade
  ~R$ 0,05 (valor de guias de terceiros, confirmar na tabela oficial): plano
  pronto 1×/mês + ~2 respostas da Luciana/mês ≈ R$ 0,15/paciente/mês ≈
  **R$ 1.500/mês em 10 mil**, mais ~R$ 0,05 do convite por compra (~R$ 500 nos
  primeiros 10 mil). IA já está na planilha de custos (os mesmos
  tetos da web).
- Limite da Meta: o portfólio começa em 250 pessoas/dia pra mensagens
  iniciadas pela empresa; com a verificação do negócio, 2 mil; depois sobe
  sozinho. Só conta modelo fora da janela. **O convite da compra conta**: num
  lançamento com milhares de vendas no dia, sem a verificação do negócio os
  convites saem em fila de dias (o e-mail de acesso não depende disso).

## Ligar de verdade (passo a passo)

1. **Meta** (`developers.facebook.com` → app → WhatsApp → Configuração da API):
   anotar o *Phone Number ID* e o *WABA ID*; em Configurações do negócio →
   Usuários do sistema, criar um admin com as permissões
   `whatsapp_business_messaging` e `whatsapp_business_management` e gerar o
   **token permanente**. Em Configurações do app → Básico, copiar a **chave
   secreta do app**.
2. **Railway → Variables** (colar lá, nunca no chat nem no repositório):

   | Variável | O que é |
   |---|---|
   | `WHATSAPP_TOKEN` | token permanente do usuário do sistema |
   | `WHATSAPP_PHONE_ID` | Phone Number ID |
   | `WHATSAPP_WABA_ID` | id da conta do WhatsApp Business (informativo) |
   | `WHATSAPP_APP_SECRET` | chave secreta do app (valida a assinatura do webhook) |
   | `WHATSAPP_VERIFY_TOKEN` | um texto qualquer, inventado por nós |
   | `WHATSAPP_NUMERO` | o número público, só dígitos (`5521…`): vira o link `wa.me` |
   | `WHATSAPP_TEMPLATES` | modelos **já aprovados**, separados por vírgula |
   | `WHATSAPP_BOAS_VINDAS` | `1` liga o convite pela compra na Hotmart |
   | `MEMBROS_URL` | `https://nutrilualves.com.br/membros` |

   Opcionais: `WHATSAPP_CONCORRENCIA` (6), `WHATSAPP_RETENCAO_DIAS` (90),
   `WHATSAPP_WORKER` (`0` desliga o trabalhador neste serviço),
   `WHATSAPP_API_VERSION` (`v25.0`).
3. **Webhook** (app → WhatsApp → Configuração): URL
   `https://api.nutrilualves.com.br/whatsapp/webhook`, o
   mesmo `WHATSAPP_VERIFY_TOKEN`, e assinar o campo **`messages`**.
4. **Modelos** (WhatsApp Manager → Modelos de mensagem → Criar). Categoria
   **Utilidade**, idioma **Português (BR)**, corpo com 1 variável (exemplo:
   `Mariana`) e **um botão de resposta rápida**:

   | Nome | Corpo | Botão |
   |---|---|---|
   | `plano_pronto` | Oi, {{1}}! A Nutri Luciana terminou e publicou o seu plano alimentar. Toque no botão abaixo pra ver os detalhes aqui mesmo. | Ver meu plano |
   | `resposta_nutri` | Oi, {{1}}! A Nutri Luciana respondeu a dúvida que você enviou. Toque no botão abaixo pra ler a resposta. | Ver resposta |
   | `boas_vindas_luna` | Oi, {{1}}! Aqui é a Luna, assistente da Nutri Luciana. Sua compra do acompanhamento Nutri Lu foi confirmada. Toque no botão abaixo pra começar por aqui. | Começar |
   | `mensagem_equipe` | Oi, {{1}}! O time do Nutri Lu respondeu o seu atendimento. Toque no botão abaixo pra ler a mensagem. | Ver mensagem |

   (Não existe modelo de lista de compras — ver a seção "Lista de compras".)

   Só depois de aprovado o nome entra em `WHATSAPP_TEMPLATES`. Modelo fora da
   lista não é nem tentado (e o conteúdo chega quando a paciente escrever).

   Lições da Meta (21/09/2026): o `boas_vindas_luna` é categoria **Marketing**,
   não Utilidade — a Meta recategoriza boas-vindas pelo TIPO da mensagem, não
   pela redação, e o envio falha se a categoria não bater. Nome de modelo
   apagado fica **bloqueado 30 dias** (`boas_vindas` e `boas_vindas_v2`
   queimaram assim). Nome + idioma são chaves separadas: modelo criado em
   English não é achado pelo envio em `pt_BR` (erro 132001). Na UI nova o botão
   de resposta rápida chama-se **Personalizado**; não ligar o toggle de
   "validade personalizada" (expira a mensagem em 10 min).
5. **Time de suporte**: `node scripts/definir-papel.mjs --email ana@… --papel suporte`.
   A pessoa entra na área de membros com esse e-mail e cai direto em
   Painel → WhatsApp.

## Testar sem a Meta

```bash
node scripts/dev-local.mjs                  # servidor local, modo simulado
node scripts/teste-whatsapp.mjs             # 66 verificações, sem custo
node scripts/teste-whatsapp.mjs --ia        # 76 verificações: + foto real → IA → diário (~US$ 0,02)
node scripts/seed-whatsapp-demo.mjs         # conversas de mentira pra ver o painel
```

O servidor local **nunca** fala com a Meta, mesmo com o token no `.env`
(`WHATSAPP_REAL=1` libera, pra testar contra o número de teste de propósito).

## O que ficou pra depois

- **Lembretes** de refeição/água/peso (os botões já existem no Perfil).
- **Comunicado em lote** com tela no painel (hoje o "recado pra todas" chega
  no WhatsApp de cada uma quando ela escrever, sem disparo em massa).
- A Luna **sugerir receita** pelo WhatsApp (precisa do livro no servidor, com
  o filtro duro de restrição e alergia).
- Número de **venda** separado (outro portfólio), fora deste bot.
