import { UserHealthProfile } from '../types';
import { FoodItem } from '../types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface FoodAnalysisResult extends FoodItem {
  nameEn: string;
  reason: string;
  cookingAdvice: string;
  servingOptions: number[];
  alternativeDetails: {
    name: string;
    nameEn: string;
    status: 'green' | 'yellow' | 'red';
    desc: string;
  }[];
}

// ---------------------------------------------------------------------------
// Mock food database (used when API unavailable or in dev)
// ---------------------------------------------------------------------------

interface MockFoodData extends Omit<FoodAnalysisResult, 'id'> {}

const MOCK_FOODS: MockFoodData[] = [
  {
    name: 'Braised Pork Belly', nameEn: 'Braised Pork Belly',
    calories: 395, protein: 13.7, fat: 28.8, carbs: 8.2,
    sodium: 860, potassium: 320, phosphorus: 180, purines: 132,
    healthStatus: 'red', healthScore: 3.2, quantitySuggestion: 'small',
    reason: 'High in purines (132 mg/100g) which may spike uric acid levels. High saturated fat worsens cholesterol.',
    cookingAdvice: 'Blanch before braising to reduce purines. Halve the soy sauce to lower sodium.',
    servingOptions: [25, 50, 75, 100],
    alternatives: ['Steamed Fish', 'Chicken Breast', 'Tofu'],
    alternativeDetails: [
      { name: 'Steamed Fish',    nameEn: 'Steamed Fish',    status: 'green',  desc: 'Low-purine, high-protein — ideal for gout' },
      { name: 'Chicken Breast',  nameEn: 'Chicken Breast',  status: 'green',  desc: 'Lean protein, minimal purines and fat' },
      { name: 'Tofu',            nameEn: 'Tofu',            status: 'yellow', desc: 'Plant protein; moderate purines — eat in moderation' },
    ],
    cookingTips: [
      'Blanch first in boiling water to remove excess purines',
      'Use half the soy sauce to significantly lower sodium',
      'Pair with bitter melon or celery to support uric acid metabolism',
    ],
  },
  {
    name: 'Stir-fried Broccoli', nameEn: 'Stir-fried Broccoli',
    calories: 55, protein: 4.2, fat: 2.1, carbs: 7.6,
    sodium: 45, potassium: 380, phosphorus: 70, purines: 25,
    healthStatus: 'green', healthScore: 9.1, quantitySuggestion: 'normal',
    reason: 'Excellent — low in calories and purines, rich in fiber and vitamin C.',
    cookingAdvice: 'Flash-fry over high heat to preserve nutrients. No added salt needed.',
    servingOptions: [100, 150, 200, 250],
    alternatives: ['Spinach', 'Kale', 'Bok Choy'],
    alternativeDetails: [
      { name: 'Spinach', nameEn: 'Spinach', status: 'green', desc: 'Rich in folate and iron; helps manage blood pressure' },
      { name: 'Kale',    nameEn: 'Kale',    status: 'green', desc: 'Dense in antioxidants and fiber' },
    ],
    cookingTips: ['High-heat flash fry preserves most nutrients', 'Use minimal oil and no added salt', 'A pinch of garlic adds flavor without sodium'],
  },
  {
    name: 'Kung Pao Chicken', nameEn: 'Kung Pao Chicken',
    calories: 280, protein: 22.4, fat: 15.3, carbs: 12.8,
    sodium: 720, potassium: 280, phosphorus: 150, purines: 80,
    healthStatus: 'yellow', healthScore: 5.8, quantitySuggestion: 'moderate',
    reason: 'Sodium is high at 720 mg per serving — a concern for hypertension. Moderate purines are acceptable in small amounts.',
    cookingAdvice: 'Reduce soy sauce and skip extra salt. Use chicken breast for lower fat.',
    servingOptions: [50, 100, 150, 200],
    alternatives: ['Poached Chicken', 'Steamed Fish', 'Stir-fried Shrimp'],
    alternativeDetails: [
      { name: 'Poached Chicken',   nameEn: 'Poached Chicken',   status: 'green',  desc: 'Low sodium and fat, high lean protein' },
      { name: 'Steamed Fish',      nameEn: 'Steamed Fish',      status: 'green',  desc: 'Omega-3 rich, low in purines' },
      { name: 'Stir-fried Shrimp', nameEn: 'Stir-fried Shrimp', status: 'yellow', desc: 'Slightly elevated purines — keep portions modest' },
    ],
    cookingTips: ['Halve the soy sauce to significantly cut sodium', 'Use chicken breast instead of thigh', 'Reduce or omit peanuts to lower calories'],
  },
  {
    name: 'Steamed White Rice', nameEn: 'Steamed White Rice',
    calories: 116, protein: 2.6, fat: 0.3, carbs: 25.6,
    sodium: 2, potassium: 30, phosphorus: 62, purines: 18,
    healthStatus: 'yellow', healthScore: 6.0, quantitySuggestion: 'moderate',
    reason: 'High glycemic index (GI≈70) may cause blood sugar spikes. Fine in moderation.',
    cookingAdvice: 'Mix 1:1 with brown rice to lower GI. Cooling and reheating increases resistant starch.',
    servingOptions: [75, 100, 150, 200],
    alternatives: ['Brown Rice', 'Quinoa', 'Cauliflower Rice'],
    alternativeDetails: [
      { name: 'Brown Rice',       nameEn: 'Brown Rice',       status: 'green', desc: 'Lower GI, more fiber and micronutrients' },
      { name: 'Quinoa',           nameEn: 'Quinoa',           status: 'green', desc: 'Complete protein, low GI' },
      { name: 'Cauliflower Rice', nameEn: 'Cauliflower Rice', status: 'green', desc: 'Very low carb — ideal for blood sugar control' },
    ],
    cookingTips: ['Blend 1:1 with brown rice', 'Refrigerate and reheat to boost resistant starch', 'Keep to ¾ cup and fill the rest with vegetables'],
  },
  {
    name: 'Greek Salad', nameEn: 'Greek Salad',
    calories: 130, protein: 5.2, fat: 9.8, carbs: 7.4,
    sodium: 480, potassium: 350, phosphorus: 90, purines: 12,
    healthStatus: 'green', healthScore: 8.4, quantitySuggestion: 'normal',
    reason: 'Excellent — very low purines, healthy fats from olive oil, rich in antioxidants.',
    cookingAdvice: 'Use less feta to reduce sodium. Extra virgin olive oil adds anti-inflammatory benefits.',
    servingOptions: [150, 200, 250, 300],
    alternatives: ['Caprese Salad', 'Caesar Salad (no croutons)'],
    alternativeDetails: [
      { name: 'Caprese Salad', nameEn: 'Caprese Salad', status: 'green', desc: 'Low purine, heart-healthy' },
    ],
    cookingTips: ['Reduce feta to halve sodium', 'Use extra virgin olive oil', 'Add avocado for extra potassium'],
  },
];

