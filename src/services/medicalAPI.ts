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
// Internal mock data (English-first, international)
// ---------------------------------------------------------------------------

interface MockFoodData extends Omit<FoodAnalysisResult, 'id'> {}

const MOCK_FOODS: MockFoodData[] = [
  {
    name: 'Braised Pork Belly',
    nameEn: 'Braised Pork Belly',
    calories: 395,
    protein: 13.7,
    fat: 28.8,
    carbs: 8.2,
    sodium: 860,
    potassium: 320,
    phosphorus: 180,
    purines: 132,
    healthStatus: 'red',
    healthScore: 3.2,
    quantitySuggestion: 'small',
    reason: 'High in purines (132 mg/100g) which may spike uric acid levels. Excessive saturated fat can worsen cholesterol and cardiovascular health.',
    cookingAdvice: 'Blanch before braising to reduce purines. Reduce soy sauce to lower sodium. Pair with bitter melon or celery to support uric acid metabolism.',
    servingOptions: [25, 50, 75, 100],
    alternatives: ['Steamed Fish', 'Chicken Breast', 'Tofu'],
    alternativeDetails: [
      { name: 'Steamed Fish', nameEn: 'Steamed Fish', status: 'green', desc: 'Low-purine, high-protein — ideal for hyperuricemia' },
      { name: 'Chicken Breast', nameEn: 'Chicken Breast', status: 'green', desc: 'Lean protein with minimal purines and saturated fat' },
      { name: 'Tofu', nameEn: 'Tofu', status: 'yellow', desc: 'Plant-based protein; moderate purines — eat in moderation' },
    ],
    cookingTips: [
      'Blanch in boiling water first to remove excess purines',
      'Cut sodium by halving the soy sauce',
      'Add bitter melon or celery to support uric acid clearance',
    ],
  },
  {
    name: 'Stir-fried Broccoli',
    nameEn: 'Stir-fried Broccoli',
    calories: 55,
    protein: 4.2,
    fat: 2.1,
    carbs: 7.6,
    sodium: 45,
    potassium: 380,
    phosphorus: 70,
    purines: 25,
    healthStatus: 'green',
    healthScore: 9.1,
    quantitySuggestion: 'normal',
    reason: 'Excellent choice — low in calories and purines, rich in fiber and vitamin C. Supports immune function and gut health.',
    cookingAdvice: 'Flash-fry over high heat to preserve nutrients. Minimal salt needed — a squeeze of lemon adds brightness.',
    servingOptions: [100, 150, 200, 250],
    alternatives: ['Spinach', 'Kale', 'Bok Choy'],
    alternativeDetails: [
      { name: 'Spinach', nameEn: 'Spinach', status: 'green', desc: 'Rich in folate and iron; helps manage blood pressure' },
      { name: 'Kale', nameEn: 'Kale', status: 'green', desc: 'Dense in antioxidants and fiber' },
    ],
    cookingTips: [
      'High-heat flash fry preserves the most nutrients',
      'Use minimal oil and no added salt',
      'A pinch of garlic adds flavor without sodium',
    ],
  },
  {
    name: 'Kung Pao Chicken',
    nameEn: 'Kung Pao Chicken',
    calories: 280,
    protein: 22.4,
    fat: 15.3,
    carbs: 12.8,
    sodium: 720,
    potassium: 280,
    phosphorus: 150,
    purines: 80,
    healthStatus: 'yellow',
    healthScore: 5.8,
    quantitySuggestion: 'moderate',
    reason: 'Sodium is high at 720 mg per serving — a concern for hypertension. Moderate purines make it acceptable for gout in small amounts.',
    cookingAdvice: 'Reduce soy sauce and skip the added salt. Substitute chicken breast for thigh to lower fat content.',
    servingOptions: [50, 100, 150, 200],
    alternatives: ['Poached Chicken', 'Steamed Fish', 'Stir-fried Shrimp'],
    alternativeDetails: [
      { name: 'Poached Chicken', nameEn: 'Poached Chicken', status: 'green', desc: 'Low sodium and fat, high lean protein' },
      { name: 'Steamed Fish', nameEn: 'Steamed Fish', status: 'green', desc: 'Omega-3 rich, low in purines' },
      { name: 'Stir-fried Shrimp', nameEn: 'Stir-fried Shrimp', status: 'yellow', desc: 'Slightly elevated purines — keep portions modest' },
    ],
    cookingTips: [
      'Halve the soy sauce to significantly cut sodium',
      'Use chicken breast instead of thigh for less fat',
      'Reduce or omit peanuts to lower calorie density',
    ],
  },
  {
    name: 'Steamed White Rice',
    nameEn: 'Steamed White Rice',
    calories: 116,
    protein: 2.6,
    fat: 0.3,
    carbs: 25.6,
    sodium: 2,
    potassium: 30,
    phosphorus: 62,
    purines: 18,
    healthStatus: 'yellow',
    healthScore: 6.0,
    quantitySuggestion: 'moderate',
    reason: 'High glycemic index (GI ≈ 70) may cause rapid blood sugar spikes. Suitable in moderation for most people, but diabetics should watch portion sizes.',
    cookingAdvice: 'Mix with brown rice (1:1) to lower GI. Cooling and reheating increases resistant starch content.',
    servingOptions: [75, 100, 150, 200],
    alternatives: ['Brown Rice', 'Quinoa', 'Cauliflower Rice'],
    alternativeDetails: [
      { name: 'Brown Rice', nameEn: 'Brown Rice', status: 'green', desc: 'Lower GI, more fiber and micronutrients' },
      { name: 'Quinoa', nameEn: 'Quinoa', status: 'green', desc: 'Complete protein, low GI — excellent for diabetics' },
      { name: 'Cauliflower Rice', nameEn: 'Cauliflower Rice', status: 'green', desc: 'Very low carb — ideal for blood sugar control' },
    ],
    cookingTips: [
      'Blend 1:1 with brown rice to lower the glycemic load',
      'Cook ahead and refrigerate — reheating boosts resistant starch',
      'Keep portions to ¾ cup and load the rest of the plate with vegetables',
    ],
  },
  {
    name: 'Greek Salad',
    nameEn: 'Greek Salad',
    calories: 130,
    protein: 5.2,
    fat: 9.8,
    carbs: 7.4,
    sodium: 480,
    potassium: 350,
    phosphorus: 90,
    purines: 12,
    healthStatus: 'green',
    healthScore: 8.4,
    quantitySuggestion: 'normal',
    reason: 'Excellent for most chronic conditions — very low purines, moderate healthy fats from olive oil, and rich in antioxidants.',
    cookingAdvice: 'Use less feta to reduce sodium. Drizzle with extra virgin olive oil for anti-inflammatory benefits.',
    servingOptions: [150, 200, 250, 300],
    alternatives: ['Caesar Salad (no croutons)', 'Caprese Salad'],
    alternativeDetails: [
      { name: 'Caprese Salad', nameEn: 'Caprese Salad', status: 'green', desc: 'Fresh tomatoes and mozzarella — low purine, heart-healthy' },
    ],
    cookingTips: [
      'Reduce feta quantity to halve the sodium',
      'Extra virgin olive oil provides anti-inflammatory monounsaturated fats',
      'Add avocado for extra potassium and healthy fats',
    ],
  },
];

