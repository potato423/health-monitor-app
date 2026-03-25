export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sodium: number;
  potassium: number;
  phosphorus: number;
  purines: number;
  healthScore: number;
  healthStatus: 'green' | 'yellow' | 'red';
  quantitySuggestion: 'small' | 'moderate' | 'normal';
  alternatives: string[];
  cookingTips: string[];
}

export interface MealRecord {
  id: string;
  timestamp: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  healthImpact: HealthImpact;
}

export interface HealthImpact {
  uricAcid: 'low' | 'medium' | 'high';
  bloodPressure: 'low' | 'medium' | 'high';
  bloodSugar: 'low' | 'medium' | 'high';
  bloodFat: 'low' | 'medium' | 'high';
  kidneyLoad: 'low' | 'medium' | 'high';
  weightManagement: 'low' | 'medium' | 'high';
}

export interface UserHealthProfile {
  userId: string;
  conditions: HealthCondition[];
  currentMetrics: HealthMetrics;
  preferences: UserPreferences;
}

export type HealthCondition = 
  | 'hyperuricemia' 
  | 'hypertension' 
  | 'diabetes' 
  | 'hyperlipidemia' 
  | 'kidneyIssues' 
  | 'obesity';

export interface HealthMetrics {
  uricAcid?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  bloodSugar?: number;
  bloodFat?: { cholesterol: number; triglycerides: number };
  weight?: number;
  height?: number;
}

export interface UserPreferences {
  reminders: boolean;
  reminderInterval: number; // 小时
  theme: 'light' | 'dark';
}
