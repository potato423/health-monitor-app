import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { mealService } from '../services/mealService';
import { databaseService } from '../services/database';
import { MealRecord, FoodItem } from '../types';

type Nav = StackNavigationProp<RootStackParamList>;

// ─── Types ────────────────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealGroup {
  type: MealType;
  label: string;
  icon: string;
  timeRange: string;
  record: MealRecord | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateWeekDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

const MEAL_META: Record<MealType, { label: string; icon: string; timeRange: string }> = {
  breakfast: { label: '早餐', icon: 'sunny-outline', timeRange: '06:00 – 09:00' },
  lunch:     { label: '午餐', icon: 'partly-sunny-outline', timeRange: '11:30 – 13:30' },
  dinner:    { label: '晚餐', icon: 'moon-outline', timeRange: '17:30 – 20:00' },
  snack:     { label: '加餐', icon: 'cafe-outline', timeRange: '随时' },
};

function buildMealGroups(records: MealRecord[]): MealGroup[] {
  const byType: Record<string, MealRecord> = {};
  for (const r of records) byType[r.mealType] = r;

  return (['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => ({
    type,
    ...MEAL_META[type],
    record: byType[type] ?? null,
  }));
}

function statusColor(s: FoodItem['healthStatus']) {
  return s === 'green' ? Colors.green : s === 'yellow' ? Colors.orange : Colors.red;
}

function mealStatusColor(foods: FoodItem[]): string {
  if (foods.some(f => f.healthStatus === 'red')) return Colors.red;
  if (foods.some(f => f.healthStatus === 'yellow')) return Colors.orange;
  return Colors.green;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FoodRow({ food }: { food: FoodItem }) {
  const color = statusColor(food.healthStatus);
  const label = food.healthStatus === 'green' ? '可以吃' : food.healthStatus === 'yellow' ? '谨慎' : '避免';

  return (
    <View style={styles.foodRow}>
      <View style={[styles.statusStripe, { backgroundColor: color }]} />
      <View style={styles.foodRowContent}>
        <View style={styles.foodRowLeft}>
          <Text style={styles.foodName}>{food.name}</Text>
        </View>
        <View style={styles.foodRowRight}>
          <View style={[styles.statusPill, { backgroundColor: color + '18' }]}>
            <Text style={[styles.statusPillText, { color }]}>{label}</Text>
          </View>
          <Text style={styles.foodCal}>{food.calories} 卡</Text>
        </View>
      </View>
    </View>
  );
}

function EmptyMeal({ onAdd }: { onAdd: () => void }) {
  return (
    <TouchableOpacity style={styles.emptyMeal} onPress={onAdd} activeOpacity={0.6}>
      <Ionicons name="add-circle-outline" size={22} color={Colors.textTertiary} />
      <Text style={styles.emptyMealText}>点击添加食物</Text>
    </TouchableOpacity>
  );
}

function MealCard({ group, onAdd }: { group: MealGroup; onAdd: () => void }) {
  const foods = group.record?.foods ?? [];
  const total = group.record?.totalCalories ?? 0;
  const iconColor = foods.length > 0 ? mealStatusColor(foods) : Colors.textTertiary;

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealHeaderLeft}>
          <View style={[styles.mealIconWrap, { backgroundColor: iconColor + '18' }]}>
            <Ionicons name={group.icon as any} size={18} color={iconColor} />
          </View>
          <View>
            <Text style={styles.mealLabel}>{group.label}</Text>
            <Text style={styles.mealTimeRange}>{group.timeRange}</Text>
          </View>
        </View>
        <View style={styles.mealHeaderRight}>
          {total > 0 && <Text style={styles.mealCal}>{total} 卡</Text>}
          <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.7}>
            <Ionicons name="add" size={18} color={Colors.blue} />
          </TouchableOpacity>
        </View>
      </View>

      {foods.length === 0
        ? <EmptyMeal onAdd={onAdd} />
        : (
          <View style={styles.foodList}>
            {foods.map((food, i) => (
              <View key={food.id}>
                <FoodRow food={food} />
                {i < foods.length - 1 && <View style={styles.foodDivider} />}
              </View>
            ))}
          </View>
        )
      }
    </View>
  );
}