// ---------------------------------------------------------------------------
// Condition label map (English for international prompt)
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
  private readonly apiKey = 'sk-jzkqcfvzwlxteqxeibrzjvhmyxwzncijgplgghnwdajwlrxa';
  private readonly endpoint = 'https://api.siliconflow.cn/v1/chat/completions';
  private readonly model = 'Qwen/Qwen2.5-VL-7B-Instruct';
  private readonly mockMode = false;

  async analyzeFood(imageBase64: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    if (this.mockMode) return this.mockAnalyze(userProfile);
    try {
      return await this.realAnalyze(imageBase64, userProfile);
    } catch (err) {
      console.warn('[medicalAPI] Vision API failed, falling back to mock:', err);
      return this.mockAnalyze(userProfile);
    }
  }

  // ── Mock ─────────────────────────────────────────────────────────────────

  private async mockAnalyze(userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    await new Promise((r) => setTimeout(r, 1800));
    const food = MOCK_FOODS[Math.floor(Math.random() * MOCK_FOODS.length)];
    return {
      id: Math.random().toString(36).slice(2, 11),
      ...food,
      healthScore: this.scoreForProfile(food, userProfile),
    };
  }

  // ── Real API ──────────────────────────────────────────────────────────────

  private async realAnalyze(imageBase64: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    const prompt = this.buildPrompt(userProfile);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1200,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'You are a professional clinical nutritionist. Always respond with valid JSON only — no prose, no markdown, just the raw JSON object.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              { type: 'text', text: prompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`SiliconFlow API ${response.status}: ${body}`);
    }

    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? '{}';

    // Strip markdown code fences if model returns them despite instructions
    const jsonStr = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Last resort: extract first {...} block
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('No JSON found in model response');
      parsed = JSON.parse(m[0]);
    }

    return this.transform(parsed, userProfile);
  }

  // ── Prompt ────────────────────────────────────────────────────────────────

  private buildPrompt(profile: UserHealthProfile): string {
    const conditions =
      profile.conditions.length > 0
        ? profile.conditions.map((c) => CONDITION_LABELS[c] ?? c).join(', ')
        : 'no specific chronic conditions';

    return `Analyze the food in the image. The user has: ${conditions}.

Return ONLY a JSON object with exactly these fields (no extra text):
{
  "name": "food name in English",
  "nameEn": "food name in English",
  "calories": <number per 100g>,
  "protein": <grams per 100g>,
  "fat": <grams per 100g>,
  "carbs": <grams per 100g>,
  "sodium": <mg per 100g>,
  "potassium": <mg per 100g>,
  "phosphorus": <mg per 100g>,
  "purines": <mg per 100g>,
  "healthStatus": "green" | "yellow" | "red",
  "healthScore": <1–10 for this user's conditions>,
  "reason": "1–2 sentence explanation of health impact for this user",
  "cookingAdvice": "1–2 sentence cooking tip to make it healthier",
  "quantitySuggestion": "small" | "moderate" | "normal",
  "servingOptions": [<4 gram values, e.g. 50,100,150,200>],
  "cookingTips": ["tip 1", "tip 2", "tip 3"],
  "alternativeDetails": [
    {"name": "...", "nameEn": "...", "status": "green"|"yellow"|"red", "desc": "why it is a better choice"}
  ]
}`;
  }

  // ── Transform API response → FoodAnalysisResult ───────────────────────────

  private transform(p: any, profile: UserHealthProfile): FoodAnalysisResult {
    const id = Math.random().toString(36).slice(2, 11);
    return {
      id,
      name:              String(p.name ?? 'Unknown food'),
      nameEn:            String(p.nameEn ?? p.name ?? ''),
      calories:          Number(p.calories) || 0,
      protein:           Number(p.protein)  || 0,
      fat:               Number(p.fat)      || 0,
      carbs:             Number(p.carbs)    || 0,
      sodium:            Number(p.sodium)   || 0,
      potassium:         Number(p.potassium)|| 0,
      phosphorus:        Number(p.phosphorus)||0,
      purines:           Number(p.purines)  || 0,
      healthStatus:      (['green','yellow','red'].includes(p.healthStatus) ? p.healthStatus : 'yellow') as any,
      healthScore:       Math.min(10, Math.max(1, Number(p.healthScore) || 5)),
      reason:            String(p.reason ?? ''),
      cookingAdvice:     String(p.cookingAdvice ?? ''),
      quantitySuggestion:(['small','moderate','normal'].includes(p.quantitySuggestion) ? p.quantitySuggestion : 'moderate') as any,
      servingOptions:    Array.isArray(p.servingOptions) ? p.servingOptions.map(Number) : [50,100,150,200],
      cookingTips:       Array.isArray(p.cookingTips) ? p.cookingTips.map(String) : [],
      alternatives:      Array.isArray(p.alternativeDetails) ? p.alternativeDetails.map((a:any) => a.name) : [],
      alternativeDetails:Array.isArray(p.alternativeDetails) ? p.alternativeDetails.map((a:any) => ({
        name:   String(a.name ?? ''),
        nameEn: String(a.nameEn ?? a.name ?? ''),
        status: (['green','yellow','red'].includes(a.status) ? a.status : 'green') as any,
        desc:   String(a.desc ?? ''),
      })) : [],
    };
  }

  // ── Score calculator (used by mock) ───────────────────────────────────────

  private scoreForProfile(food: Pick<FoodItem,'purines'|'sodium'|'fat'|'potassium'|'phosphorus'|'carbs'|'calories'>, profile: UserHealthProfile): number {
    let score = 9;
    for (const c of profile.conditions) {
      switch (c) {
        case 'hyperuricemia':
          if (food.purines > 150) score -= 3;
          else if (food.purines > 75) score -= 1.5;
          else if (food.purines > 40) score -= 0.5;
          break;
        case 'hypertension':
          if (food.sodium > 800) score -= 2.5;
          else if (food.sodium > 400) score -= 1;
          break;
        case 'hyperlipidemia':
          if (food.fat > 25) score -= 2;
          else if (food.fat > 12) score -= 0.8;
          break;
        case 'kidneyIssues':
          if (food.potassium > 350) score -= 1;
          if (food.phosphorus > 180) score -= 1;
          break;
        case 'diabetes':
          if (food.carbs > 25) score -= 1.5;
          else if (food.carbs > 15) score -= 0.5;
          break;
        case 'obesity':
          if (food.calories > 350) score -= 1.5;
          else if (food.calories > 200) score -= 0.5;
          break;
      }
    }
    return Math.max(1, Math.min(10, Number(score.toFixed(1))));
  }
}

export const medicalAPIService = new MedicalAPIService();
