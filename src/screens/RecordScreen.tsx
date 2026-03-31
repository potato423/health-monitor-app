import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow, Type } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { databaseService } from '../services/database';
import { MealRecord, FoodItem } from '../types';
import {
  exerciseService, ExerciseRecord, ExerciseType,
  EXERCISE_META, estimateCalories,
} from '../services/exerciseService';

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

  const [exercises, setExercises]   = useState<ExerciseRecord[]>([]);
  const [showExModal, setShowExModal] = useState(false);
  const [exType, setExType]           = useState<ExerciseType>('walking');
  const [exDuration, setExDuration]   = useState('30');

  const loadExercises = useCallback(async (d: Date) => {
    const ex = await exerciseService.getRecords(d).catch(() => []);
    setExercises(ex);
  }, []);

  useFocusEffect(useCallback(() => {
    load(date);
    loadExercises(date);
  }, [date, load, loadExercises]));

  const handleAddExercise = async () => {
    const mins = parseInt(exDuration, 10);
    if (isNaN(mins) || mins < 1) { Alert.alert('Invalid duration'); return; }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await exerciseService.addRecord({
      date: date.toISOString().split('T')[0],
      type: exType,
      durationMinutes: mins,
      caloriesBurned: estimateCalories(exType, mins),
    });
    setShowExModal(false);
    setExDuration('30');
    loadExercises(date);
  };

  const byType = Object.fromEntries(records.map(r => [r.mealType, r])) as Record<string, MealRecord>;
  const totalCal   = records.reduce((s, r) => s + r.totalCalories, 0);
  const totalFoods = records.reduce((s, r) => s + r.foods.length, 0);
  const allFoods   = records.flatMap(r => r.foods);
  const avgScore   = allFoods.length
    ? Number((allFoods.reduce((s, f) => s + (f.healthScore ?? 5), 0) / allFoods.length).toFixed(1))
    : null;
  const totalBurned = exercises.reduce((s, e) => s + e.caloriesBurned, 0);

  const isToday    = (d: Date) => d.toDateString() === new Date().toDateString();
  const isSelected = (d: Date) => d.toDateString() === date.toDateString();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daily Log</Text>
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

          {/* Exercise Section */}
          <View style={styles.exSection}>
            <View style={styles.exSectionHeader}>
              <Text style={styles.exSectionTitle}>Exercise</Text>
              <TouchableOpacity style={styles.exAddBtn}
                onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowExModal(true); }}
                activeOpacity={0.75}>
                <Ionicons name="add" size={18} color={Colors.primary} />
                <Text style={styles.exAddBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {exercises.length === 0 ? (
              <TouchableOpacity style={styles.exEmpty}
                onPress={() => setShowExModal(true)} activeOpacity={0.6}>
                <Ionicons name="walk-outline" size={22} color={Colors.textTertiary} />
                <Text style={styles.exEmptyText}>Log your workout</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.exList}>
                {exercises.map((ex, i) => (
                  <View key={ex.id}>
                    <View style={styles.exRow}>
                      <View style={[styles.exIconWrap, { backgroundColor: Colors.green + '18' }]}>
                        <Ionicons name={EXERCISE_META[ex.type].icon as any} size={18} color={Colors.green} />
                      </View>
                      <View style={styles.exInfo}>
                        <Text style={styles.exName}>{EXERCISE_META[ex.type].label}</Text>
                        <Text style={styles.exMeta}>{ex.durationMinutes} min</Text>
                      </View>
                      <View style={styles.exRight}>
                        <Text style={styles.exCal}>-{ex.caloriesBurned} kcal</Text>
                        <TouchableOpacity onPress={async () => {
                          await exerciseService.deleteRecord(date, ex.id);
                          loadExercises(date);
                        }} activeOpacity={0.7}>
                          <Ionicons name="trash-outline" size={16} color={Colors.textTertiary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {i < exercises.length - 1 && <View style={styles.exDivider} />}
                  </View>
                ))}
                {totalBurned > 0 && (
                  <View style={styles.exTotalRow}>
                    <Text style={styles.exTotalLabel}>Total burned</Text>
                    <Text style={styles.exTotalVal}>-{totalBurned} kcal</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onAdd} activeOpacity={0.85}>
        <Ionicons name="camera" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Exercise Log Modal */}
      <Modal visible={showExModal} transparent animationType="slide" onRequestClose={() => setShowExModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Log Exercise</Text>

            {/* Type selector */}
            <Text style={styles.modalLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exTypeRow}>
              {(Object.keys(EXERCISE_META) as ExerciseType[]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.exTypeChip, exType === t && styles.exTypeChipOn]}
                  onPress={async () => { await Haptics.selectionAsync(); setExType(t); }}
                  activeOpacity={0.75}
                >
                  <Ionicons name={EXERCISE_META[t].icon as any} size={16}
                    color={exType === t ? '#fff' : Colors.textSecondary} />
                  <Text style={[styles.exTypeLabel, exType === t && { color: '#fff' }]}>
                    {EXERCISE_META[t].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Duration */}
            <Text style={styles.modalLabel}>Duration (minutes)</Text>
            <View style={styles.durationRow}>
              {['15','30','45','60'].map(d => (
                <TouchableOpacity key={d}
                  style={[styles.durationChip, exDuration === d && styles.durationChipOn]}
                  onPress={() => setExDuration(d)} activeOpacity={0.75}>
                  <Text style={[styles.durationLabel, exDuration === d && { color: '#fff' }]}>{d}</Text>
                </TouchableOpacity>
              ))}
              <TextInput
                style={styles.durationInput}
                value={exDuration}
                onChangeText={setExDuration}
                keyboardType="number-pad"
                placeholder="custom"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <Text style={styles.estimateText}>
              Est. {estimateCalories(exType, parseInt(exDuration) || 0)} kcal burned
            </Text>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowExModal(false)} activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleAddExercise} activeOpacity={0.85}>
                <Text style={styles.modalSaveText}>Log It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  // Exercise section
  exSection: { backgroundColor: Colors.cardBackground, borderRadius: Radius.xxl, marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.card },
  exSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.separator },
  exSectionTitle: { ...Type.headline, color: Colors.text },
  exAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '15', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill },
  exAddBtnText: { ...Type.subhead, color: Colors.primary, fontWeight: '600' },
  exEmpty: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  exEmptyText: { ...Type.callout, color: Colors.textTertiary },
  exList: {},
  exRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  exIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  exInfo: { flex: 1 },
  exName: { ...Type.callout, fontWeight: '600', color: Colors.text },
  exMeta: { ...Type.caption, color: Colors.textSecondary, marginTop: 2 },
  exRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  exCal: { ...Type.callout, color: Colors.green, fontWeight: '600' },
  exDivider: { height: 0.5, backgroundColor: Colors.separator, marginLeft: 38 + Spacing.md + Spacing.lg },
  exTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 0.5, borderTopColor: Colors.separator },
  exTotalLabel: { ...Type.callout, color: Colors.textSecondary },
  exTotalVal: { ...Type.callout, fontWeight: '700', color: Colors.green },
  // Exercise Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: Colors.cardBackground, borderTopLeftRadius: Radius.xxxl, borderTopRightRadius: Radius.xxxl, padding: Spacing.xl, paddingBottom: 44 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.separator, alignSelf: 'center', marginBottom: Spacing.xl },
  modalTitle: { ...Type.title2, color: Colors.text, marginBottom: Spacing.lg },
  modalLabel: { ...Type.subhead, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  exTypeRow: { gap: Spacing.sm, paddingBottom: Spacing.sm },
  exTypeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.systemFill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill },
  exTypeChipOn: { backgroundColor: Colors.primary },
  exTypeLabel: { ...Type.subhead, color: Colors.textSecondary },
  durationRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.sm },
  durationChip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.pill, backgroundColor: Colors.systemFill },
  durationChipOn: { backgroundColor: Colors.primary },
  durationLabel: { ...Type.callout, fontWeight: '600', color: Colors.textSecondary },
  durationInput: { flex: 1, borderWidth: 1, borderColor: Colors.separator, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, ...Type.callout, color: Colors.text, minWidth: 80 },
  estimateText: { ...Type.subhead, color: Colors.green, fontWeight: '600', marginVertical: Spacing.md },
  modalBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  modalCancel: { flex: 1, paddingVertical: 15, borderRadius: Radius.pill, backgroundColor: Colors.systemFill, alignItems: 'center' },
  modalCancelText: { ...Type.headline, color: Colors.text },
  modalSave: { flex: 2, paddingVertical: 15, borderRadius: Radius.pill, backgroundColor: Colors.primary, alignItems: 'center', ...Shadow.button },
  modalSaveText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
