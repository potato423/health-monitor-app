import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { mealService } from '../services/mealService';
import { MealRecord } from '../types';

export default function RecordScreen() {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayMeals();
  }, []);

  const loadTodayMeals = async () => {
    try {
      const todayMeals = await mealService.getTodayMeals();
      setMeals(todayMeals);
    } catch (error) {
      console.error('Failed to load meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);

  const getMealStatus = (mealType: string) => {
    const meal = meals.find(m => m.mealType === mealType);
    if (!meal) return '待记录';
    return `${meal.foods.length}种食物`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>今日饮食记录</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>今日总热量</Text>
        <Text style={styles.summaryValue}>
          {totalCalories > 0 ? `${totalCalories} kcal` : '未记录'}
        </Text>
      </View>
      
      <View style={styles.mealList}>
        {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
          <View key={mealType} style={styles.mealItem}>
            <Text style={styles.mealTime}>
              {mealType === 'breakfast' ? '早餐' : 
               mealType === 'lunch' ? '午餐' : 
               mealType === 'dinner' ? '晚餐' : '加餐'}
            </Text>
            <Text style={styles.mealStatus}>{getMealStatus(mealType)}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ 添加食物</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  mealList: {
    marginBottom: 20,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mealTime: {
    fontSize: 16,
    color: '#333333',
  },
  mealStatus: {
    fontSize: 14,
    color: '#666666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});