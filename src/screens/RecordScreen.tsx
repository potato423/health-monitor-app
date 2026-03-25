import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockFoods = [
  { id: '1', name: '红烧肉', healthStatus: 'red', time: '08:30', mealType: 'breakfast' },
  { id: '2', name: '清炒西兰花', healthStatus: 'green', time: '12:15', mealType: 'lunch' },
  { id: '3', name: '宫保鸡丁', healthStatus: 'yellow', time: '18:45', mealType: 'dinner' },
];

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
      case 'green': return '能吃';
      case 'yellow': return '谨慎吃';
      case 'red': return '避免吃';
      default: return '未知';
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
        <Text style={styles.title}>饮食记录</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedByMeal).map(([mealType, foods]) => (
          <View key={mealType} style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>
                {mealType === 'breakfast' ? '早餐' : 
                 mealType === 'lunch' ? '午餐' : 
                 mealType === 'dinner' ? '晚餐' : '加餐'}
              </Text>
              <Text style={styles.mealTime}>
                {foods.length > 0 ? foods[0].time : '--:--'}
              </Text>
            </View>

            {foods.length === 0 ? (
              <View style={styles.emptyMeal}>
                <Ionicons name="add-circle-outline" size={24} color="#C7C7CC" />
                <Text style={styles.emptyText}>点击添加食物</Text>
              </View>
            ) : (
              foods.map((food) => (
                <View key={food.id} style={styles.foodItem}>
                  <View style={styles.foodInfo}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(food.healthStatus) }]} />
                    <Text style={styles.foodName}>{food.name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(food.healthStatus) + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(food.healthStatus) }]}>
                      {getStatusText(food.healthStatus)}
                    </Text>
                  </View>
                </View>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
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
    color: '#C7C7CC',
    marginLeft: 8,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  foodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  foodName: {
    fontSize: 17,
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '500',
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
    elevation: 5,
  },
});