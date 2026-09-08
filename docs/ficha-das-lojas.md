# Ficha das lojas — texto pronto pra colar

Escrito em 08/09/2026. Serve pra App Store Connect e pro Google Play Console.
Tudo aqui é **copiar e colar**. Onde precisa de decisão sua, está marcado com 🔸.

As respostas de privacidade foram derivadas de `site/privacidade.html` — se um dia
aquela página mudar, esta ficha muda junto. Declarar na loja menos do que a
política diz é o tipo de divergência que a Apple encontra.

---

# 1. Identidade do app

| Campo | Valor |
|---|---|
| Nome | `Nutri Lu` |
| Subtítulo (30 caracteres) | `Seu diário com a nutri` |
| Bundle ID | `com.nutrilu.app` |
| SKU | `nutrilu-001` |
| Categoria principal | Saúde e Fitness |
| Categoria secundária | Culinária |
| Idioma principal | Português (Brasil) |
| Direitos autorais | `2026 LU ALVES SAUDE E EDUCACAO LTDA` |

🔸 O subtítulo tem 22 caracteres. Se quiser outro, o limite é 30 — conte antes.

---

# 2. Descrição (App Store e Play)

Cole exatamente isto no campo "Descrição". Está dentro dos 4.000 caracteres.

```
O Nutri Lu é o seu diário alimentar — completo, em português, e de graça.

REGISTRE DO SEU JEITO
Fotografe o prato e o app identifica os alimentos e estima as calorias e os
macronutrientes. Prefere falar? Descreva a refeição em voz alta e ela entra no
diário. Ou busque na tabela nutricional e ajuste a porção na mão.

O ACERVO DE RECEITAS
Mais de 400 receitas com foto, modo de preparo e informação nutricional
calculada porção por porção. Salve as suas favoritas, monte coleções e gere a
lista de compras da semana.

ACOMPANHE O QUE IMPORTA
Calorias, proteínas, carboidratos e gorduras do dia em anéis que você entende
de relance. Água, peso, histórico e a evolução ao longo das semanas.

CONVERSE
Tire dúvidas sobre alimentação a qualquer hora e receba um resumo do seu dia
com o que deu certo e o que dá pra ajustar.

COMUNIDADE
Publique suas próprias receitas, descubra o que outras pessoas estão cozinhando
e avalie o que você testou.

ACOMPANHAMENTO NUTRICIONAL
Quem contrata o acompanhamento da nutricionista Lu Alves recebe, dentro do
aplicativo, o plano alimentar elaborado e assinado por ela. O acompanhamento é
um serviço à parte, contratado fora do aplicativo. O aplicativo em si é gratuito
e continua completo para quem não contratar.

IMPORTANTE
As estimativas de calorias e macronutrientes calculadas pelo aplicativo são
referências aproximadas e não substituem consulta com nutricionista ou médico.
Prescrição de plano alimentar é ato privativo de nutricionista.
```

## Novidades desta versão (campo "O que há de novo")

```
Onboarding novo, com um questionário curto sobre a sua rotina alimentar.
Estimativa inicial de calorias e macros apresentada em faixa, do jeito certo:
é um ponto de partida, não uma prescrição.
Cálculo por Harris-Benedict, a fórmula que a nutricionista usa no consultório.
Mais de 400 receitas no acervo, todas com foto.
```

## Palavras-chave (App Store, 100 caracteres com vírgulas)

```
dieta,calorias,macros,nutricao,emagrecer,receitas,diario alimentar,nutricionista,peso,comida
```

São 99 caracteres. **Não repita** palavras que já estão no nome ou no subtítulo
— a Apple já indexa aquelas, e repetir só desperdiça o espaço.

## URLs

| Campo | Valor |
|---|---|
| URL de marketing | `https://nutrilualves.com.br` |
| URL de suporte | `https://nutrilualves.com.br/suporte.html` |
| URL da política de privacidade | `https://nutrilualves.com.br/privacidade.html` |

⚠️ As três precisam responder **antes** de você salvar a ficha. A Apple busca a
de privacidade automaticamente e reprova se der 404.

---

# 3. Classificação etária

Responda **12+**, e não 4+. O caminho:

