import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { i18n } from '../i18n';

const mockFoods = [
  { id: '1', name: '红烧肉', nameEn: 'Braised Pork', healthStatus: 'red', time: '08:30', mealType: 'breakfast' },
  { id: '2', name: '清炒西兰花', nameEn: 'Broccoli', healthStatus: 'green', time: '12:15', mealType: 'lunch' },
  { id: '3', name: '宫保鸡丁', nameEn: 'Kung Pao Chicken', healthStatus: 'yellow', time: '18:45', mealType: 'dinner' },
];

const mealNames = {
  breakfast: { zh: '早餐', en: 'Breakfast' },
  lunch: { zh: '午餐', en: 'Lunch' },
  dinner: { zh: '晚餐', en: 'Dinner' },
  snack: { zh: '加餐', en: 'Snack' },
};

export default function RecordScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return '#34C759';
      case 'yellow': return '#FF9500';
      case 'red': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'green': return '能吃 / Safe';
      case 'yellow': return '谨慎吃 / Caution';
      case 'red': return '避免吃 / Avoid';
      default: return '未知 / Unknown';
    }
  };

  const groupedByMeal = {
    breakfast: mockFoods.filter(f => f.mealType === 'breakfast'),
    lunch: mockFoods.filter(f => f.mealType === 'lunch'),
    dinner: mockFoods.filter(f => f.mealType === 'dinner'),
    snack: mockFoods.filter(f => f.mealType === 'snack'),
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.zh.record.title}</Text>
        <Text style={styles.titleEn}>{i18n.en.record.title}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedByMeal).map(([mealType, foods]) => (
          <View key={mealType} style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealTitle}>{mealNames[mealType as keyof typeof mealNames].zh}</Text>
                <Text style={styles.mealTitleEn}>{mealNames[mealType as keyof typeof mealNames].en}</Text>
              </View>
              <Text style={styles.mealTime}>
                {foods.length > 0 ? foods[0].time : '--:--'}
              </Text>
            </View>

            {foods.length === 0 ? (
              <TouchableOpacity style={styles.emptyMeal}>
                <Ionicons name="add-circle-outline" size={24} color="#C7C7CC" />
                <View>
                  <Text style={styles.emptyText}>点击添加食物</Text>
                  <Text style={styles.emptyTextEn}>Tap to add food</Text>
                </View>
              </TouchableOpacity>
            ) : (
              foods.map((food) => (
                <TouchableOpacity key={food.id} style={styles.foodItem}>
                  <View style={styles.foodInfo}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(food.healthStatus) }]} />
                    <View>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodNameEn}>{food.nameEn}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(food.healthStatus) + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(food.healthStatus) }]}>
                      {getStatusText(food.healthStatus)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  titleEn: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mealSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  mealTitleEn: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  mealTime: {
    fontSize: 15,
    color: '#8E8E93',
  },
  emptyMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    marginLeft: 8,
  },
  emptyTextEn: {
    fontSize: 12,
    color: '#C7C7CC',
    marginLeft: 8,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  foodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  foodName: {
    fontSize: 17,
    color: '#000000',
  },
  foodNameEn: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});