// Cliente HTTP do backend. Lê o host de `EXPO_PUBLIC_API_URL`
// (definido em .env do mobile) ou usa fallback localhost:3001.
//
// IMPORTANTE: pra rodar no celular físico via Expo Go, troque pelo IP da
// máquina na rede local (ex: http://192.168.0.10:3001). Localhost no
// celular aponta pro próprio celular, não pro seu computador.

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export type Ingredient = {
  quantity: string;
  unit: string;
  name: string;
};

export type ExtractedRecipe = {
  title: string;
  ingredients: Ingredient[];
  steps: string[];
  time: string;
  servings: number;
  confidence: 'high' | 'medium' | 'low';
};

export type FoodAnalysisItem = {
  name: string;
  portion_grams: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type FoodAnalysis = {
  items: FoodAnalysisItem[];
  total: {
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  confidence: 'high' | 'medium' | 'low';
};

export type ExtractSource = 'image' | 'url' | 'video';

// ─── Helpers ────────────────────────────────────────────────────
async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError(`Resposta inválida do servidor (HTTP ${res.status}).`, res.status);
  }
  if (!res.ok) {
    throw new ApiError(data?.error || `Erro HTTP ${res.status}`, res.status, data?.code);
  }
  return data as T;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Endpoints ──────────────────────────────────────────────────

/** Verifica que o backend está acessível. */
export async function checkHealth(): Promise<{ status: string; model: string }> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new ApiError(`Health check falhou`, res.status);
  return res.json();
}

/** Extrai receita a partir de base64 de imagem, URL ou (futuramente) vídeo. */
export function extractRecipe(
  source: ExtractSource,
  data: string,
): Promise<ExtractedRecipe> {
  return postJSON<ExtractedRecipe>('/extract-recipe', { source, data });
}

/** Analisa uma foto de prato e retorna macros estimados de cada item. */
export function analyzeFood(imageBase64: string): Promise<FoodAnalysis> {
  return postJSON<FoodAnalysis>('/analyze-food', { image: imageBase64 });
}

export { BASE_URL };
