// Cliente OpenAI compartilhado e helpers de prompts/schemas.

import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';

// ─── JSON Schema da receita extraída ─────────────────────────────
// Usado tanto pra image extraction quanto pra link extraction.
// `strict: true` força o modelo a respeitar o schema exatamente.
export const RECIPE_SCHEMA = {
  name: 'recipe_extraction',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'ingredients', 'steps', 'time', 'servings', 'confidence', 'imageQuery', 'mealCategory'],
    properties: {
      title: {
        type: 'string',
        description: 'Nome da receita em português brasileiro.',
      },
      imageQuery: {
        type: 'string',
        description: 'Query EM INGLÊS pra buscar uma foto representativa no Unsplash. Foque no TIPO de prato (cake, pie, salad, soup, smoothie, bread, etc.), ingrediente principal e estilo "food photography rustic". 2-5 palavras-chave separadas por vírgula. Exemplo: "chickpea pie,no flour,rustic" pra "Torta de grão-de-bico sem farinha".',
      },
      ingredients: {
        type: 'array',
        description: 'Lista de ingredientes com quantidade, unidade e nome.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['quantity', 'unit', 'name'],
          properties: {
            quantity: {
              type: 'string',
              description: 'Quantidade numérica como string (ex: "2", "1/2", "a gosto").',
            },
            unit: {
              type: 'string',
              description: 'Unidade de medida (ex: "g", "ml", "xícara", "colher de sopa", "unidade", "").',
            },
            name: {
              type: 'string',
              description: 'Nome do ingrediente em português brasileiro.',
            },
          },
        },
      },
      steps: {
        type: 'array',
        description: 'Modo de preparo em passos numerados.',
        items: {
          type: 'string',
          description: 'Um passo completo do modo de preparo.',
        },
      },
      time: {
        type: 'string',
        description: 'Tempo total de preparo no formato livre (ex: "25min", "1h30min"). Use "" se não souber.',
      },
      servings: {
        type: 'integer',
        description: 'Número de porções que a receita rende. CRÍTICO pra cálculo de macros: nunca marque 1 se o volume claramente serve mais. Calibração: 500g de pasta seca + 400g de proteína = 4 porções; 250g de pasta + 200g de proteína = 2 porções; salada com 1 alface + verduras = 1-2 porções; bolo com 500g de farinha = 8-12 porções. Receita brasileira sem indicação explícita: padrão de família = 4 pessoas. Erre pra MAIS porções, não pra menos. Use 0 só se realmente não der pra inferir nada.',
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low'],
        description: 'Confiança da extração: high = todos os campos legíveis, medium = alguns campos inferidos, low = muita inferência.',
      },
      mealCategory: {
        type: 'string',
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'unknown'],
        description: 'Categoria de refeição mais provável da receita. breakfast = café da manhã (tapioca, omelete, panqueca, mingau, smoothie, vitamina, granola); lunch = almoço (prato principal robusto: massas, risoto, frango assado, carne, peixe, prato com arroz/feijão); dinner = jantar (prato principal mais leve OU sopa/caldo OU receita explicitamente noturna); snack = lanche (sanduíche, wrap, tosta, salgadinho, petisco entre refeições); dessert = sobremesa (bolo, pudim, brownie, mousse, sorvete, doce). Use "unknown" se realmente não der pra inferir com segurança — ex: receita ambígua que cabe em 3+ categorias.',
      },
    },
  },
};

// ─── JSON Schema da análise de prato (Foto IA de comida) ─────────
export const FOOD_ANALYSIS_SCHEMA = {
  name: 'food_analysis',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['scale_reference', 'items', 'total', 'confidence'],
    properties: {
      // Força o modelo a ancorar a escala ANTES de estimar gramas — o maior
      // ganho de precisão (o erro histórico é subestimar porção por falta disso).
      scale_reference: {
        type: 'string',
        description:
          'Referências de tamanho visíveis na foto usadas pra calibrar a escala (prato, talher, mão, copo, embalagem com rótulo). Ex: "prato raso ~26cm; garfo ~20cm ao lado". Se não houver nenhuma referência confiável, diga isso explicitamente.',
      },
      items: {
        type: 'array',
        description: 'Itens de comida identificados no prato.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'size_estimate', 'unit_count', 'portion_grams', 'kcal', 'protein_g', 'carbs_g', 'fat_g'],
          properties: {
            name: { type: 'string', description: 'Nome do alimento em PT-BR.' },
            size_estimate: {
              type: 'string',
              description:
                'Tamanho físico estimado ANTES das gramas, comparando com a scale_reference. Pense no VOLUME, não só na área 2D. Ex: "monte de arroz do tamanho de um punho", "filé cobrindo 1/3 do prato ~ palma da mão".',
            },
            unit_count: {
              type: ['number', 'null'],
              description:
                'Número de unidades quando o alimento é contável (ovos, cebolas, frutas, fatias de pão, filés, bolinhos). null se não aplicável. Quando contável, estime as gramas a partir de unidades × peso típico.',
            },
            portion_grams: { type: 'number', description: 'Porção estimada em gramas (derivada do size_estimate / unit_count).' },
            kcal: { type: 'number', description: 'Calorias = valor por 100g × (portion_grams / 100).' },
            protein_g: { type: 'number', description: 'Proteína em gramas.' },
            carbs_g: { type: 'number', description: 'Carboidrato em gramas.' },
            fat_g: { type: 'number', description: 'Gordura em gramas.' },
          },
        },
      },
      total: {
        type: 'object',
        additionalProperties: false,
        required: ['kcal', 'protein_g', 'carbs_g', 'fat_g'],
        properties: {
          kcal: { type: 'number' },
          protein_g: { type: 'number' },
          carbs_g: { type: 'number' },
          fat_g: { type: 'number' },
        },
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low'],
      },
    },
  },
};

