import { MealRecord, FoodItem, HealthImpact } from '../types';
import { databaseService } from './database';

class MealService {
  async recordMeal(foods: FoodItem[], mealType: MealRecord['mealType']): Promise<MealRecord> {
    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
    const healthImpact = this.calculateHealthImpact(foods);

    const mealRecord: MealRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      mealType,
      foods,
      totalCalories,
      healthImpact,
    };

    await databaseService.saveMealRecord(mealRecord);
    return mealRecord;
  }

  private calculateHealthImpact(foods: FoodItem[]): HealthImpact {
    const totalPurines = foods.reduce((sum, food) => sum + food.purines, 0);
    const totalSodium = foods.reduce((sum, food) => sum + food.sodium, 0);
    const totalSugar = foods.reduce((sum, food) => sum + food.carbs * 0.1, 0);
    const totalFat = foods.reduce((sum, food) => sum + food.fat, 0);
    const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0);

    return {
      uricAcid: totalPurines > 200 ? 'high' : totalPurines > 100 ? 'medium' : 'low',
      bloodPressure: totalSodium > 1500 ? 'high' : totalSodium > 1000 ? 'medium' : 'low',
      bloodSugar: totalSugar > 30 ? 'high' : totalSugar > 15 ? 'medium' : 'low',
      bloodFat: totalFat > 50 ? 'high' : totalFat > 30 ? 'medium' : 'low',
      kidneyLoad: totalProtein > 50 ? 'high' : totalProtein > 30 ? 'medium' : 'low',
      weightManagement: totalFat > 50 ? 'high' : totalFat > 30 ? 'medium' : 'low',
    };
  }

  async getTodayMeals(): Promise<MealRecord[]> {
    const today = new Date();
    return await databaseService.getMealRecords(today);
  }
}

export const mealService = new MealService();