import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow, Type } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { databaseService } from '../services/database';
import { MealRecord, FoodItem } from '../types';

type Nav = StackNavigationProp<RootStackParamList>;
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MEAL_META: Record<MealType, { label: string; icon: string; timeRange: string }> = {
  breakfast: { label: 'Breakfast', icon: 'sunny-outline',       timeRange: '6:00 – 9:00 AM' },
  lunch:     { label: 'Lunch',     icon: 'partly-sunny-outline', timeRange: '11:30 AM – 1:30 PM' },
  dinner:    { label: 'Dinner',    icon: 'moon-outline',         timeRange: '5:30 – 8:00 PM' },
  snack:     { label: 'Snack',     icon: 'cafe-outline',         timeRange: 'Anytime' },
};

function generateWeekDates(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return d;
  });
}

function statusColor(s: FoodItem['healthStatus']) {
  return s === 'green' ? Colors.green : s === 'yellow' ? Colors.orange : Colors.red;
}

function mealStatusColor(foods: FoodItem[]): string {
  if (!foods.length) return Colors.textTertiary;
  if (foods.some(f => f.healthStatus === 'red'))    return Colors.red;
  if (foods.some(f => f.healthStatus === 'yellow')) return Colors.orange;
  return Colors.green;
}

// ─── Food Row ─────────────────────────────────────────────────────────────────
function FoodRow({ food, isLast }: { food: FoodItem; isLast: boolean }) {
  const color = statusColor(food.healthStatus);
  const badge = food.healthStatus === 'green' ? 'OK' : food.healthStatus === 'yellow' ? 'Caution' : 'Avoid';
  return (
    <View>
      <View style={styles.foodRow}>
        <View style={[styles.statusStripe, { backgroundColor: color }]} />
        <View style={styles.foodContent}>
          <Text style={styles.foodName}>{food.name}</Text>
          <View style={styles.foodRight}>
            <View style={[styles.badge, { backgroundColor: color + '18' }]}>
              <Text style={[styles.badgeText, { color }]}>{badge}</Text>
            </View>
            <Text style={styles.foodCal}>{food.calories} kcal</Text>
          </View>
        </View>
      </View>
      {!isLast && <View style={styles.rowDivider} />}
    </View>
  );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────
function MealCard({ mealType, record, onAdd }: { mealType: MealType; record: MealRecord | null; onAdd: () => void }) {
  const meta   = MEAL_META[mealType];
  const foods  = record?.foods ?? [];
  const total  = record?.totalCalories ?? 0;
  const accent = mealStatusColor(foods);

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealHeaderLeft}>
          <View style={[styles.mealIconWrap, { backgroundColor: accent + '18' }]}>
            <Ionicons name={meta.icon as any} size={18} color={accent} />
          </View>
          <View>
            <Text style={styles.mealLabel}>{meta.label}</Text>
            <Text style={styles.mealTime}>{meta.timeRange}</Text>
          </View>
        </View>
        <View style={styles.mealHeaderRight}>
          {total > 0 && <Text style={styles.mealCal}>{total} kcal</Text>}
          <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.7}>
            <Ionicons name="add" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {foods.length === 0 ? (
        <TouchableOpacity style={styles.emptyMeal} onPress={onAdd} activeOpacity={0.6}>
          <Ionicons name="add-circle-outline" size={22} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>Tap to add food</Text>
        </TouchableOpacity>
      ) : (
        <View>
          {foods.map((f, i) => <FoodRow key={f.id} food={f} isLast={i === foods.length - 1} />)}
        </View>
      )}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyDay({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyDay}>
      <View style={styles.emptyDayIcon}>
        <Ionicons name="restaurant-outline" size={40} color={Colors.textTertiary} />
      </View>
      <Text style={styles.emptyDayTitle}>No meals logged yet</Text>
      <Text style={styles.emptyDaySub}>Snap a photo to log your first meal today</Text>
      <TouchableOpacity style={styles.emptyDayBtn} onPress={onAdd} activeOpacity={0.85}>
        <Ionicons name="camera" size={18} color="#fff" />
        <Text style={styles.emptyDayBtnText}>Scan Food</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function RecordScreen() {
  const navigation = useNavigation<Nav>();
  const [date, setDate]       = useState(new Date());
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const weekDates = generateWeekDates();

  const load = useCallback(async (d: Date) => {
    setLoading(true);
    try { setRecords(await databaseService.getMealRecords(d)); }
    catch { setRecords([]); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(date); }, [date, load]));

  const onDatePress = async (d: Date) => {
    await Haptics.selectionAsync();
    setDate(d);
  };

  const onAdd = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('FoodResult', { analysisResult: undefined });
  };

  const byType = Object.fromEntries(records.map(r => [r.mealType, r])) as Record<string, MealRecord>;
  const totalCal   = records.reduce((s, r) => s + r.totalCalories, 0);
  const totalFoods = records.reduce((s, r) => s + r.foods.length, 0);
  const allFoods   = records.flatMap(r => r.foods);
  const avgScore   = allFoods.length
    ? Number((allFoods.reduce((s, f) => s + (f.healthScore ?? 5), 0) / allFoods.length).toFixed(1))
    : null;

  const isToday    = (d: Date) => d.toDateString() === new Date().toDateString();
  const isSelected = (d: Date) => d.toDateString() === date.toDateString();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Food Log</Text>
        <TouchableOpacity style={styles.calBtn} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Date Strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScroll} style={styles.dateSelectorWrap}>
        {weekDates.map((d, i) => {
          const sel = isSelected(d), tod = isToday(d);
          return (
            <TouchableOpacity key={i}
              style={[styles.dateItem, sel && styles.dateItemSel]}
              onPress={() => onDatePress(d)} activeOpacity={0.7}>
              <Text style={[styles.dateDayName, sel && styles.dateDayNameSel]}>
                {tod ? 'Today' : WEEK_DAYS[d.getDay()]}
              </Text>
              <Text style={[styles.dateNum, sel && styles.dateNumSel]}>{d.getDate()}</Text>
              {tod && !sel && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Summary Strip */}
      <View style={styles.summaryRow}>
        {[
          { val: totalCal > 0 ? `${totalCal}` : '—', key: 'Calories', color: totalCal > 2000 ? Colors.orange : Colors.text },
          { val: totalFoods > 0 ? `${totalFoods}` : '—', key: 'Items', color: Colors.text },
          {
            val: avgScore != null ? `${avgScore}` : '—',
            key: 'Score',
            color: avgScore == null ? Colors.text : avgScore >= 7 ? Colors.green : avgScore >= 5 ? Colors.orange : Colors.red,
          },
        ].map((item, i, arr) => (
          <React.Fragment key={i}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: item.color }]}>{item.val}</Text>
              <Text style={styles.summaryKey}>{item.key}</Text>
            </View>
            {i < arr.length - 1 && <View style={styles.summaryDiv} />}
          </React.Fragment>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : records.length === 0 ? (
        <ScrollView contentContainerStyle={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <EmptyDay onAdd={onAdd} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}>
          {(Object.keys(MEAL_META) as MealType[]).map(type => (
            <MealCard key={type} mealType={type} record={byType[type] ?? null} onAdd={onAdd} />
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onAdd} activeOpacity={0.85}>
        <Ionicons name="camera" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  title: { ...Type.largeTitle, color: Colors.text },
  calBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardBackground, alignItems: 'center', justifyContent: 'center', ...Shadow.xs },
  dateSelectorWrap: { marginTop: Spacing.sm },
  dateScroll: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  dateItem: { width: 52, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.lg },
  dateItemSel: { backgroundColor: Colors.primary },
  dateDayName: { ...Type.caption, color: Colors.textSecondary, fontWeight: '500' },
  dateDayNameSel: { color: 'rgba(255,255,255,0.8)' },
  dateNum: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 2 },
  dateNumSel: { color: '#fff' },
  todayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.primary, marginTop: 3 },
  summaryRow: { flexDirection: 'row', backgroundColor: Colors.cardBackground, marginHorizontal: Spacing.xl, marginTop: Spacing.lg, borderRadius: Radius.xl, paddingVertical: Spacing.md, ...Shadow.xs },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 22, fontWeight: '700', color: Colors.text },
  summaryKey: { ...Type.caption, color: Colors.textSecondary, marginTop: 2 },
  summaryDiv: { width: 1, backgroundColor: Colors.separator, marginVertical: 4 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  mealCard: { backgroundColor: Colors.cardBackground, borderRadius: Radius.xxl, marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.card },
  mealHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.separator },
  mealHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  mealIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  mealLabel: { ...Type.headline, color: Colors.text },
  mealTime: { ...Type.caption, color: Colors.textSecondary, marginTop: 1 },
  mealHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  mealCal: { ...Type.callout, color: Colors.textSecondary, fontWeight: '500' },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  emptyMeal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { ...Type.callout, color: Colors.textTertiary },
  foodRow: { flexDirection: 'row', alignItems: 'stretch' },
  statusStripe: { width: 3, borderRadius: 2, marginVertical: 2 },
  foodContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  foodName: { ...Type.callout, fontWeight: '500', color: Colors.text, flex: 1 },
  foodRight: { alignItems: 'flex-end', gap: 4 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.pill },
  badgeText: { fontSize: 11, fontWeight: '700' },
  foodCal: { ...Type.caption, color: Colors.textSecondary, fontWeight: '500' },
  rowDivider: { height: 0.5, backgroundColor: Colors.separator, marginLeft: Spacing.lg + 3 },
  emptyDay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyDayIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.systemFill, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  emptyDayTitle: { ...Type.title2, color: Colors.text, textAlign: 'center' },
  emptyDaySub: { ...Type.body, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  emptyDayBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingHorizontal: Spacing.xxl, paddingVertical: 14, marginTop: Spacing.xl, ...Shadow.button },
  emptyDayBtnText: { ...Type.headline, color: '#fff' },
  fab: { position: 'absolute', right: Spacing.xl, bottom: 30, width: 62, height: 62, borderRadius: 31, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
});