function EmptyDay({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyDay}>
      <View style={styles.emptyDayIconWrap}>
        <Ionicons name="restaurant-outline" size={40} color={Colors.textTertiary} />
      </View>
      <Text style={styles.emptyDayTitle}>今天还没有饮食记录</Text>
      <Text style={styles.emptyDaySub}>拍照或手动添加你的第一餐</Text>
      <TouchableOpacity style={styles.emptyDayBtn} onPress={onAdd} activeOpacity={0.85}>
        <Ionicons name="camera" size={18} color="#FFFFFF" />
        <Text style={styles.emptyDayBtnText}>拍照识别食物</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function RecordScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const weekDates = generateWeekDates();

  const loadRecords = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const data = await databaseService.getMealRecords(date);
      setRecords(data);
    } catch (e) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever tab is focused or date changes
  useFocusEffect(
    useCallback(() => {
      loadRecords(selectedDate);
    }, [selectedDate, loadRecords])
  );

  const handleDateSelect = async (date: Date) => {
    await Haptics.selectionAsync();
    setSelectedDate(date);
  };

  const handleAdd = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('FoodResult', { analysisResult: undefined });
  };

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const isSelected = (d: Date) => d.toDateString() === selectedDate.toDateString();

  const groups = buildMealGroups(records);
  const totalCalories = records.reduce((s, r) => s + r.totalCalories, 0);
  const totalFoods = records.reduce((s, r) => s + r.foods.length, 0);
  const hasAny = records.length > 0;

  // Simple today score: average of food health scores if any
  const allFoods = records.flatMap(r => r.foods);
  const avgScore = allFoods.length > 0
    ? allFoods.reduce((s, f) => s + (f.healthScore ?? 5), 0) / allFoods.length
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>饮食记录</Text>
        <TouchableOpacity style={styles.calBtn} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={22} color={Colors.blue} />
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScroll}
        style={styles.dateSelectorWrap}
      >
        {weekDates.map((date, i) => {
          const sel = isSelected(date);
          const tod = isToday(date);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dateItem, sel && styles.dateItemSelected]}
              onPress={() => handleDateSelect(date)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateDayName, sel && styles.dateDayNameSel]}>
                {tod ? '今' : WEEK_DAYS[date.getDay()]}
              </Text>
              <Text style={[styles.dateNum, sel && styles.dateNumSel]}>
                {date.getDate()}
              </Text>
              {tod && !sel && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Summary Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>{totalCalories > 0 ? totalCalories : '–'}</Text>
          <Text style={styles.summaryKey}>总卡路里</Text>
        </View>
        <View style={styles.summaryDiv} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>{totalFoods > 0 ? totalFoods : '–'}</Text>
          <Text style={styles.summaryKey}>食物种类</Text>
        </View>
        <View style={styles.summaryDiv} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, avgScore != null && { color: avgScore >= 7 ? Colors.green : avgScore >= 5 ? Colors.orange : Colors.red }]}>
            {avgScore != null ? avgScore.toFixed(1) : '–'}
          </Text>
          <Text style={styles.summaryKey}>今日评分</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      ) : !hasAny ? (
        <ScrollView contentContainerStyle={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <EmptyDay onAdd={handleAdd} />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {groups.map((group) => (
            <MealCard key={group.type} group={group} onAdd={handleAdd} />
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.85}>
        <Ionicons name="camera" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: 34, fontWeight: '700', color: Colors.text },
  calBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.secondaryBackground,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.card,
  },
  dateSelectorWrap: { marginTop: Spacing.sm },
  dateScroll: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  dateItem: { width: 44, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.md },
  dateItemSelected: { backgroundColor: Colors.blue },
  dateDayName: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  dateDayNameSel: { color: 'rgba(255,255,255,0.8)' },
  dateNum: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 2 },
  dateNumSel: { color: '#FFFFFF' },
  todayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.blue, marginTop: 3 },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    ...Shadow.card,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 20, fontWeight: '700', color: Colors.text },
  summaryKey: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  summaryDiv: { width: 0.5, backgroundColor: Colors.separator, marginVertical: 4 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  mealCard: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.card,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  mealHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  mealIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  mealLabel: { fontSize: 16, fontWeight: '600', color: Colors.text },
  mealTimeRange: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  mealHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  mealCal: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  addBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.blue + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyMealText: { fontSize: 14, color: Colors.textTertiary },
  foodList: {},
  foodRow: { flexDirection: 'row', alignItems: 'stretch' },
  statusStripe: { width: 3, borderRadius: 2, marginVertical: 2, marginLeft: 0 },
  foodRowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  foodRowLeft: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: '500', color: Colors.text },
  foodRowRight: { alignItems: 'flex-end', gap: Spacing.xs },
  statusPill: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.pill },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  foodCal: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  foodDivider: { height: 0.5, backgroundColor: Colors.separator, marginLeft: Spacing.lg + 3 },
  emptyDay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyDayIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.systemFill,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyDayTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  emptyDaySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  emptyDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.blue,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    marginTop: Spacing.xl,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyDayBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: 30,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.blue,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
});
