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
    required: ['title', 'ingredients', 'steps', 'time', 'servings', 'confidence', 'imageQuery'],
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
        description: 'Número de porções que a receita rende. Use 0 se não souber.',
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low'],
        description: 'Confiança da extração: high = todos os campos legíveis, medium = alguns campos inferidos, low = muita inferência.',
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
    required: ['items', 'total', 'confidence'],
    properties: {
      items: {
        type: 'array',
        description: 'Itens de comida identificados no prato.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'portion_grams', 'kcal', 'protein_g', 'carbs_g', 'fat_g'],
          properties: {
            name: { type: 'string', description: 'Nome do alimento em PT-BR.' },
            portion_grams: { type: 'number', description: 'Porção estimada em gramas.' },
            kcal: { type: 'number', description: 'Calorias estimadas.' },
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

export const FOOD_SYSTEM_PROMPT = `Você é um assistente nutricional especialista em identificar alimentos a partir de fotos de pratos.

Sua tarefa é analisar a foto de um prato/refeição e retornar:
- Lista de cada item identificado, com porção estimada em gramas
- Macros aproximados (kcal, proteína, carboidrato, gordura) para cada item
- Total consolidado
- Nível de confiança da estimativa

Regras:
- Responda em português brasileiro.
- Seja conservador nas estimativas de porção.
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
