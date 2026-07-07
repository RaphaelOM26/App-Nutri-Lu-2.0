// Cliente HTTP do backend. Lê o host de `EXPO_PUBLIC_API_URL`
// (definido em mobile/.env OU em eas.json `env` por profile).
//
// Fallback: URL de produção no Railway. Isso garante que o APK funcione
// mesmo se o env var não tiver sido bundlado (caso clássico: .env é
// gitignored e EAS por default respeita .gitignore — o env precisa
// estar no eas.json pra ser bundlado em produção).
//
// Pra rodar local em dev (Expo Go), o mobile/.env aponta pro IP da
// máquina na rede local (localhost no celular = o próprio celular).

const PRODUCTION_API_URL = 'https://app-nutri-lu-20-production.up.railway.app';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;

export type Ingredient = {
  quantity: string;
  unit: string;
  name: string;
};

/** Categoria de refeição extraída pela IA. 'unknown' = IA não conseguiu inferir. */
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'unknown';

export type ExtractedRecipe = {
  title: string;
  ingredients: Ingredient[];
  steps: string[];
  time: string;
  servings: number;
  confidence: 'high' | 'medium' | 'low';
  /** Query em inglês pro Unsplash (ex: "pie,chickpea,rustic"). */
  imageQuery?: string;
  /** Categoria de refeição inferida pela IA. 'unknown' = sem confiança. */
  mealCategory?: MealCategory;
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
async function postJSON<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

/**
 * Gera uma foto de "food photography" da receita via IA.
 * Retorna a imagem como data URL (data:image/jpeg;base64,...) pronta pra
 * exibir e persistir. Cada chamada (inclusive "gerar novamente") gera uma
 * imagem nova — é uma chamada paga na OpenAI.
 */
export function generateRecipeImage(payload: {
  title: string;
  imageQuery?: string;
  ingredients?: string[];
}): Promise<{ image: string }> {
  return postJSON<{ image: string }>('/generate-recipe-image', payload);
}

// ─── Chat com a Lu ──────────────────────────────────────────────

export type ChatMessage = { role: 'lu' | 'user'; text: string };

export type InsightTone = 'good' | 'alert';

export type LuContext = {
  profile?: {
    name?: string;
    goal?: string;
    weightKg?: number;
    goalWeightKg?: number;
  };
  macros?: {
    kcal: { value: number; target: number };
    p: { value: number; target: number };
    c: { value: number; target: number };
    f: { value: number; target: number };
  };
  meals?: Array<{
    name: string;
    items: Array<{ name: string; portion: string; kcal: number }>;
  }>;
  water?: number; // copos de 250ml
  /** Quando 'alert', o backend gera uma mensagem de atenção (sem elogios). */
  tone?: InsightTone;
};

/**
 * Determina o tom do insight a partir dos macros do dia.
 * - alert: kcal estourou, OU 2+ macros estouraram, OU proteína passou de 130%.
 * - good: caso contrário.
 */
export function computeInsightTone(macros: LuContext['macros']): InsightTone {
  if (!macros) return 'good';
  const overK = macros.kcal.value > macros.kcal.target;
  const overP = macros.p.value > macros.p.target;
  const overC = macros.c.value > macros.c.target;
  const overF = macros.f.value > macros.f.target;
  const overCount = [overK, overP, overC, overF].filter(Boolean).length;
  if (overK) return 'alert';
  if (overCount >= 2) return 'alert';
  if (overP && macros.p.value > macros.p.target * 1.3) return 'alert';
  return 'good';
}

/** Envia mensagens à Lu e recebe a próxima resposta dela. */
export function chatWithLu(messages: ChatMessage[], context?: LuContext): Promise<{ reply: string }> {
  return postJSON<{ reply: string }>('/chat', { messages, context });
}

/** Gera o insight curto da Home (1-2 frases) com base no contexto do dia. */
export function generateInsight(context: LuContext): Promise<{ text: string; tone: InsightTone }> {
  return postJSON<{ text: string; tone: InsightTone }>('/insight', { context });
}

/** Análise detalhada de fim de dia (resumo + oportunidades + fechamento). */
export function generateDayReview(context: LuContext): Promise<{ text: string }> {
  return postJSON<{ text: string }>('/day-review', { context });
}

// ─── Voz → Refeição ─────────────────────────────────────────────

export type VoiceMealItem = {
  name: string;
  portion_grams: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type VoiceMealResponse = {
  transcript: string;
  items: VoiceMealItem[];
  total: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | null;
  confidence: 'high' | 'medium' | 'low';
};

/**
 * Transcreve áudio e estrutura como refeição.
 * @param audioBase64 áudio em base64 (com ou sem prefixo data:audio/...)
 * @param format extensão do áudio (default 'm4a' — gravação padrão do iOS/Android)
 */
export function transcribeMealAudio(
  audioBase64: string,
  format: string = 'm4a',
): Promise<VoiceMealResponse> {
  return postJSON<VoiceMealResponse>('/transcribe-meal', { audio: audioBase64, format });
}

// ─── Snapshot diário (histórico) ────────────────────────────────

export type DaySnapshotPayload = {
  meals: Array<{
    id: string;
    items: Array<{
      id: string;
      name: string;
      portion: string;
      kcal: number;
      p: number;
      c: number;
      f: number;
    }>;
  }>;
  macros: { kcal: number; p: number; c: number; f: number };
  water: number;
};

/** Upserta o snapshot do dia (device_id + date como PK). */
export async function saveDaySnapshot(
  deviceId: string,
  date: string,
  payload: DaySnapshotPayload,
): Promise<void> {
  await postJSON<{ ok: true }>('/day-snapshot', { device_id: deviceId, date, payload });
}

/** Busca o snapshot do dia. Retorna null se ainda não existe (404). */
export async function getDaySnapshot(
  deviceId: string,
  date: string,
): Promise<DaySnapshotPayload | null> {
  const url = `${BASE_URL}/day-snapshot?device_id=${encodeURIComponent(deviceId)}&date=${encodeURIComponent(date)}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(`Erro HTTP ${res.status}: ${text}`, res.status);
  }
  const data = await res.json();
  return data.payload as DaySnapshotPayload;
}

// ─── Auth social + Comunidade (feature #3) ──────────────────────

export type AuthUser = { id: string; displayName: string; email: string | null };

export type SocialProvider = 'apple' | 'google';

/**
 * Troca o identity token do provedor (Apple/Google) por uma sessão nossa.
 * displayName só é usado no PRIMEIRO login (a Apple manda o nome uma única vez).
 */
export function socialLogin(payload: {
  provider: SocialProvider;
  identityToken: string;
  displayName?: string;
  deviceId?: string;
}): Promise<{ token: string; user: AuthUser }> {
  return postJSON('/auth/social', {
    provider: payload.provider,
    identity_token: payload.identityToken,
    display_name: payload.displayName,
    device_id: payload.deviceId,
  });
}

/** Valida a sessão guardada e devolve o perfil. 401 = sessão expirou. */
export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError('Sessão expirada', res.status, 'AUTH_EXPIRED');
  const data = await res.json();
  return data.user as AuthUser;
}

/** Receita publicada na comunidade (shape do GET /community/recipes). */
export type CommunityRecipe = {
  id: string;
  title: string;
  /** A receita em si — mesmo shape da ExtractedRecipe (ingredientes, passos...). */
  payload: ExtractedRecipe & { sourceUrl?: string };
  imageDataUrl: string | null;
  sourceUrl: string | null;
  createdAt: string;
  authorName: string;
  isMine: boolean;
  avgStars: number | null;
  ratingCount: number;
  myStars: number | null;
};

/** Publica uma receita no feed da comunidade. Exige login. */
export function publishCommunityRecipe(
  token: string,
  payload: { title: string; recipe: ExtractedRecipe; imageDataUrl?: string; sourceUrl?: string },
): Promise<{ id: string }> {
  return postJSON(
    '/community/recipes',
    {
      title: payload.title,
      payload: payload.recipe,
      image_data_url: payload.imageDataUrl,
      source_url: payload.sourceUrl,
    },
    token,
  );
}

/** Feed paginado da comunidade. Token opcional (logado vê a própria avaliação). */
export async function fetchCommunityRecipes(opts: {
  limit?: number;
  offset?: number;
  sort?: 'recent' | 'top';
  token?: string;
}): Promise<{ items: CommunityRecipe[]; hasMore: boolean; nextOffset: number }> {
  const params = new URLSearchParams({
    limit: String(opts.limit ?? 20),
    offset: String(opts.offset ?? 0),
    sort: opts.sort ?? 'recent',
  });
  const res = await fetch(`${BASE_URL}/community/recipes?${params}`, {
    headers: opts.token ? { Authorization: `Bearer ${opts.token}` } : undefined,
  });
  if (!res.ok) throw new ApiError(`Erro ao carregar a comunidade`, res.status);
  return res.json();
}

/** Avalia (ou re-avalia) uma receita da comunidade com 1-5 estrelas. */
export function rateCommunityRecipe(
  token: string,
  recipeId: string,
  stars: number,
): Promise<{ avgStars: number; ratingCount: number; myStars: number }> {
  return postJSON(`/community/recipes/${recipeId}/rate`, { stars }, token);
}

/** Despublica uma receita própria (some do feed; avaliações preservadas). */
export async function unpublishCommunityRecipe(token: string, recipeId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/community/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError('Erro ao despublicar', res.status);
}

export { BASE_URL };