// ---------------------------------------------------------------------------
// Rate limiter (client-side, prevents accidental spam)
// ---------------------------------------------------------------------------

class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs    = windowMs;
  }

  isAllowed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) return false;
    this.timestamps.push(now);
    return true;
  }

  msUntilNextAllowed(): number {
    if (this.timestamps.length < this.maxRequests) return 0;
    const oldest = this.timestamps[0];
    return this.windowMs - (Date.now() - oldest);
  }
}

// ---------------------------------------------------------------------------
// Condition labels (English for prompt)
// ---------------------------------------------------------------------------

const CONDITION_LABELS: Record<string, string> = {
  hyperuricemia:  'hyperuricemia / gout (high uric acid)',
  hypertension:   'hypertension (high blood pressure)',
  diabetes:       'diabetes / blood sugar management',
  hyperlipidemia: 'hyperlipidemia (high cholesterol / triglycerides)',
  kidneyIssues:   'chronic kidney disease',
  obesity:        'obesity / weight management',
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class MedicalAPIService {
  // API key loaded from environment variable (set via app.config.js / EAS secrets)
  // Falls back to empty string — in that case the app uses mock mode.
  private readonly apiKey: string = (process.env.SILICONFLOW_API_KEY ?? '').trim();
  private readonly endpoint = 'https://api.siliconflow.cn/v1/chat/completions';
  private readonly model    = 'Qwen/Qwen2.5-VL-7B-Instruct';

  private readonly rateLimiter = new RateLimiter(8, 60_000); // 8 calls/min

  get isMockMode(): boolean {
    return !this.apiKey;
  }

  async analyzeFood(imageBase64: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    // Input validation
    if (!imageBase64 || imageBase64.length < 100) {
      throw new Error('Invalid image data');
    }
    // Sanity-check base64 size (max ~5 MB image)
    const approxBytes = imageBase64.length * 0.75;
    if (approxBytes > 5 * 1024 * 1024) {
      throw new Error('Image too large. Please use a smaller photo.');
    }

    if (this.isMockMode) return this.mockAnalyze(userProfile);

    // Rate limit check
    if (!this.rateLimiter.isAllowed()) {
      const wait = Math.ceil(this.rateLimiter.msUntilNextAllowed() / 1000);
      throw new Error(`Too many requests. Please wait ${wait}s before scanning again.`);
    }

    try {
      return await this.realAnalyze(imageBase64, userProfile);
    } catch (err) {
      console.warn('[MedicalAPI] Vision API failed, using mock:', (err as Error).message);
      return this.mockAnalyze(userProfile);
    }
  }

  // ── Mock ──────────────────────────────────────────────────────────────────

  private async mockAnalyze(userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    await new Promise(r => setTimeout(r, 1800));
    const food = MOCK_FOODS[Math.floor(Math.random() * MOCK_FOODS.length)];
    return {
      id: Math.random().toString(36).slice(2, 11),
      ...food,
      healthScore: this.scoreForProfile(food, userProfile),
    };
  }

  // ── Real API ──────────────────────────────────────────────────────────────

  private async realAnalyze(imageBase64: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 30_000);

    let response: Response;
    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1200,
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: 'You are a clinical nutritionist. Respond with valid JSON only — no prose, no markdown code fences.',
            },
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
                { type: 'text', text: this.buildPrompt(userProfile) },
              ],
            },
          ],
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`API ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = await response.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? '{}';

    // Strip optional markdown fences
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('No valid JSON in model response');
      parsed = JSON.parse(m[0]);
    }

    // Validate critical fields exist
    if (!parsed.name || typeof parsed.calories !== 'number') {
      throw new Error('Incomplete response from model');
    }

    return this.transform(parsed, userProfile);
  }

  // ── Prompt ────────────────────────────────────────────────────────────────

  private buildPrompt(profile: UserHealthProfile): string {
    const conditions = profile.conditions.length > 0
      ? profile.conditions.map(c => CONDITION_LABELS[c] ?? c).join(', ')
      : 'no specific chronic conditions';

    return `Analyze the food in the image. The user has: ${conditions}.

