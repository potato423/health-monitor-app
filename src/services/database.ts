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

    for (const food of record.foods) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO food_items 
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

    return records.map((record: any) => ({
      ...record,
      timestamp: new Date(record.timestamp),
      healthImpact: JSON.parse(record.health_impact)
    }));
  }
}

export const databaseService = new DatabaseService();