| Pergunta do formulário | Resposta |
|---|---|
| Informações médicas ou de tratamento | **Pouco frequente/leve** |
| Todas as demais (violência, sexo, jogos, álcool, terror…) | Nenhuma |
| O app tem controles dos pais? | Não |
| O app é destinado a menores de 13 anos? | **Não** |

Por que não 4+: o app mostra meta calórica e faz estimativa nutricional. Isso é
"informação de tratamento" no vocabulário da Apple, e é como os concorrentes do
mesmo tipo estão classificados. Declarar 4+ e a Apple discordar custa uma
rodada de rejeição; declarar 12+ não custa nada.

---

# 4. Questionário de privacidade da App Store

Este é o formulário longo. Responda **exatamente** assim.

## Pergunta de entrada

> Você ou seus parceiros terceirizados coletam dados deste app?

**Sim.**

## Tipos de dados a marcar

Marque **só** estes seis. Todo o resto fica desmarcado.

| Tipo | Onde aparece no formulário | Uso | Vinculado à identidade? | Rastreamento? |
|---|---|---|---|---|
| **E-mail** | Informações de contato | Funcionalidade do app | **Sim** | Não |
| **Nome** | Informações de contato | Funcionalidade do app | **Sim** | Não |
| **Saúde** | Saúde e fitness | Funcionalidade do app | **Sim** | Não |
| **Fotos ou vídeos** | Conteúdo do usuário | Funcionalidade do app | **Sim** | Não |
| **Áudio** | Conteúdo do usuário | Funcionalidade do app | **Sim** | Não |
| **Outro conteúdo do usuário** | Conteúdo do usuário | Funcionalidade do app | **Sim** | Não |
| **ID do usuário** | Identificadores | Funcionalidade do app | **Sim** | Não |
| **ID do dispositivo** | Identificadores | Funcionalidade do app | **Sim** | Não |
| **Interação com o produto** | Dados de uso | Análises | **Não** | Não |

Em **todas** as linhas, a resposta de "Usado para rastrear você" é **Não** — o
app não tem rede de anúncios, não vende dado e não compartilha com corretor de
dados. É isso que dispensa o app de pedir permissão de rastreamento.

## Por que cada uma está assim

- **Saúde**: o diário alimentar é dado de saúde no vocabulário da Apple. Ele
  sobe pro nosso servidor (nome do alimento, porção, macros, água) — está escrito
  na política de privacidade. Não declarar seria divergir da própria política.
- **Fotos, áudio, conteúdo**: a foto do prato e o áudio vão pra OpenAI pra serem
  interpretados. Saem do aparelho, então contam como coletados, mesmo que a
  gente não guarde. O chat e as receitas publicadas são "outro conteúdo".
- **Vinculado = Sim**: o diário anda com um identificador aleatório do aparelho,
  mas quem faz login com Apple ou Google passa a ter esse identificador
  relacionável à conta. Declarar "não vinculado" seria verdade só pra parte das
  pessoas, e a Apple trata isso como declaração incorreta.
- **Interação com o produto / Análises**: é a telemetria — qual recurso de IA
  rodou, qual modelo, quanto custou. Nunca o conteúdo. Essa é a única que não
  se liga a ninguém.

---

# 5. Notas para a Análise da Apple (campo "Notas")

Este campo é o que evita a rejeição por "funcionalidade incompleta". Cole:

```
Aplicativo em português do Brasil.

O aplicativo é gratuito e não possui compras dentro dele. Todos os recursos
listados na descrição funcionam sem conta e sem pagamento: diário alimentar,
busca em tabela nutricional, acervo de mais de 400 receitas, registro por foto,
registro por voz e assistente de conversa. Para testar, basta abrir e concluir
o questionário inicial.

O login (Apple ou Google) é opcional. Ele é exigido apenas para publicar
receitas na comunidade e para vincular um acompanhamento nutricional
contratado. Sign in with Apple está implementado, e a exclusão de conta está
disponível em Perfil > Conta da comunidade > Excluir minha conta.

Sobre o acompanhamento nutricional: é um serviço de consultoria prestado por
nutricionista, contratado e pago FORA do aplicativo, e consumido também fora
dele (a profissional elabora e assina o plano alimentar). O aplicativo apenas
exibe o resultado desse serviço para quem o contratou. Não há venda de conteúdo
digital nem desbloqueio de funcionalidade do aplicativo mediante pagamento.

CONTA DE TESTE COM ACOMPANHAMENTO ATIVO
Para ver a área de acompanhamento, use o código de acesso abaixo em
Perfil > Tenho um código de acesso:

  Código: <COLE AQUI O CODIGO>

Os recursos de inteligência artificial (foto, voz, conversa) possuem limite
diário de uso para conter custo de infraestrutura. O limite é generoso e não
restringe o uso normal.
```

