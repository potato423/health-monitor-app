import { MealRecord, HealthImpact } from '../types';
import { mealService } from './mealService';

interface DailyAnalysis {
  date: Date;
  totalCalories: number;
  healthScore: number;
  trends: {
    uricAcid: 'improving' | 'stable' | 'worsening';
    bloodPressure: 'improving' | 'stable' | 'worsening';
    bloodSugar: 'improving' | 'stable' | 'worsening';
    bloodFat: 'improving' | 'stable' | 'worsening';
    kidneyLoad: 'improving' | 'stable' | 'worsening';
    weightManagement: 'improving' | 'stable' | 'worsening';
  };
  recommendations: string[];
}

class AnalysisService {
  async generateDailyAnalysis(): Promise<DailyAnalysis> {
    const todayMeals = await mealService.getTodayMeals();
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
    
    const healthScore = this.calculateHealthScore(todayMeals);
    const trends = this.analyzeTrends(todayMeals);
    const recommendations = this.generateRecommendations(todayMeals);

    return {
      date: new Date(),
      totalCalories,
      healthScore,
      trends,
      recommendations,
    };
  }

  private calculateHealthScore(meals: MealRecord[]): number {
    if (meals.length === 0) return 0;
    
    let score = 10;
    meals.forEach(meal => {
      const impact = meal.healthImpact;
      if (impact.uricAcid === 'high') score -= 1;
      if (impact.bloodPressure === 'high') score -= 1;
      if (impact.bloodSugar === 'high') score -= 1;
      if (impact.bloodFat === 'high') score -= 1;
      if (impact.kidneyLoad === 'high') score -= 1;
      if (impact.weightManagement === 'high') score -= 1;
    });
    
    return Math.max(1, Math.min(10, score));
  }

  private analyzeTrends(meals: MealRecord[]): DailyAnalysis['trends'] {
    // 简化版本：基于当日数据
    const impact: HealthImpact = {
      uricAcid: 'low',
      bloodPressure: 'low',
      bloodSugar: 'low',
      bloodFat: 'low',
      kidneyLoad: 'low',
      weightManagement: 'low',
    };

    meals.forEach(meal => {
      Object.keys(meal.healthImpact).forEach(key => {
        if (meal.healthImpact[key as keyof HealthImpact] === 'high') {
          impact[key as keyof HealthImpact] = 'high';
        } else if (meal.healthImpact[key as keyof HealthImpact] === 'medium' && 
                   impact[key as keyof HealthImpact] !== 'high') {
          impact[key as keyof HealthImpact] = 'medium';
        }
      });
    });

    return {
      uricAcid: impact.uricAcid === 'high' ? 'worsening' : 
                impact.uricAcid === 'medium' ? 'stable' : 'improving',
      bloodPressure: impact.bloodPressure === 'high' ? 'worsening' : 
                     impact.bloodPressure === 'medium' ? 'stable' : 'improving',
      bloodSugar: impact.bloodSugar === 'high' ? 'worsening' : 
                  impact.bloodSugar === 'medium' ? 'stable' : 'improving',
      bloodFat: impact.bloodFat === 'high' ? 'worsening' : 
                impact.bloodFat === 'medium' ? 'stable' : 'improving',
      kidneyLoad: impact.kidneyLoad === 'high' ? 'worsening' : 
                  impact.kidneyLoad === 'medium' ? 'stable' : 'improving',
      weightManagement: impact.weightManagement === 'high' ? 'worsening' : 
                        impact.weightManagement === 'medium' ? 'stable' : 'improving',
    };
  }

  private generateRecommendations(meals: MealRecord[]): string[] {
    const recommendations: string[] = [];
    
    if (meals.length === 0) {
      recommendations.push('开始记录饮食，获取个性化健康建议');
      return recommendations;
    }

    const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
    if (totalCalories < 1200) {
      recommendations.push('今日热量摄入偏低，建议适当增加营养');
    } else if (totalCalories > 2500) {
      recommendations.push('今日热量摄入偏高，建议控制饮食');
    }

    meals.forEach(meal => {
      if (meal.healthImpact.uricAcid === 'high') {
        recommendations.push('今日高嘌呤食物较多，建议多喝水促进尿酸排泄');
      }
      if (meal.healthImpact.bloodPressure === 'high') {
        recommendations.push('今日钠摄入较高，建议减少盐分摄入');
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('今日饮食健康，继续保持！');
    }

    return recommendations;
  }
}

export const analysisService = new AnalysisService();