Return ONLY a JSON object with these fields:
{
  "name": "food name in English",
  "nameEn": "food name in English",
  "calories": <number per 100g>,
  "protein": <grams>,
  "fat": <grams>,
  "carbs": <grams>,
  "sodium": <mg>,
  "potassium": <mg>,
  "phosphorus": <mg>,
  "purines": <mg>,
  "healthStatus": "green" | "yellow" | "red",
  "healthScore": <1-10 integer for this user>,
  "reason": "1-2 sentences on health impact for this user",
  "cookingAdvice": "1-2 sentence cooking tip to make it healthier",
  "quantitySuggestion": "small" | "moderate" | "normal",
  "servingOptions": [<4 gram values>],
  "cookingTips": ["tip1", "tip2", "tip3"],
  "alternativeDetails": [{"name":"...","nameEn":"...","status":"green"|"yellow"|"red","desc":"..."}]
}`;
  }

  // ── Transform ─────────────────────────────────────────────────────────────

  private transform(p: any, profile: UserHealthProfile): FoodAnalysisResult {
    const clamp = (v: any, min = 0, max = 9999) => Math.min(max, Math.max(min, Number(v) || 0));
    return {
      id:                 Math.random().toString(36).slice(2, 11),
      name:               String(p.name ?? 'Unknown food').slice(0, 100),
      nameEn:             String(p.nameEn ?? p.name ?? '').slice(0, 100),
      calories:           clamp(p.calories, 0, 2000),
      protein:            clamp(p.protein,  0, 200),
      fat:                clamp(p.fat,      0, 200),
      carbs:              clamp(p.carbs,    0, 500),
      sodium:             clamp(p.sodium,   0, 10000),
      potassium:          clamp(p.potassium,0, 10000),
      phosphorus:         clamp(p.phosphorus,0,5000),
      purines:            clamp(p.purines,  0, 2000),
      healthStatus:       (['green','yellow','red'].includes(p.healthStatus) ? p.healthStatus : 'yellow') as any,
      healthScore:        Math.min(10, Math.max(1, Math.round(Number(p.healthScore) || 5))),
      reason:             String(p.reason ?? '').slice(0, 500),
      cookingAdvice:      String(p.cookingAdvice ?? '').slice(0, 500),
      quantitySuggestion: (['small','moderate','normal'].includes(p.quantitySuggestion) ? p.quantitySuggestion : 'moderate') as any,
      servingOptions:     Array.isArray(p.servingOptions) ? p.servingOptions.slice(0,4).map(Number) : [50,100,150,200],
      cookingTips:        Array.isArray(p.cookingTips) ? p.cookingTips.slice(0,5).map((t:any) => String(t).slice(0,200)) : [],
      alternatives:       Array.isArray(p.alternativeDetails) ? p.alternativeDetails.slice(0,4).map((a:any) => String(a.name)) : [],
      alternativeDetails: Array.isArray(p.alternativeDetails) ? p.alternativeDetails.slice(0,4).map((a:any) => ({
        name:   String(a.name   ?? '').slice(0, 80),
        nameEn: String(a.nameEn ?? a.name ?? '').slice(0, 80),
        status: (['green','yellow','red'].includes(a.status) ? a.status : 'green') as any,
        desc:   String(a.desc   ?? '').slice(0, 200),
      })) : [],
    };
  }

  // ── Score (mock) ──────────────────────────────────────────────────────────

  private scoreForProfile(
    food: Pick<FoodItem,'purines'|'sodium'|'fat'|'potassium'|'phosphorus'|'carbs'|'calories'>,
    profile: UserHealthProfile
  ): number {
    let score = 9;
    for (const c of profile.conditions) {
      switch (c) {
        case 'hyperuricemia':
          if (food.purines > 150) score -= 3; else if (food.purines > 75) score -= 1.5; else if (food.purines > 40) score -= 0.5;
          break;
        case 'hypertension':
          if (food.sodium > 800) score -= 2.5; else if (food.sodium > 400) score -= 1;
          break;
        case 'hyperlipidemia':
          if (food.fat > 25) score -= 2; else if (food.fat > 12) score -= 0.8;
          break;
        case 'kidneyIssues':
          if (food.potassium > 350) score -= 1;
          if (food.phosphorus > 180) score -= 1;
          break;
        case 'diabetes':
          if (food.carbs > 25) score -= 1.5; else if (food.carbs > 15) score -= 0.5;
          break;
        case 'obesity':
          if (food.calories > 350) score -= 1.5; else if (food.calories > 200) score -= 0.5;
          break;
      }
    }
    return Math.max(1, Math.min(10, Number(score.toFixed(1))));
  }
}

export const medicalAPIService = new MedicalAPIService();