// ─── System prompts ──────────────────────────────────────────────
export const RECIPE_SYSTEM_PROMPT = `Você é um assistente especialista em extração de receitas culinárias.

Sua tarefa é analisar uma receita (em foto, texto ou link) e retornar os dados estruturados em JSON conforme o schema fornecido.

Regras:
- Sempre responda em português brasileiro (exceto o campo imageQuery — esse é em inglês).
- Mantenha unidades de medida brasileiras (g, ml, xícara, colher de sopa, colher de chá, unidade).
- Se algum campo não estiver claro, infira de forma razoável e marque confidence como "medium" ou "low".
- Se não conseguir identificar uma receita válida, retorne título "Receita não identificada", arrays vazios e confidence "low" (mesmo nesse caso, imageQuery deve ter algo razoável tipo "food,recipe").
- NÃO invente ingredientes ou passos que não estão na fonte. Prefira deixar incompleto a alucinar.

Sobre imageQuery (importante):
- Sempre em INGLÊS, 2-5 palavras-chave separadas por vírgula.
- A PRIMEIRA palavra deve ser o TIPO de prato em inglês. Use o mapa abaixo; se não encontrar, INFIRA o termo correto em inglês baseado no que o prato é visualmente.

Mapa de tipos de prato (PT-BR → EN):

Pães, lanches e cafés da manhã:
- Pão / pão de queijo → "bread" / "cheese bread"
- Tapioca → "tapioca"
- Panqueca → "pancake"
- Crepe → "crepe"
- Waffle → "waffle"
- Omelete / frittata → "omelette" / "frittata"
- Cuscuz → "couscous"
- Mingau / aveia / overnight oats → "porridge" / "oatmeal"
- Granola / parfait → "granola" / "yogurt parfait"
- Sanduíche / wrap / tosta → "sandwich" / "wrap" / "toast"
- Hambúrguer → "burger"

Pratos principais brasileiros:
- Feijoada → "feijoada" (mantém)
- Moqueca → "moqueca" ou "brazilian fish stew"
- Estrogonofe / strogonoff → "stroganoff"
- Escondidinho → "shepherd's pie casserole"
- Picadinho / carne de panela → "braised beef"
- Quibe → "kibbeh"
- Esfiha → "sfiha" ou "flatbread"
- Coxinha → "coxinha brazilian"
- Pastel → "brazilian fried pastry"
- Empada / empadinha → "savory pie tartlet"
- Farofa → "farofa toasted cassava"
- Bobó de camarão → "shrimp cassava stew"
- Vatapá → "vatapá brazilian"
- Acarajé → "acarajé bean fritter"
- Pão de queijo → "brazilian cheese bread"

Pratos principais internacionais:
- Lasanha → "lasagna"
- Risoto → "risotto"
- Massa / macarrão / espaguete / penne / talharim → "pasta" / "spaghetti" / "penne" / "fettuccine"
- Nhoque → "gnocchi"
- Pizza → "pizza"
- Yakisoba / pad thai → "yakisoba" / "pad thai"
- Sushi / sashimi / temaki → "sushi" / "sashimi" / "sushi roll"
- Ramen / pho → "ramen" / "pho noodle soup"
- Curry → "curry"
- Tempura → "tempura"
- Taco / burrito / quesadilla / nachos → "taco" / "burrito" / "quesadilla" / "nachos"
- Frango xadrez → "kung pao chicken"

Saladas, sopas e bowls:
- Salada → "salad"
- Sopa / caldo → "soup" / "broth"
- Bowl / tigela / poke → "bowl" / "poke bowl"
- Açaí → "acai bowl"

Proteínas e churrasco:
- Frango grelhado / assado → "grilled chicken" / "roasted chicken"
- Peito de frango / coxa → "chicken breast" / "chicken thigh"
- Filé / bife / picanha → "steak" / "picanha"
- Carne assada → "roast beef"
- Costela → "ribs"
- Espetinho / churrasco → "skewer" / "barbecue"
- Salmão / atum / tilápia / peixe → "salmon" / "tuna" / "tilapia" / "fish"
- Camarão / lula / polvo → "shrimp" / "squid" / "octopus"

Acompanhamentos:
- Arroz / arroz integral → "rice" / "brown rice"
- Feijão → "beans"
- Purê → "mashed potato" (ou conforme o ingrediente)
- Polenta / pirão → "polenta" / "fish broth"
- Batata frita / assada → "fries" / "roasted potatoes"
- Legumes assados / refogados → "roasted vegetables" / "sauteed vegetables"

Sobremesas:
- Bolo → "cake" (cupcake → "cupcake")
- Torta doce → "pie" ou "tart"
- Cheesecake → "cheesecake"
- Brigadeiro → "brigadeiro" (mantém) ou "chocolate truffle"
- Beijinho → "coconut truffle"
- Pudim → "flan" ou "pudding"
- Mousse → "mousse"
- Brownie / cookie / biscoito → "brownie" / "cookie"
- Sorvete / picolé → "ice cream" / "popsicle"
- Doce de leite → "dulce de leche"
- Quindim / curau / canjica → "quindim" / "corn pudding" / "hominy pudding"
- Pavê → "layered dessert"
- Frutas → "fruit dessert"

Bebidas:
- Smoothie / vitamina / shake → "smoothie" / "shake"
- Suco / suco verde / detox → "juice" / "green juice" / "detox juice"
- Café / cappuccino / latte → "coffee" / "cappuccino" / "latte"
- Chá → "tea"
- Limonada → "lemonade"
- Drink / coquetel → "cocktail"

Tortas e quiches salgadas:
- Torta salgada → "savory pie" ou "tart"
- Quiche → "quiche"
- Frittata → "frittata"

Se o prato não estiver na lista acima, INFIRA o termo em inglês mais visualmente representativo (ex: "Strogonoff de cogumelos" → "mushroom stroganoff"; "Pé de moleque" → "brazilian peanut brittle"; "Romeu e julieta" → "guava cheese dessert").

- A SEGUNDA palavra deve indicar o ingrediente principal (ex: "chickpea", "banana", "salmon", "chocolate").
- Termine com estilo visual: "rustic", "food photography", ou "homemade" pra forçar fotos boas.
- Exemplos completos:
  • "Torta de grão-de-bico sem farinha" → "pie,chickpea,no flour,rustic"
  • "Bolo de cenoura com chocolate" → "cake,carrot,chocolate,homemade"
  • "Smoothie verde detox" → "smoothie,green,detox,food photography"
  • "Salmão ao forno com legumes" → "salmon,roasted,vegetables,plate"
  • "Estrogonofe de frango" → "chicken stroganoff,creamy,rustic"
  • "Feijoada completa" → "feijoada,brazilian,black beans,rustic"
  • "Pudim de leite condensado" → "flan,caramel,brazilian,dessert"
  • "Tapioca com queijo" → "tapioca,cheese,brazilian,breakfast"
  • "Quiche de alho-poró" → "quiche,leek,rustic,homemade"
  • "Açaí na tigela" → "acai bowl,fruits,granola,food photography"`;

