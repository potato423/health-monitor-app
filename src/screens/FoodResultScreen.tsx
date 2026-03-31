import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Animated, Dimensions, Alert, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow, Type } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { FoodAnalysisResult } from '../services/foodRecognition';
import { mealService } from '../services/mealService';

type RouteT = RouteProp<RootStackParamList, 'FoodResult'>;
const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const NUT_W = (width - Spacing.xl * 2 - Spacing.md * 2) / 3;

// ─── Fallback data ────────────────────────────────────────────────────────────
const FALLBACK: FoodAnalysisResult = {
  id: 'demo',
  name: 'Braised Pork Belly',
  nameEn: 'Braised Pork Belly',
  calories: 395, protein: 13.7, fat: 28.8, carbs: 8.2,
  sodium: 860, potassium: 320, phosphorus: 180, purines: 132,
  healthScore: 3.2, healthStatus: 'red', quantitySuggestion: 'small',
  reason: 'High in purines (132 mg/100g) which can spike uric acid. High saturated fat worsens cholesterol.',
  cookingAdvice: 'Blanch before braising to cut purines. Reduce soy sauce by half.',
  servingOptions: [25, 50, 75, 100],
  alternatives: ['Steamed Fish', 'Chicken Breast', 'Tofu'],
  alternativeDetails: [
    { name: 'Steamed Fish', nameEn: 'Steamed Fish', status: 'green', desc: 'Low-purine, high-protein — ideal for gout' },
    { name: 'Chicken Breast', nameEn: 'Chicken Breast', status: 'green', desc: 'Lean protein, minimal purines and fat' },
    { name: 'Tofu', nameEn: 'Tofu', status: 'yellow', desc: 'Plant protein; moderate purines — eat in moderation' },
  ],
  cookingTips: [
    'Blanch first in boiling water to remove excess purines',
    'Use half the soy sauce to significantly lower sodium',
    'Pair with bitter melon or celery to support uric acid metabolism',
  ],
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const SIZE = 78, SW = 7, R = (SIZE - SW) / 2, C = 2 * Math.PI * R;
  useEffect(() => {
    Animated.timing(anim, { toValue: score / 10, duration: 1000, useNativeDriver: false }).start();
  }, [score]);
  const offset = anim.interpolate({ inputRange: [0, 1], outputRange: [C, 0] });
  const color = score >= 8 ? Colors.green : score >= 6 ? Colors.blue : score >= 4 ? Colors.orange : Colors.red;
  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle cx={SIZE/2} cy={SIZE/2} r={R} stroke={Colors.systemFill} strokeWidth={SW} fill="none" />
        <AnimatedCircle cx={SIZE/2} cy={SIZE/2} r={R} stroke={color} strokeWidth={SW} fill="none"
          strokeDasharray={`${C} ${C}`} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`} />
      </Svg>
      <Text style={[styles.ringVal, { color }]}>{score.toFixed(1)}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function FoodResultScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteT>();
  const food: FoodAnalysisResult = route.params?.analysisResult ?? FALLBACK;
  const imageUri: string | undefined = (food as any)._imageUri;

  const [serving, setServing]   = useState(Math.floor((food.servingOptions?.length ?? 4) / 2));
  const [recording, setRecording] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(36)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 11, useNativeDriver: true }),
    ]).start();
  }, []);

  const statusColor = food.healthStatus === 'green' ? Colors.green : food.healthStatus === 'yellow' ? Colors.orange : Colors.red;
  const statusLabel = food.healthStatus === 'green' ? 'Good to Eat' : food.healthStatus === 'yellow' ? 'Eat with Caution' : 'Best to Avoid';
  const servingOptions = food.servingOptions ?? [50, 100, 150, 200];
  const altDetails: any[] = (food as any).alternativeDetails ?? food.alternatives.map((n: string) => ({ name: n, nameEn: n, status: 'green', desc: '' }));

  const nutrients = [
    { label: 'Calories', value: String(food.calories), unit: 'kcal', icon: 'flame-outline',        warn: food.calories > 300 },
    { label: 'Purines',  value: String(food.purines),  unit: 'mg',   icon: 'water-outline',        warn: food.purines > 100 },
    { label: 'Fat',      value: String(food.fat),      unit: 'g',    icon: 'fitness-outline',      warn: food.fat > 20 },
    { label: 'Protein',  value: String(food.protein),  unit: 'g',    icon: 'barbell-outline',      warn: false },
    { label: 'Carbs',    value: String(food.carbs),    unit: 'g',    icon: 'leaf-outline',         warn: false },
    { label: 'Sodium',   value: String(food.sodium),   unit: 'mg',   icon: 'alert-circle-outline', warn: food.sodium > 600 },
  ];

  const doRecord = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setRecording(true);
    try {
      await mealService.recordMeal([{
        id: food.id, name: food.name, calories: food.calories,
        protein: food.protein, fat: food.fat, carbs: food.carbs,
        sodium: food.sodium, potassium: food.potassium, phosphorus: food.phosphorus,
        purines: food.purines, healthScore: food.healthScore, healthStatus: food.healthStatus,
        quantitySuggestion: food.quantitySuggestion, alternatives: food.alternatives, cookingTips: food.cookingTips,
      }], mealType);
      const label = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }[mealType];
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Logged!', `${food.name} (${servingOptions[serving]}g) added to ${label}`, [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Failed to Log', 'Please try again.');
    } finally {
      setRecording(false);
    }
  };

  const handleRecord = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Add to which meal?', undefined, [
      { text: 'Breakfast', onPress: () => doRecord('breakfast') },
      { text: 'Lunch',     onPress: () => doRecord('lunch') },
      { text: 'Dinner',    onPress: () => doRecord('dinner') },
      { text: 'Snack',     onPress: () => doRecord('snack') },
      { text: 'Cancel',    style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Nav */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-down" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Food Analysis</Text>
        <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero Image */}
        <Animated.View style={[styles.heroWrap, { opacity: fadeAnim }]}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
            : (
              <View style={styles.heroPlaceholder}>
                <Ionicons name="image-outline" size={52} color="rgba(255,255,255,0.25)" />
                <Text style={styles.heroPlaceholderText}>Food photo</Text>
              </View>
            )
          }
          <View style={[styles.heroPill, { backgroundColor: statusColor }]}>
            <Text style={styles.heroPillText}>{statusLabel}</Text>
          </View>
        </Animated.View>

        {/* Identity */}
        <Animated.View style={[styles.identityCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.identityLeft}>
            <Text style={styles.foodName}>{food.name}</Text>
            {(food as any).nameEn && food.name !== (food as any).nameEn && (
              <Text style={styles.foodNameAlt}>{(food as any).nameEn}</Text>
            )}
            <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <ScoreRing score={food.healthScore} />
        </Animated.View>

        {/* Reason */}
        {!!(food as any).reason && (
          <View style={[styles.reasonBanner, { backgroundColor: statusColor + '12', borderColor: statusColor + '40' }]}>
            <Ionicons name="information-circle" size={18} color={statusColor} />
            <Text style={[styles.reasonText, { color: statusColor }]}>{(food as any).reason}</Text>
          </View>
        )}

        {/* Serving */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Serving Size</Text>
          <Text style={styles.cardSub}>
            {food.quantitySuggestion === 'small'    ? 'Keep it under 50g — limit frequency'
            : food.quantitySuggestion === 'moderate' ? 'Stick to 50–100g portions'
            :                                          '100–200g is fine as part of a balanced meal'}
          </Text>
          <View style={styles.servingRow}>
            {servingOptions.map((opt, i) => (
              <TouchableOpacity key={i}
                style={[styles.servingChip, serving === i && styles.servingChipOn]}
                onPress={async () => { await Haptics.selectionAsync(); setServing(i); }}
                activeOpacity={0.75}>
                <Text style={[styles.servingText, serving === i && styles.servingTextOn]}>{opt}g</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nutrition Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          <Text style={styles.sectionSub}>per 100g</Text>
        </View>
        <View style={styles.nutGrid}>
          {nutrients.map((n, i) => (
            <View key={i} style={[styles.nutCard, n.warn && styles.nutCardWarn]}>
              {n.warn && <View style={styles.warnDot} />}
              <View style={[styles.nutIcon, { backgroundColor: n.warn ? Colors.red + '14' : Colors.primary + '14' }]}>
                <Ionicons name={n.icon as any} size={16} color={n.warn ? Colors.red : Colors.primary} />
              </View>
              <Text style={styles.nutLabel}>{n.label}</Text>
              <View style={styles.nutValRow}>
                <Text style={[styles.nutVal, n.warn && { color: Colors.red }]}>{n.value}</Text>
                <Text style={styles.nutUnit}>{n.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Cooking Advice */}
        {!!(food as any).cookingAdvice && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cooking Tip</Text>
            </View>
            <View style={styles.adviceCard}>
              <View style={styles.adviceIconWrap}>
                <Ionicons name="bulb" size={22} color={Colors.orange} />
              </View>
              <Text style={styles.adviceText}>{(food as any).cookingAdvice}</Text>
            </View>
          </>
        )}

        {/* Healthier Alternatives */}
        {altDetails.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
            </View>
            <View style={styles.listCard}>
              {altDetails.map((alt: any, i: number) => {
                const c = alt.status === 'green' ? Colors.green : alt.status === 'yellow' ? Colors.orange : Colors.red;
                return (
                  <View key={i}>
                    <View style={styles.altRow}>
                      <View style={[styles.altDot, { backgroundColor: c }]} />
                      <View style={styles.altMid}>
                        <Text style={styles.altName}>{alt.nameEn || alt.name}</Text>
                        {!!alt.desc && <Text style={styles.altDesc}>{alt.desc}</Text>}
                      </View>
                      <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                    </View>
                    {i < altDetails.length - 1 && <View style={[styles.innerDiv, { marginLeft: Spacing.lg + 10 + Spacing.md }]} />}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Cooking Tips */}
        {food.cookingTips.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Preparation Tips</Text>
            </View>
            <View style={styles.listCard}>
              {food.cookingTips.map((tip, i) => (
                <View key={i} style={[styles.tipRow, i < food.cookingTips.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: Colors.separator }]}>
                  <View style={styles.tipNum}>
                    <Text style={styles.tipNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Medical disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.disclaimerText}>
            For informational purposes only. Not medical advice. Always consult your doctor before changing your diet.
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.logBtn, recording && { opacity: 0.7 }]}
          onPress={handleRecord}
          disabled={recording}
          activeOpacity={0.88}>
          {recording
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="add-circle" size={22} color="#fff" />
                <Text style={styles.logBtnText}>Log This Meal · {servingOptions[serving]}g</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.systemFill, alignItems: 'center', justifyContent: 'center' },
  navTitle: { ...Type.headline, color: Colors.text },
  scroll: { paddingBottom: 20 },
  heroWrap: { height: 230, marginHorizontal: Spacing.xl, borderRadius: Radius.xxxl, overflow: 'hidden', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { flex: 1, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  heroPlaceholderText: { ...Type.footnote, color: 'rgba(255,255,255,0.3)', marginTop: Spacing.sm },
  heroPill: { position: 'absolute', bottom: Spacing.md, left: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill },
  heroPillText: { ...Type.subhead, fontWeight: '700', color: '#fff' },
  identityCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.cardBackground, marginHorizontal: Spacing.xl, marginTop: Spacing.md, borderRadius: Radius.xxl, padding: Spacing.xl, ...Shadow.card },
  identityLeft: { flex: 1, marginRight: Spacing.md },
  foodName: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.4 },
  foodNameAlt: { ...Type.subhead, color: Colors.textSecondary, marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.pill, marginTop: Spacing.md, gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusPillText: { ...Type.subhead, fontWeight: '700' },
  ringVal: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  reasonBanner: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: Spacing.xl, marginTop: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm },
  reasonText: { flex: 1, ...Type.callout, lineHeight: 20, fontWeight: '500' },
  sectionCard: { backgroundColor: Colors.cardBackground, marginHorizontal: Spacing.xl, marginTop: Spacing.lg, borderRadius: Radius.xxl, padding: Spacing.xl, ...Shadow.card },
  cardTitle: { ...Type.headline, color: Colors.text },
  cardSub: { ...Type.callout, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.md },
  servingRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  servingChip: { paddingHorizontal: Spacing.lg, paddingVertical: 9, borderRadius: Radius.pill, backgroundColor: Colors.systemFill },
  servingChipOn: { backgroundColor: Colors.primary },
  servingText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  servingTextOn: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle: { ...Type.title3, color: Colors.text },
  sectionSub: { ...Type.subhead, color: Colors.textSecondary },
  nutGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  nutCard: { backgroundColor: Colors.cardBackground, borderRadius: Radius.xl, padding: Spacing.md, width: NUT_W, position: 'relative', ...Shadow.xs },
  nutCardWarn: { borderWidth: 1, borderColor: Colors.red + '35' },
  warnDot: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.red },
  nutIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  nutLabel: { ...Type.caption, color: Colors.textSecondary },
  nutValRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 2 },
  nutVal: { fontSize: 18, fontWeight: '700', color: Colors.text },
  nutUnit: { ...Type.caption, color: Colors.textSecondary },
  adviceCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.orange + '10', marginHorizontal: Spacing.xl, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.orange + '30', padding: Spacing.lg, gap: Spacing.md },
  adviceIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.orange + '20', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  adviceText: { flex: 1, ...Type.callout, color: Colors.text, lineHeight: 21 },
  listCard: { backgroundColor: Colors.cardBackground, marginHorizontal: Spacing.xl, borderRadius: Radius.xxl, overflow: 'hidden', ...Shadow.card },
  altRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  altDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.md, flexShrink: 0 },
  altMid: { flex: 1 },
  altName: { ...Type.callout, fontWeight: '600', color: Colors.text },
  altDesc: { ...Type.caption, color: Colors.textSecondary, marginTop: 2 },
  innerDiv: { height: 0.5, backgroundColor: Colors.separator },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.lg, gap: Spacing.md },
  tipNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary + '1E', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipNumText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  tipText: { flex: 1, ...Type.callout, color: Colors.text, lineHeight: 21, paddingTop: 1 },
  bottomBar: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, paddingTop: Spacing.md, backgroundColor: Colors.background, borderTopWidth: 0.5, borderTopColor: Colors.separator },
  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 17, ...Shadow.button },
  logBtnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  disclaimerText: {
    flex: 1, fontSize: 11, color: Colors.textTertiary, lineHeight: 16,
  },
});
