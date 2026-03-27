import { FoodItem, HealthCondition, UserHealthProfile } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FoodAnalysisResult extends FoodItem {
  nameEn: string;
  reason: string;
  servingOptions: number[];
  alternativeDetails: {
    name: string;
    status: 'green' | 'yellow' | 'red';
    desc: string;
  }[];
}

interface MockFoodData {
  name: string;
  nameEn: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sodium: number;
  potassium: number;
  phosphorus: number;
  purines: number;
  healthStatus: 'green' | 'yellow' | 'red';
  quantitySuggestion: 'small' | 'moderate' | 'normal';
  reason: string;
  servingOptions: number[];
  alternatives: string[];
  alternativeDetails: { name: string; status: 'green' | 'yellow' | 'red'; desc: string }[];
  cookingTips: string[];
}

// ---------------------------------------------------------------------------
// Mock food database
// ---------------------------------------------------------------------------

const MOCK_FOODS: MockFoodData[] = [
  {
    name: '红烧肉',
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
    quantitySuggestion: 'small',
    reason: '嘌呤含量高（132mg/100g），对尿酸代谢影响大；脂肪含量高，不利于血脂控制',
    servingOptions: [25, 50, 75, 100],
    alternatives: ['清蒸鱼', '白切鸡', '豆腐'],
    alternativeDetails: [
      { name: '清蒸鱼', status: 'green', desc: '低嘌呤、高蛋白，适合尿酸高人群' },
      { name: '鸡胸肉', status: 'green', desc: '低脂低嘌呤，优质蛋白来源' },
      { name: '豆腐', status: 'yellow', desc: '植物蛋白，嘌呤中等，适量可食' },
    ],
    cookingTips: ['烹饪前先焯水可去除部分嘌呤', '减少酱油用量降低钠摄入', '搭配苦瓜或芹菜有助尿酸代谢'],
  },
  {
    name: '清炒西兰花',
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
    quantitySuggestion: 'normal',
    reason: '低热量、低嘌呤，富含膳食纤维和维生素 C，非常适合慢性病人群',
    servingOptions: [100, 150, 200, 250],
    alternatives: ['蒸西兰花', '西兰花炒虾仁'],
    alternativeDetails: [
      { name: '生菜沙拉', status: 'green', desc: '同样低嘌呤，生吃营养损失更少' },
      { name: '菠菜', status: 'green', desc: '富含叶酸，有助降低血压' },
    ],
    cookingTips: ['快炒保留更多营养素', '少盐少油，清淡更健康', '搭配蒜蓉提味无需加盐'],
  },
  {
    name: '宫保鸡丁',
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
    quantitySuggestion: 'moderate',
    reason: '钠含量偏高（720mg/份），对高血压人群需注意；嘌呤含量适中，尿酸高者少量可食',
    servingOptions: [50, 100, 150, 200],
    alternatives: ['白灼鸡胸肉', '清蒸鸡腿'],
    alternativeDetails: [
      { name: '白灼鸡胸肉', status: 'green', desc: '低脂低钠，蛋白质丰富' },
      { name: '蒸鱼', status: 'green', desc: '低热量优质蛋白' },
      { name: '清炒虾仁', status: 'yellow', desc: '嘌呤略高，适量可食' },
    ],
    cookingTips: ['减少辣椒和酱油用量', '用鸡胸肉替代鸡腿肉更低脂', '花生可少放或不放'],
  },
  {
    name: '白米饭',
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
    quantitySuggestion: 'moderate',
    reason: '血糖生成指数较高（GI≈70），糖尿病或血糖偏高人群建议控制份量',
    servingOptions: [75, 100, 150, 200],
    alternatives: ['糙米饭', '燕麦粥', '荞麦面'],
    alternativeDetails: [
      { name: '糙米饭', status: 'green', desc: 'GI 更低，膳食纤维更丰富' },
      { name: '燕麦粥', status: 'green', desc: '有助于控制血糖和血脂' },
      { name: '荞麦面', status: 'green', desc: '低 GI，适合糖尿病人群' },
    ],
    cookingTips: ['可混入糙米按 1:1 比例降低 GI', '冷却后复热可增加抗性淀粉', '减少每餐份量，搭配更多蔬菜'],
  },
];

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class MedicalAPIService {
  // Set to false and provide OPENAI_API_KEY to use real GPT-4o Vision.
  private readonly mockMode = true;

  async analyzeFood(imageBase64: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    if (this.mockMode) {
      return this.mockAnalyze(userProfile);
    }
    return this.realAnalyze(imageBase64, userProfile);
  }

  private async mockAnalyze(userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    await new Promise((r) => setTimeout(r, 1800));
    const food = MOCK_FOODS[Math.floor(Math.random() * MOCK_FOODS.length)];
    const healthScore = this.scoreForProfile(food, userProfile);
    return {
      id: Math.random().toString(36).slice(2, 11),
      ...food,
      healthScore,
    };
  }

  private async realAnalyze(imageBase64: string, userProfile: UserHealthProfile): Promise<FoodAnalysisResult> {
    const apiKey = process.env.OPENAI_API_KEY ?? '';
    const prompt = this.buildPrompt(userProfile);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'low' } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? '{}';

    // Extract JSON block from GPT response
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ?? text.match(/(\{[\s\S]*\})/);
    const parsed = JSON.parse(jsonMatch?.[1] ?? text);
    return this.transformGPTResponse(parsed, userProfile);
  }

  private buildPrompt(userProfile: UserHealthProfile): string {
    const conditionLabels: Record<string, string> = {
      hyperuricemia: '高尿酸血症（痛风）',
      hypertension: '高血压',
      diabetes: '糖尿病',
      hyperlipidemia: '高血脂',
      kidneyIssues: '肾脏问题',
      obesity: '肥胖/体重管理',
    };
    const conditions = userProfile.conditions.map((c) => conditionLabels[c] ?? c).join('、');

    return `你是一位专业营养师。请分析图片中的食物，并根据用户的健康状况给出专业建议。
用户患有：${conditions}

请以 JSON 格式回复（用 \`\`\`json 包裹），包含以下字段：
{
  "name": "食物名称（中文）",
  "nameEn": "Food name (English)",
  "calories": 卡路里(每100g, 数字),
  "protein": 蛋白质g,
  "fat": 脂肪g,
  "carbs": 碳水g,
  "sodium": 钠mg,
  "potassium": 钾mg,
  "phosphorus": 磷mg,
  "purines": 嘌呤mg,
  "healthStatus": "green" | "yellow" | "red",
  "healthScore": 1-10的数字,
  "reason": "对用户健康状况的主要影响说明（1-2句话）",
  "quantitySuggestion": "small" | "moderate" | "normal",
  "servingOptions": [建议份量数组, 4个数字, 单位g],
  "cookingTips": ["烹饪建议1", "烹饪建议2", "烹饪建议3"],
  "alternativeDetails": [
    {"name": "替代食物", "status": "green", "desc": "替代原因"}
  ]
}`;
  }

  private transformGPTResponse(parsed: any, userProfile: UserHealthProfile): FoodAnalysisResult {
    return {
      id: Math.random().toString(36).slice(2, 11),
      name: parsed.name ?? '未知食物',
      nameEn: parsed.nameEn ?? '',
      calories: Number(parsed.calories) || 0,
      protein: Number(parsed.protein) || 0,
      fat: Number(parsed.fat) || 0,
      carbs: Number(parsed.carbs) || 0,
      sodium: Number(parsed.sodium) || 0,
      potassium: Number(parsed.potassium) || 0,
      phosphorus: Number(parsed.phosphorus) || 0,
      purines: Number(parsed.purines) || 0,
      healthStatus: parsed.healthStatus ?? 'yellow',
      healthScore: Number(parsed.healthScore) || 5,
      reason: parsed.reason ?? '',
      quantitySuggestion: parsed.quantitySuggestion ?? 'moderate',
      servingOptions: parsed.servingOptions ?? [50, 100, 150, 200],
      alternatives: (parsed.alternativeDetails ?? []).map((a: any) => a.name),
      alternativeDetails: parsed.alternativeDetails ?? [],
      cookingTips: parsed.cookingTips ?? [],
    };
  }

  private scoreForProfile(food: MockFoodData, profile: UserHealthProfile): number {
    let score = 9;
    for (const condition of profile.conditions) {
      switch (condition) {
        case 'hyperuricemia':
          if (food.purines > 100) score -= 2.5;
          else if (food.purines > 50) score -= 1;
          break;
        case 'hypertension':
          if (food.sodium > 600) score -= 2;
          else if (food.sodium > 300) score -= 1;
          break;
        case 'hyperlipidemia':
          if (food.fat > 25) score -= 2;
          else if (food.fat > 12) score -= 0.5;
          break;
        case 'kidneyIssues':
          if (food.potassium > 300) score -= 1;
          if (food.phosphorus > 150) score -= 1;
          break;
        case 'diabetes':
          if (food.carbs > 20) score -= 1.5;
          break;
        case 'obesity':
          if (food.calories > 300) score -= 1;
          break;
      }
    }
    return Math.max(1, Math.min(10, Number(score.toFixed(1))));
  }
}

export const medicalAPIService = new MedicalAPIService();
