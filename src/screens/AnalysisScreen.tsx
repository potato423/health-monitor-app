import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow } from '../constants/colors';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Ring Score ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const size = 160;
  const strokeWidth = 14;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    Animated.timing(anim, { toValue: score / 10, duration: 1400, useNativeDriver: false }).start();
  }, []);

  const offset = anim.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] });
  const color = score >= 8 ? Colors.green : score >= 6 ? Colors.orange : Colors.red;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E5EA" strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[styles.ringScore, { color }]}>{score.toFixed(1)}</Text>
      <Text style={styles.ringMax}>/ 10</Text>
      <Text style={styles.ringLabel}>今日评分</Text>
    </View>
  );
}

// ─── Mini Trend Sparkline ──────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80;
  const h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  return (
    <Svg width={w} height={h}>
      <Polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Indicator Card ────────────────────────────────────────────────────────────
interface Indicator {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'caution' | 'alert';
  trend: number[];
  icon: string;
}

function IndicatorCard({ item }: { item: Indicator }) {
  const color = item.status === 'normal' ? Colors.green : item.status === 'caution' ? Colors.orange : Colors.red;
  const statusLabel = item.status === 'normal' ? '正常' : item.status === 'caution' ? '偏高' : '异常';

  return (
    <View style={styles.indicatorCard}>
      <View style={styles.indicatorTop}>
        <View style={[styles.indicatorIconWrap, { backgroundColor: color + '18' }]}>
          <Ionicons name={item.icon as any} size={18} color={color} />
        </View>
        <View style={[styles.statusChip, { backgroundColor: color + '18' }]}>
          <Text style={[styles.statusChipText, { color }]}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={styles.indicatorLabel}>{item.label}</Text>
      <View style={styles.indicatorValueRow}>
        <Text style={[styles.indicatorValue, { color }]}>{item.value}</Text>
        <Text style={styles.indicatorUnit}>{item.unit}</Text>
      </View>
      <View style={styles.sparklineWrap}>
        <Sparkline data={item.trend} color={color} />
        <Text style={styles.sparklineHint}>近7天</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
const INDICATORS: Indicator[] = [
  { label: '尿酸', value: '362', unit: 'μmol/L', status: 'normal', trend: [380, 370, 360, 375, 362, 358, 362], icon: 'water-outline' },
  { label: '血压', value: '118/76', unit: 'mmHg', status: 'normal', trend: [125, 120, 118, 122, 119, 117, 118], icon: 'heart-outline' },
  { label: '血糖', value: '5.8', unit: 'mmol/L', status: 'caution', trend: [5.2, 5.4, 5.9, 6.1, 5.8, 5.7, 5.8], icon: 'flash-outline' },
  { label: '血脂', value: '2.1', unit: 'mmol/L', status: 'caution', trend: [1.8, 1.9, 2.0, 2.2, 2.1, 2.3, 2.1], icon: 'fitness-outline' },
];

const WEEK_SCORES = [
  { day: '周一', score: 8.2 },
  { day: '周二', score: 7.8 },
  { day: '周三', score: 6.9 },
  { day: '周四', score: 7.5 },
  { day: '周五', score: 8.0 },
  { day: '周六', score: 7.2 },
  { day: '今天', score: 7.5 },
];

const RECOMMENDATIONS = [
  { icon: 'water', color: Colors.teal, title: '增加饮水量', desc: '每日建议 2000ml 以上，有助于尿酸排泄' },
  { icon: 'leaf', color: Colors.green, title: '多摄入绿叶蔬菜', desc: '今日蔬菜摄入量低于推荐值 300g' },
  { icon: 'ban', color: Colors.red, title: '控制高嘌呤食物', desc: '动物内脏、海鲜、红肉本周摄入偏多' },
  { icon: 'walk', color: Colors.blue, title: '适量有氧运动', desc: '快走 30 分钟有助于改善血糖代谢' },
];

export default function AnalysisScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const maxScore = Math.max(...WEEK_SCORES.map((s) => s.score));
  const barHeight = 80;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>健康分析</Text>
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={22} color={Colors.blue} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <ScoreRing score={7.5} />
          <View style={styles.scoreRight}>
            <Text style={styles.scoreDesc}>饮食整体良好</Text>
            <Text style={styles.scoreDescSub}>血糖偏高，注意控制主食</Text>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreMetaRow}>
              <View style={styles.scoreMeta}>
                <Text style={styles.scoreMetaValue}>1,240</Text>
                <Text style={styles.scoreMetaKey}>总卡路里</Text>
              </View>
              <View style={styles.scoreMeta}>
                <Text style={styles.scoreMetaValue}>3</Text>
                <Text style={styles.scoreMetaKey}>食物种类</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['7d', '30d', '90d'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, selectedPeriod === p && styles.periodBtnActive]}
              onPress={() => setSelectedPeriod(p)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodBtnText, selectedPeriod === p && styles.periodBtnTextActive]}>
                {p === '7d' ? '近7天' : p === '30d' ? '近30天' : '近3月'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Bar Chart */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>每日评分趋势</Text>
          <View style={styles.barChart}>
            {WEEK_SCORES.map((item, i) => {
              const h = (item.score / maxScore) * barHeight;
              const color = item.score >= 8 ? Colors.green : item.score >= 6 ? Colors.orange : Colors.red;
              const isToday = item.day === '今天';
              return (
                <View key={i} style={styles.barItem}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: h, backgroundColor: isToday ? Colors.blue : color + '80' },
                        isToday && styles.barToday,
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>{item.day}</Text>
                  <Text style={[styles.barScore, { color: isToday ? Colors.blue : color }]}>
                    {item.score.toFixed(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Indicators Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle2}>各项健康指标</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>录入数据</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.indicatorsGrid}>
          {INDICATORS.map((item, i) => (
            <IndicatorCard key={i} item={item} />
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle2}>AI 健康建议</Text>
        </View>
        <View style={styles.recommendationsCard}>
          {RECOMMENDATIONS.map((rec, i) => (
            <View key={i}>
              <View style={styles.recItem}>
                <View style={[styles.recIconWrap, { backgroundColor: rec.color + '18' }]}>
                  <Ionicons name={rec.icon as any} size={20} color={rec.color} />
                </View>
                <View style={styles.recText}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recDesc}>{rec.desc}</Text>
                </View>
              </View>
              {i < RECOMMENDATIONS.length - 1 && (
                <View style={styles.recDivider} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  shareButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.secondaryBackground,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.card,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    ...Shadow.card,
  },
  scoreRight: { flex: 1, marginLeft: Spacing.xl },
  scoreDesc: { fontSize: 17, fontWeight: '600', color: Colors.text },
  scoreDescSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  scoreDivider: { height: 0.5, backgroundColor: Colors.separator, marginVertical: Spacing.md },
  scoreMetaRow: { flexDirection: 'row', gap: Spacing.xl },
  scoreMeta: {},
  scoreMetaValue: { fontSize: 20, fontWeight: '700', color: Colors.text },
  scoreMetaKey: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  ringScore: { fontSize: 40, fontWeight: '800', textAlign: 'center' },
  ringMax: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  ringLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.systemFill,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    padding: 2,
  },
  periodBtn: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.sm - 2, alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: Colors.secondaryBackground, ...Shadow.card },
  periodBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  periodBtnTextActive: { color: Colors.text, fontWeight: '600' },
  sectionCard: {
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.card,
  },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: Colors.text, marginBottom: Spacing.lg },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barItem: { alignItems: 'center', flex: 1 },
  barContainer: { height: 80, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 24, borderRadius: 6, minHeight: 6 },
  barToday: { backgroundColor: Colors.blue },
  barLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 6 },
  barLabelToday: { color: Colors.blue, fontWeight: '600' },
  barScore: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle2: { fontSize: 20, fontWeight: '700', color: Colors.text },
  seeAll: { fontSize: 15, color: Colors.blue, fontWeight: '500' },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  indicatorCard: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: (width - Spacing.xl * 2 - Spacing.md) / 2,
    ...Shadow.card,
  },
  indicatorTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  indicatorIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  statusChip: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.pill },
  statusChipText: { fontSize: 11, fontWeight: '600' },
  indicatorLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  indicatorValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  indicatorValue: { fontSize: 22, fontWeight: '700' },
  indicatorUnit: { fontSize: 11, color: Colors.textSecondary },
  sparklineWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  sparklineHint: { fontSize: 10, color: Colors.textTertiary },
  recommendationsCard: {
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.lg },
  recIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md, flexShrink: 0 },
  recText: { flex: 1 },
  recTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  recDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  recDivider: { height: 0.5, backgroundColor: Colors.separator, marginLeft: 40 + Spacing.md + Spacing.lg },
});
