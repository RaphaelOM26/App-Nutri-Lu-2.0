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
    required: ['title', 'ingredients', 'steps', 'time', 'servings', 'confidence'],
    properties: {
      title: {
        type: 'string',
        description: 'Nome da receita em português brasileiro.',
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
- Sempre responda em português brasileiro.
- Mantenha unidades de medida brasileiras (g, ml, xícara, colher de sopa, colher de chá, unidade).
- Se algum campo não estiver claro, infira de forma razoável e marque confidence como "medium" ou "low".
- Se não conseguir identificar uma receita válida, retorne título "Receita não identificada", arrays vazios e confidence "low".
- NÃO invente ingredientes ou passos que não estão na fonte. Prefira deixar incompleto a alucinar.`;

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