export const FOOD_SYSTEM_PROMPT = `Você é um nutricionista especialista em estimar PORÇÕES e macros a partir de fotos de pratos. O erro mais comum e mais grave NÃO é identificar o alimento — é errar a GRAMATURA. Seu foco nº 1 é acertar o tamanho da porção.

Siga SEMPRE este raciocínio, nesta ordem, ANTES de dar qualquer número:

1) ESCALA — preencha "scale_reference". Procure referências de tamanho, em ordem de confiança:
   • Prato raso ≈ 26 cm; prato fundo ≈ 22 cm; pires ≈ 15 cm.
   • Garfo/faca ≈ 20 cm; colher de sopa ≈ 18 cm.
   • Mão adulta ≈ 18 cm; punho fechado ≈ 1 xícara (≈ 200–250 ml de volume).
   • Copo americano ≈ 190 ml; lata ≈ 350 ml; embalagens com rótulo.
   Se NÃO houver referência confiável, diga isso e seja mais conservador (confidence no máximo "medium").

2) TAMANHO POR ITEM — em "size_estimate", descreva o tamanho físico de cada alimento comparando com a referência. Pense em VOLUME (altura/empilhamento), não só na área 2D do prato.

3) UNIDADES — se o alimento é contável (ovos, cebolas, frutas, fatias, filés, bolinhos), CONTE as unidades e preencha "unit_count". Calcule as gramas por unidades × peso típico, não por chute solto.

4) GRAMAS — converta o tamanho/volume em gramas usando a calibração abaixo. ATENÇÃO: o erro histórico é SUBESTIMAR porções grandes/densas. Na dúvida entre dois tamanhos, escolha o MAIOR.

5) MACROS — calcule a partir do valor por 100 g do alimento × (portion_grams / 100). Nunca invente macro sem passar pela gramatura.

CALIBRAÇÃO de pesos típicos (âncoras):
- Arroz cozido: 1 escumadeira ≈ 100 g; monte médio ≈ 150 g.
- Feijão: 1 concha ≈ 130 g (com caldo).
- Frango/carne grelhada: 1 filé do tamanho da palma ≈ 120–150 g.
- Ovo: 1 un ≈ 50 g. Cebola média ≈ 110 g. Batata média ≈ 130 g. Tomate médio ≈ 100 g.
- Macarrão cozido: prato cheio ≈ 200–250 g.
- Pão de forma: 1 fatia ≈ 25 g; pão francês ≈ 50 g.
- Salada de folhas: porção ≈ 40–60 g. Legumes cozidos: ≈ 80–100 g/porção.
- Fruta média (maçã, banana, laranja) ≈ 120–150 g.

Regras finais:
- Responda em português brasileiro.
- NÃO subestime. Confidence "high" só com referência de escala clara E alimentos bem visíveis.
- Se a foto não mostrar comida claramente, retorne items: [], total zerado e confidence "low".`;

