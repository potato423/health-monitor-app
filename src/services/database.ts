import * as SQLite from 'expo-sqlite';
import { MealRecord, FoodItem } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    this.db = await SQLite.openDatabaseAsync('health_monitor.db');
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_records (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        meal_type TEXT,
        total_calories REAL,
        health_impact TEXT
      );
      
      CREATE TABLE IF NOT EXISTS food_items (
        id TEXT PRIMARY KEY,
        meal_id TEXT,
        name TEXT,
        calories REAL,
        protein REAL,
        fat REAL,
        carbs REAL,
        sodium REAL,
        potassium REAL,
        phosphorus REAL,
        purines REAL,
        health_score REAL,
        health_status TEXT,
        quantity_suggestion TEXT,
        alternatives TEXT,
        cooking_tips TEXT,
        FOREIGN KEY (meal_id) REFERENCES meal_records (id)
      );
    `);
  }

  async saveMealRecord(record: MealRecord) {
    if (!this.db) return;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO meal_records (id, timestamp, meal_type, total_calories, health_impact) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        record.id,
        record.timestamp.toISOString(),
        record.mealType,
        record.totalCalories,
        JSON.stringify(record.healthImpact)
      ]
    );

    await this.db.runAsync(
      `DELETE FROM food_items WHERE meal_id = ?`,
      [record.id]
    );

    for (const food of record.foods) {
      await this.db.runAsync(
        `INSERT INTO food_items 
         (id, meal_id, name, calories, protein, fat, carbs, sodium, potassium, phosphorus, 
          purines, health_score, health_status, quantity_suggestion, alternatives, cooking_tips) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          food.id,
          record.id,
          food.name,
          food.calories,
          food.protein,
          food.fat,
          food.carbs,
          food.sodium,
          food.potassium,
          food.phosphorus,
          food.purines,
          food.healthScore,
          food.healthStatus,
          food.quantitySuggestion,
          JSON.stringify(food.alternatives),
          JSON.stringify(food.cookingTips)
        ]
      );
    }
  }

  async getMealRecords(date: Date): Promise<MealRecord[]> {
    if (!this.db) return [];

    const dateString = date.toISOString().split('T')[0];
    const records = await this.db.getAllAsync(
      `SELECT * FROM meal_records WHERE date(timestamp) = ?`,
      [dateString]
    );

    const mealRecords: MealRecord[] = [];
    for (const record of records) {
      const mealId = (record as any).id;
      const foods = await this.db.getAllAsync(
        `SELECT * FROM food_items WHERE meal_id = ?`,
        [mealId]
      );

      const foodItems: FoodItem[] = foods.map((food: any) => ({
        id: food.id,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        sodium: food.sodium,
        potassium: food.potassium,
        phosphorus: food.phosphorus,
        purines: food.purines,
        healthScore: food.health_score,
        healthStatus: food.health_status,
        quantitySuggestion: food.quantity_suggestion,
        alternatives: JSON.parse(food.alternatives),
        cookingTips: JSON.parse(food.cooking_tips)
      }));

      mealRecords.push({
        id: mealId,
        timestamp: new Date((record as any).timestamp),
        mealType: (record as any).meal_type as MealRecord['mealType'],
        foods: foodItems,
        totalCalories: (record as any).total_calories,
        healthImpact: JSON.parse((record as any).health_impact)
      });
    }

    return mealRecords;
  }
}

export const databaseService = new DatabaseService();