🔸 O código de acesso eu gero pra você — é um comando só. Peça quando chegar
nesta etapa, porque ele tem validade e não faz sentido gerar antes.

---

# 6. Google Play — Segurança dos Dados

O formulário do Google é diferente do da Apple: ele pergunta por **coletado** e
**compartilhado** separadamente. Responda:

| Tipo de dado | Coletado | Compartilhado | Obrigatório? | Finalidade |
|---|---|---|---|---|
| Nome | Sim | Não | Opcional | Funcionalidade do app |
| Endereço de e-mail | Sim | Não | Opcional | Funcionalidade do app |
| IDs do usuário | Sim | Não | Obrigatório | Funcionalidade do app |
| Informações de saúde | Sim | **Sim** | Obrigatório | Funcionalidade do app |
| Fotos | Sim | **Sim** | Opcional | Funcionalidade do app |
| Gravações de áudio | Sim | **Sim** | Opcional | Funcionalidade do app |
| Outro conteúdo gerado pelo usuário | Sim | **Sim** | Opcional | Funcionalidade do app |
| Interações no app | Sim | Não | Obrigatório | Análises |

⚠️ **"Compartilhado = Sim"** nas quatro linhas de conteúdo porque foto, áudio,
chat e o resumo do dia vão para a OpenAI, que é terceiro. O Google define
compartilhamento como transferir pra outra empresa, mesmo sem retenção. Errar
aqui é motivo de suspensão da ficha, não de rejeição simples.

Nas perguntas finais:

- Dados são criptografados em trânsito: **Sim** (tudo é HTTPS).
- O usuário pode pedir a exclusão dos dados: **Sim** — e informe a URL
  `https://nutrilualves.com.br/suporte.html`, que explica o caminho dentro do
  app e dá o e-mail.

---

# 7. Screenshots — o que falta

A Apple exige, no mínimo, o conjunto do iPhone de 6,9 polegadas:
**1290 × 2796** ou **1320 × 2868** pixels, de 3 a 10 imagens, em PNG ou JPEG
sem transparência e sem cantos arredondados.

O Google Play exige de 2 a 8, entre 320 e 3840 px de lado, proporção máxima
de 2:1 — as mesmas imagens servem.

🔸 **Como conseguir sem iPhone:** tire as capturas no seu Android, na tela mais
alta que ele tiver, e me mande os arquivos. Eu redimensiono e completo as
bordas pro tamanho exato do iPhone. É o mesmo aplicativo e a mesma interface,
então as imagens mostram o produto real — que é o que a regra da Apple exige.

Sugestão das cinco telas, nesta ordem (a primeira é a que aparece na busca):

1. **Home** com os anéis preenchidos e o insight do dia
2. **Câmera** logo depois de analisar um prato, mostrando os itens identificados
3. **Acervo de receitas**, a grade com as fotos
4. **Diário** de um dia cheio
5. **Conversa** com uma pergunta e uma resposta

---

# 8. Ordem de preenchimento

A ficha destrava por partes. Nesta ordem você nunca fica bloqueado:

1. URLs (privacidade, suporte, marketing) — precisam estar no ar
2. Nome, subtítulo, categorias, direitos autorais
3. Descrição, novidades, palavras-chave
4. Classificação etária
5. Questionário de privacidade
6. Screenshots
7. Selecionar o build (só aparece depois que ele termina de processar na Apple,
   o que leva de 10 a 30 minutos depois do envio)
8. Notas da análise, com o código de acesso
9. Enviar para análise
