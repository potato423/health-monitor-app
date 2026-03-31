import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ExerciseRecord {
  id: string;
  date: string;           // YYYY-MM-DD
  type: ExerciseType;
  durationMinutes: number;
  caloriesBurned: number;
  notes?: string;
  createdAt: string;
}

export type ExerciseType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'yoga'
  | 'strength'
  | 'hiit'
  | 'other';

export const EXERCISE_META: Record<ExerciseType, { label: string; icon: string; metFactor: number }> = {
  walking:  { label: 'Walking',        icon: 'walk-outline',      metFactor: 3.5 },
  running:  { label: 'Running',        icon: 'speedometer-outline',metFactor: 8.0 },
  cycling:  { label: 'Cycling',        icon: 'bicycle-outline',   metFactor: 7.0 },
  swimming: { label: 'Swimming',       icon: 'water-outline',     metFactor: 7.0 },
  yoga:     { label: 'Yoga',           icon: 'body-outline',      metFactor: 2.5 },
  strength: { label: 'Strength',       icon: 'barbell-outline',   metFactor: 5.0 },
  hiit:     { label: 'HIIT',           icon: 'flash-outline',     metFactor: 9.0 },
  other:    { label: 'Other',          icon: 'fitness-outline',   metFactor: 4.0 },
};

const KEY_PREFIX = 'exercise_';

function dateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function storageKey(date: Date): string {
  return KEY_PREFIX + dateKey(date);
}

/** Estimate calories burned: MET × weight(kg) × hours */
export function estimateCalories(type: ExerciseType, durationMinutes: number, weightKg = 70): number {
  const met   = EXERCISE_META[type].metFactor;
  const hours = durationMinutes / 60;
  return Math.round(met * weightKg * hours);
}

class ExerciseService {
  async getRecords(date: Date): Promise<ExerciseRecord[]> {
    const raw = await AsyncStorage.getItem(storageKey(date));
    if (!raw) return [];
    try { return JSON.parse(raw) as ExerciseRecord[]; }
    catch { return []; }
  }

  async addRecord(record: Omit<ExerciseRecord, 'id' | 'createdAt'>): Promise<ExerciseRecord> {
    const date   = new Date(record.date);
    const existing = await this.getRecords(date);
    const full: ExerciseRecord = {
      ...record,
      id:        Math.random().toString(36).slice(2, 11),
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(storageKey(date), JSON.stringify([...existing, full]));
    return full;
  }

  async deleteRecord(date: Date, id: string): Promise<void> {
    const existing = await this.getRecords(date);
    const filtered = existing.filter(r => r.id !== id);
    await AsyncStorage.setItem(storageKey(date), JSON.stringify(filtered));
  }

  async getTotalCaloriesBurned(date: Date): Promise<number> {
    const records = await this.getRecords(date);
    return records.reduce((s, r) => s + r.caloriesBurned, 0);
  }
}

export const exerciseService = new ExerciseService();