// ─── Voz → Refeição ──────────────────────────────────────────────
// Usado pra transcrição de áudio (Whisper) + estruturação de refeição.

export const MEAL_VOICE_SCHEMA = {
  name: 'meal_from_voice',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['items', 'total', 'mealType', 'confidence'],
    properties: {
      items: {
        type: 'array',
        description: 'Itens de comida que o usuário mencionou.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'portion_grams', 'kcal', 'protein_g', 'carbs_g', 'fat_g'],
          properties: {
            name: { type: 'string', description: 'Nome do alimento em PT-BR.' },
            portion_grams: { type: 'number', description: 'Porção estimada em gramas (use o que o usuário falou ou estime).' },
            kcal: { type: 'number' },
            protein_g: { type: 'number' },
            carbs_g: { type: 'number' },
            fat_g: { type: 'number' },
          },
        },
      },
      total: {
        type: 'object',
        additionalProperties: false,
        required: ['kcal', 'protein_g', 'carbs_g', 'fat_g'],
        properties: {
          kcal: { type: 'number' },
          protein_g: { type: 'number' },
          carbs_g: { type: 'number' },
          fat_g: { type: 'number' },
        },
      },
      mealType: {
        type: ['string', 'null'],
        enum: ['breakfast', 'lunch', 'snack', 'dinner', null],
        description: 'Qual refeição o usuário pareceu mencionar (café/almoço/lanche/jantar). null se não disse.',
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low'],
      },
    },
  },
};

export const MEAL_VOICE_PROMPT = `Você é um assistente nutricional. O usuário acabou de falar (transcrição de áudio) o que comeu, e você precisa estruturar isso em itens de refeição com macros.

Regras:
- Sempre responda em português brasileiro.
- Para cada alimento mencionado, estime a porção em gramas (se o usuário falou "uma colher", "um pedaço", "um prato", converta pra gramas razoavelmente).
- Estime macros usando bom senso (valores típicos de tabela TACO/USDA pra alimentos brasileiros).
- Se o usuário disse claramente qual refeição (ex: "no café da manhã comi...", "almocei..."), preencha mealType. Senão deixe null.
- Se a transcrição não menciona nenhuma comida, retorne items: [], total zerado, mealType null e confidence "low".
- Seja conservador — não invente itens que o usuário não disse.

Exemplos:
- "Comi dois ovos mexidos e uma tapioca com queijo" → items: ovos mexidos (~100g), tapioca (~80g), queijo (~30g)
- "No almoço comi um prato de arroz com feijão, frango grelhado e salada" → mealType: 'lunch', items: arroz (~150g), feijão (~100g), frango (~120g), salada (~80g)
- "Tomei um suco de laranja" → items: suco de laranja (~250g/ml)`;
