import { FoodItem, HealthCondition, UserHealthProfile } from '../types';

interface MedicalAPIResponse {
  analysis: {
    foodName: string;
    nutrients: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      sodium: number;
      potassium: number;
      phosphorus: number;
      purines: number;
    };
    healthImpact: {
      condition: HealthCondition;
      impact: 'low' | 'medium' | 'high';
      explanation: string;
    }[];
    overallScore: number;
    healthStatus: 'green' | 'yellow' | 'red';
    quantitySuggestion: 'small' | 'moderate' | 'normal';
    alternatives: string[];
    cookingTips: string[];
  };
}

class MedicalAPIService {
  private isMockMode: boolean = true;

  async analyzeFood(
    imageBase64: string,
    userProfile: UserHealthProfile
  ): Promise<FoodItem> {
    if (this.isMockMode) {
      return this.mockAnalyzeFood(userProfile);
    }

    // 真实API调用（后续实现）
    const response = await fetch('https://api.medical-model.com/v1/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_MEDICAL_API_KEY`,
      },
      body: JSON.stringify({
        image: imageBase64,
        prompt: this.buildPrompt(userProfile),
        conditions: userProfile.conditions,
        currentMetrics: userProfile.currentMetrics,
      }),
    });

    if (!response.ok) {
      throw new Error('Medical API request failed');
    }

    const data: MedicalAPIResponse = await response.json();
    return this.transformResponse(data, userProfile);
  }

  private async mockAnalyzeFood(userProfile: UserHealthProfile): Promise<FoodItem> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模拟食物数据
    const mockFoods = [
      {
        name: '红烧肉',
        calories: 520,
        protein: 18,
        fat: 45,
        carbs: 12,
        sodium: 890,
        potassium: 320,
        phosphorus: 180,
        purines: 150,
        healthStatus: 'red' as const,
        quantitySuggestion: 'small' as const,
        alternatives: ['清蒸鱼', '白切鸡', '豆腐'],
        cookingTips: ['建议用瘦肉替代五花肉', '减少酱油用量', '搭配蔬菜食用'],
      },
      {
        name: '清炒西兰花',
        calories: 55,
        protein: 4,
        fat: 2,
        carbs: 8,
        sodium: 45,
        potassium: 380,
        phosphorus: 70,
        purines: 25,
        healthStatus: 'green' as const,
        quantitySuggestion: 'normal' as const,
        alternatives: ['蒸西兰花', '西兰花炒虾仁'],
        cookingTips: ['快炒保留营养', '少油少盐', '可搭配蒜蓉'],
      },
      {
        name: '宫保鸡丁',
        calories: 280,
        protein: 22,
        fat: 15,
        carbs: 18,
        sodium: 720,
        potassium: 280,
        phosphorus: 150,
        purines: 80,
        healthStatus: 'yellow' as const,
        quantitySuggestion: 'moderate' as const,
        alternatives: ['白灼鸡胸肉', '清蒸鸡腿'],
        cookingTips: ['减少辣椒用量', '用鸡胸肉替代鸡腿肉', '少放花生'],
      },
      {
        name: '水煮白菜',
        calories: 25,
        protein: 1.5,
        fat: 0.5,
        carbs: 4,
        sodium: 30,
        potassium: 200,
        phosphorus: 35,
        purines: 15,
        healthStatus: 'green' as const,
        quantitySuggestion: 'normal' as const,
        alternatives: ['清炒白菜', '白菜豆腐汤'],
        cookingTips: ['保留菜叶营养', '可加少量姜丝提味'],
      },
    ];

    const randomIndex = Math.floor(Math.random() * mockFoods.length);
    const mockFood = mockFoods[randomIndex];

    // 基于用户健康状况计算健康评分
    const healthScore = this.calculateHealthScore(mockFood, userProfile);

    return {
      id: Math.random().toString(36).substr(2, 9),
      name: mockFood.name,
      calories: mockFood.calories,
      protein: mockFood.protein,
      fat: mockFood.fat,
      carbs: mockFood.carbs,
      sodium: mockFood.sodium,
      potassium: mockFood.potassium,
      phosphorus: mockFood.phosphorus,
      purines: mockFood.purines,
      healthScore,
      healthStatus: mockFood.healthStatus,
      quantitySuggestion: mockFood.quantitySuggestion,
      alternatives: mockFood.alternatives,
      cookingTips: mockFood.cookingTips,
    };
  }

  private calculateHealthScore(
    food: {
      sodium: number;
      potassium: number;
      phosphorus: number;
      purines: number;
      fat: number;
    },
    userProfile: UserHealthProfile
  ): number {
    let score = 8;

    userProfile.conditions.forEach(condition => {
      switch (condition) {
        case 'hypertension':
          if (food.sodium > 500) score -= 2;
          else if (food.sodium > 300) score -= 1;
          break;
        case 'hyperuricemia':
          if (food.purines > 100) score -= 2;
          else if (food.purines > 50) score -= 1;
          break;
        case 'kidneyIssues':
          if (food.potassium > 300) score -= 1;
          if (food.phosphorus > 150) score -= 1;
          break;
        case 'hyperlipidemia':
          if (food.fat > 30) score -= 2;
          else if (food.fat > 15) score -= 1;
          break;
        case 'diabetes':
          break;
        case 'obesity':
          break;
      }
    });

    return Math.max(1, Math.min(10, score));
  }

  private buildPrompt(userProfile: UserHealthProfile): string {
    return `
      分析这张食物图片，基于以下健康状况评估其对用户的影响：
      
      用户健康状况：${userProfile.conditions.join(', ')}
      当前健康指标：${JSON.stringify(userProfile.currentMetrics)}
      
      请提供：
      1. 食物识别结果
      2. 营养成分分析
      3. 对每种健康状况的影响评估
      4. 整体健康评分（1-10）
      5. 健康状态：能吃（绿）、谨慎吃（黄）、避免吃（红）
      6. 建议分量：少量、适量、正常量
      7. 替代食物建议
      8. 烹饪方式建议
    `;
  }

  private transformResponse(
    response: MedicalAPIResponse,
    userProfile: UserHealthProfile
  ): FoodItem {
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: response.analysis.foodName,
      calories: response.analysis.nutrients.calories,
      protein: response.analysis.nutrients.protein,
      fat: response.analysis.nutrients.fat,
      carbs: response.analysis.nutrients.carbs,
      sodium: response.analysis.nutrients.sodium,
      potassium: response.analysis.nutrients.potassium,
      phosphorus: response.analysis.nutrients.phosphorus,
      purines: response.analysis.nutrients.purines,
      healthScore: response.analysis.overallScore,
      healthStatus: response.analysis.healthStatus,
      quantitySuggestion: response.analysis.quantitySuggestion,
      alternatives: response.analysis.alternatives,
      cookingTips: response.analysis.cookingTips,
    };
  }
}

export const medicalAPIService = new MedicalAPIService();
