import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { FoodAnalysisResult, foodRecognitionService } from '../services/foodRecognition';
import { mealService } from '../services/mealService';

type RouteT = RouteProp<RootStackParamList, 'FoodResult'>;

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const NUTRIENT_CARD_W = (width - Spacing.xl * 2 - Spacing.md * 2) / 3;

// ─── Fallback data shown when navigated without a result ─────────────────────

const FALLBACK: FoodAnalysisResult = {
  id: 'fallback',
  name: '红烧肉',
  nameEn: 'Braised Pork Belly',
  calories: 395,
  protein: 13.7,
  fat: 28.8,
  carbs: 8.2,
  sodium: 860,
  potassium: 320,
  phosphorus: 180,
  purines: 132,
  healthScore: 3.2,
  healthStatus: 'red',
  reason: '嘌呤含量高（132mg/100g），对尿酸代谢影响大；脂肪含量高，不利于血脂控制',
  quantitySuggestion: 'small',
  servingOptions: [25, 50, 75, 100],
  alternatives: ['清蒸鱼', '鸡胸肉', '豆腐'],
  alternativeDetails: [
    { name: '清蒸鱼', status: 'green', desc: '低嘌呤、高蛋白，适合尿酸高人群' },
    { name: '鸡胸肉', status: 'green', desc: '低脂低嘌呤，优质蛋白来源' },
    { name: '豆腐', status: 'yellow', desc: '植物蛋白，嘌呤中等，适量可食' },
  ],
  cookingTips: ['烹饪前先焯水可去除部分嘌呤', '减少酱油用量降低钠摄入', '搭配苦瓜或芹菜有助尿酸代谢'],
};

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const size = 76;
  const sw = 7;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    Animated.timing(anim, { toValue: score / 10, duration: 1000, useNativeDriver: false }).start();
  }, [score]);

  const offset = anim.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] });
  const color = score >= 8 ? Colors.green : score >= 6 ? Colors.orange : Colors.red;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E5EA" strokeWidth={sw} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={sw} fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
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

  const [selectedServing, setSelectedServing] = useState(
    Math.floor((food.servingOptions?.length ?? 4) / 2)
  );
  const [recording, setRecording] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 11 }),
    ]).start();
  }, []);

  const statusColor =
    food.healthStatus === 'green' ? Colors.green
    : food.healthStatus === 'yellow' ? Colors.orange
    : Colors.red;
  const statusLabel =
    food.healthStatus === 'green' ? '可以吃' : food.healthStatus === 'yellow' ? '谨慎食用' : '建议避免';

  const nutrients = [
    { label: '热量', value: String(food.calories), unit: 'kcal', icon: 'flame-outline', warn: food.calories > 300 },
    { label: '嘌呤', value: String(food.purines), unit: 'mg', icon: 'water-outline', warn: food.purines > 100 },
    { label: '脂肪', value: String(food.fat), unit: 'g', icon: 'fitness-outline', warn: food.fat > 20 },
    { label: '蛋白质', value: String(food.protein), unit: 'g', icon: 'barbell-outline', warn: false },
    { label: '碳水', value: String(food.carbs), unit: 'g', icon: 'leaf-outline', warn: false },
    { label: '钠', value: String(food.sodium), unit: 'mg', icon: 'alert-circle-outline', warn: food.sodium > 600 },
  ];

  const servingOptions = food.servingOptions ?? [50, 100, 150, 200];
  const altDetails = (food as any).alternativeDetails ?? food.alternatives.map((name: string) => ({
    name,
    status: 'green' as const,
    desc: '',
  }));

  const handleRecord = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRecording(true);
    try {
      await mealService.recordMeal(
        [{
          id: food.id,
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          fat: food.fat,
          carbs: food.carbs,
          sodium: food.sodium,
          potassium: food.potassium,
          phosphorus: food.phosphorus,
          purines: food.purines,
          healthScore: food.healthScore,
          healthStatus: food.healthStatus,
          quantitySuggestion: food.quantitySuggestion,
          alternatives: food.alternatives,
          cookingTips: food.cookingTips,
        }],
        'lunch'
      );
      Alert.alert(
        '记录成功 ✓',
        `已将 ${food.name}（${servingOptions[selectedServing]}g）添加到饮食记录`,
        [{ text: '好的', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('记录失败', '请重试');
    } finally {
      setRecording(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Nav */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-down" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>食物分析</Text>
        <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={20} color={Colors.blue} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero Image */}
        <Animated.View style={[styles.heroWrap, { opacity: fadeAnim }]}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
            : (
              <View style={styles.heroPlaceholder}>
                <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.35)" />
                <Text style={styles.heroPlaceholderText}>食物照片</Text>
              </View>
            )
          }
          {/* Status pill over image */}
          <View style={[styles.heroPill, { backgroundColor: statusColor }]}>
            <Text style={styles.heroPillText}>{statusLabel}</Text>
          </View>
        </Animated.View>

        {/* Identity Card */}
        <Animated.View style={[styles.identityCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.identityLeft}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodNameEn}>{(food as any).nameEn ?? ''}</Text>
          </View>
          <ScoreRing score={food.healthScore} />
        </Animated.View>

        {/* Reason Banner */}
        {!!(food as any).reason && (
          <View style={[styles.reasonBanner, { backgroundColor: statusColor + '14', borderColor: statusColor + '45' }]}>
            <Ionicons name="information-circle" size={18} color={statusColor} />
            <Text style={[styles.reasonText, { color: statusColor }]}>{(food as any).reason}</Text>
          </View>
        )}

        {/* Serving Size */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>建议食用量</Text>
          <Text style={styles.cardSub}>
            {food.quantitySuggestion === 'small'
              ? '每次不超过 50g，减少食用频率'
              : food.quantitySuggestion === 'moderate'
              ? '每次 50–100g，适量食用'
              : '每次 100–200g，正常食用'}
          </Text>
          <View style={styles.servingRow}>
            {servingOptions.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.servingChip, selectedServing === i && styles.servingChipOn]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setSelectedServing(i);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.servingChipText, selectedServing === i && styles.servingChipTextOn]}>
                  {opt}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nutrition Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>营养成分</Text>
          <Text style={styles.sectionSub}>每 100g</Text>
        </View>
        <View style={styles.nutrientsGrid}>
          {nutrients.map((n, i) => (
            <View key={i} style={[styles.nutrientCard, n.warn && styles.nutrientCardWarn]}>
              {n.warn && <View style={styles.warnDot} />}
              <View style={[styles.nutIconWrap, { backgroundColor: n.warn ? Colors.red + '14' : Colors.blue + '14' }]}>
                <Ionicons name={n.icon as any} size={16} color={n.warn ? Colors.red : Colors.blue} />
              </View>
              <Text style={styles.nutLabel}>{n.label}</Text>
              <View style={styles.nutValRow}>
                <Text style={[styles.nutVal, n.warn && { color: Colors.red }]}>{n.value}</Text>
                <Text style={styles.nutUnit}>{n.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Alternatives */}
        {altDetails.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>更健康的替代</Text>
            </View>
            <View style={styles.listCard}>
              {altDetails.map((alt: any, i: number) => {
                const c =
                  alt.status === 'green' ? Colors.green
                  : alt.status === 'yellow' ? Colors.orange
                  : Colors.red;
                return (
                  <View key={i}>
                    <View style={styles.altRow}>
                      <View style={[styles.altDot, { backgroundColor: c }]} />
                      <View style={styles.altMid}>
                        <Text style={styles.altName}>{alt.name}</Text>
                        {!!alt.desc && <Text style={styles.altDesc}>{alt.desc}</Text>}
                      </View>
                      <Ionicons name="add-circle-outline" size={22} color={Colors.blue} />
                    </View>
                    {i < altDetails.length - 1 && (
                      <View style={[styles.innerDivider, { marginLeft: Spacing.lg + 10 + Spacing.md }]} />
                    )}
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
              <Text style={styles.sectionTitle}>烹饪建议</Text>
            </View>
            <View style={styles.listCard}>
              {food.cookingTips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipNum}>
                    <Text style={styles.tipNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.recordBtn, recording && { opacity: 0.7 }]}
          onPress={handleRecord}
          disabled={recording}
          activeOpacity={0.88}
        >
          {recording
            ? <ActivityIndicator color="#FFFFFF" />
            : <>
                <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                <Text style={styles.recordBtnText}>
                  记录这餐（{servingOptions[selectedServing]}g）
                </Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.systemFill,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  scroll: { paddingBottom: 20 },
  heroWrap: {
    height: 220,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: Spacing.sm },
  heroPill: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  heroPillText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.card,
  },
  identityLeft: { flex: 1, marginRight: Spacing.md },
  foodName: { fontSize: 26, fontWeight: '800', color: Colors.text },
  foodNameEn: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  ringVal: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  reasonBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  reasonText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  sectionCard: {
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.card,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  cardSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.md },
  servingRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  servingChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.systemFill,
  },
  servingChipOn: { backgroundColor: Colors.blue },
  servingChipText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  servingChipTextOn: { color: '#FFFFFF' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  sectionSub: { fontSize: 13, color: Colors.textSecondary },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  nutrientCard: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    width: NUTRIENT_CARD_W,
    position: 'relative',
    ...Shadow.card,
  },
  nutrientCardWarn: { borderWidth: 1, borderColor: Colors.red + '35' },
  warnDot: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.red,
  },
  nutIconWrap: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  nutLabel: { fontSize: 11, color: Colors.textSecondary },
  nutValRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 2 },
  nutVal: { fontSize: 18, fontWeight: '700', color: Colors.text },
  nutUnit: { fontSize: 10, color: Colors.textSecondary },
  listCard: {
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  altRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  altDot: {
    width: 10, height: 10, borderRadius: 5,
    marginRight: Spacing.md, flexShrink: 0,
  },
  altMid: { flex: 1 },
  altName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  altDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  innerDivider: { height: 0.5, backgroundColor: Colors.separator },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  tipNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.blue + '1E',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  tipNumText: { fontSize: 12, fontWeight: '700', color: Colors.blue },
  tipText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20, paddingTop: 1 },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5,
    borderTopColor: Colors.separator,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.blue,
    borderRadius: Radius.pill,
    paddingVertical: 17,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  recordBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
