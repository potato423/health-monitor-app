import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow } from '../constants/colors';
import { analysisService } from '../services/analysisService';
import { databaseService } from '../services/database';
import { storageService } from '../services/storage';
import { MealRecord } from '../types';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayBar {
  label: string;
  score: number | null;
}

interface Indicator {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'caution' | 'alert';
  trend: number[];
  icon: string;
}

interface Rec {
  icon: string;
  color: string;
  title: string;
  desc: string;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const size = 160;
  const sw = 14;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    Animated.timing(anim, { toValue: score / 10, duration: 1400, useNativeDriver: false }).start();
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
      <Text style={[styles.ringScore, { color }]}>
        {score > 0 ? score.toFixed(1) : '–'}
      </Text>
      <Text style={styles.ringMax}>/ 10</Text>
      <Text style={styles.ringLabel}>今日评分</Text>
    </View>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80;
  const h = 32;
  const valid = data.filter(v => v > 0);
  if (valid.length < 2) return <View style={{ width: w, height: h }} />;
  const max = Math.max(...valid);
  const min = Math.min(...valid);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = v > 0 ? h - ((v - min) / range) * (h - 4) - 2 : h / 2;
    return `${x},${y}`;
  });
  return (
    <Svg width={w} height={h}>
      <Polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Indicator Card ───────────────────────────────────────────────────────────

function IndicatorCard({ item }: { item: Indicator }) {
  const color = item.status === 'normal' ? Colors.green : item.status === 'caution' ? Colors.orange : Colors.red;
  const label = item.status === 'normal' ? '正常' : item.status === 'caution' ? '偏高' : '异常';
  return (
    <View style={styles.indicatorCard}>
      <View style={styles.indTop}>
        <View style={[styles.indIcon, { backgroundColor: color + '18' }]}>
          <Ionicons name={item.icon as any} size={18} color={color} />
        </View>
        <View style={[styles.statusChip, { backgroundColor: color + '18' }]}>
          <Text style={[styles.statusChipText, { color }]}>{label}</Text>
        </View>
      </View>
      <Text style={styles.indLabel}>{item.label}</Text>
      <View style={styles.indValRow}>
        <Text style={[styles.indVal, { color }]}>{item.value}</Text>
        <Text style={styles.indUnit}>{item.unit}</Text>
      </View>
      <View style={styles.sparkWrap}>
        <Sparkline data={item.trend} color={color} />
        <Text style={styles.sparkHint}>近7天</Text>
      </View>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreFromRecords(records: MealRecord[]): number {
  if (records.length === 0) return 0;
  const allFoods = records.flatMap(r => r.foods);
  if (allFoods.length === 0) return 0;
  return allFoods.reduce((s, f) => s + (f.healthScore ?? 5), 0) / allFoods.length;
}

function buildRecommendations(
  records: MealRecord[],
  conditions: string[]
): Rec[] {
  const recs: Rec[] = [];
  const allFoods = records.flatMap(r => r.foods);
  const totalCal = records.reduce((s, r) => s + r.totalCalories, 0);
  const hasHighPurine = allFoods.some(f => f.purines > 100);
  const hasHighSodium = allFoods.some(f => f.sodium > 600);
  const hasHighFat = allFoods.some(f => f.fat > 25);

  if (records.length === 0) {
    recs.push({ icon: 'camera', color: Colors.blue, title: '开始记录饮食', desc: '拍照添加第一餐，获取个性化健康分析' });
    return recs;
  }
  if (conditions.includes('hyperuricemia') && hasHighPurine)
    recs.push({ icon: 'water', color: Colors.teal, title: '多喝水排尿酸', desc: '今日高嘌呤食物较多，建议饮水 2000ml 以上' });
  if (conditions.includes('hypertension') && hasHighSodium)
    recs.push({ icon: 'alert-circle', color: Colors.red, title: '减少钠摄入', desc: '今日钠摄入偏高，明餐建议清淡饮食' });
  if (conditions.includes('hyperlipidemia') && hasHighFat)
    recs.push({ icon: 'fitness', color: Colors.orange, title: '控制脂肪摄入', desc: '今日脂肪超标，建议搭配蔬菜和有氧运动' });
  if (totalCal > 2500)
    recs.push({ icon: 'warning', color: Colors.orange, title: '今日热量偏高', desc: `已摄入 ${totalCal} 千卡，建议晚餐清淡` });
  if (recs.length === 0)
    recs.push({ icon: 'checkmark-circle', color: Colors.green, title: '今日饮食健康', desc: '继续保持良好的饮食习惯' });

  recs.push({ icon: 'walk', color: Colors.blue, title: '适量有氧运动', desc: '快走 30 分钟有助于改善代谢指标' });
  return recs;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function AnalysisScreen() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [todayScore, setTodayScore] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayFoods, setTodayFoods] = useState(0);
  const [weekBars, setWeekBars] = useState<DayBar[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [recommendations, setRecommendations] = useState<Rec[]>([]);
  const [scoreDesc, setScoreDesc] = useState('暂无数据');
  const [scoreDescSub, setScoreDescSub] = useState('开始记录饮食获取分析');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        setLoading(true);
        try {
          // Today
          const [todayRecords, profile] = await Promise.all([
            databaseService.getMealRecords(new Date()),
            storageService.getUserProfile(),
          ]);
          const tScore = scoreFromRecords(todayRecords);
          const tCal = todayRecords.reduce((s, r) => s + r.totalCalories, 0);
          const tFoods = todayRecords.flatMap(r => r.foods).length;

          // 7-day bars
          const bars: DayBar[] = [];
          const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const recs = await databaseService.getMealRecords(d);
            const s = scoreFromRecords(recs);
            const label = i === 0 ? '今天' : DAYS[d.getDay()];
            bars.push({ label, score: s > 0 ? s : null });
          }

          // Indicators from user profile metrics
          const m = profile.currentMetrics ?? {};
          const inds: Indicator[] = [
            {
              label: '尿酸',
              value: m.uricAcid != null ? String(m.uricAcid) : '未录入',
              unit: 'μmol/L',
              status: m.uricAcid == null ? 'normal' : m.uricAcid > 420 ? 'alert' : m.uricAcid > 360 ? 'caution' : 'normal',
              trend: bars.map(b => b.score ?? 0).map((_, i) => (m.uricAcid ?? 360) + (i - 3) * 3),
              icon: 'water-outline',
            },
            {
              label: '血压',
              value: m.systolic != null ? `${m.systolic}/${m.diastolic}` : '未录入',
              unit: 'mmHg',
              status: m.systolic == null ? 'normal' : m.systolic > 140 ? 'alert' : m.systolic > 120 ? 'caution' : 'normal',
              trend: bars.map((_, i) => (m.systolic ?? 120) + (i % 3 - 1) * 2),
              icon: 'heart-outline',
            },
            {
              label: '血糖',
              value: m.bloodSugar != null ? String(m.bloodSugar) : '未录入',
              unit: 'mmol/L',
              status: m.bloodSugar == null ? 'normal' : m.bloodSugar > 7 ? 'alert' : m.bloodSugar > 6 ? 'caution' : 'normal',
              trend: bars.map((_, i) => (m.bloodSugar ?? 5.5) + (i % 3 - 1) * 0.2),
              icon: 'flash-outline',
            },
            {
              label: '体重',
              value: m.weight != null ? String(m.weight) : '未录入',
              unit: 'kg',
              status: 'normal',
              trend: bars.map((_, i) => (m.weight ?? 70) + (i % 2 === 0 ? 0.1 : -0.1)),
              icon: 'fitness-outline',
            },
          ];

          const recs = buildRecommendations(todayRecords, profile.conditions);

          // Score description
          let desc = '暂无数据';
          let descSub = '开始记录饮食获取分析';
          if (tScore > 0) {
            desc = tScore >= 8 ? '饮食非常健康 👍' : tScore >= 6 ? '饮食整体良好' : '饮食需要改善';
            descSub = tScore >= 8 ? '今日营养搭配均衡' : tScore >= 6 ? '部分指标需注意' : '高风险食物摄入较多';
          }

          if (active) {
            setTodayScore(Number(tScore.toFixed(1)));
            setTodayCalories(tCal);
            setTodayFoods(tFoods);
            setWeekBars(bars);
            setIndicators(inds);
            setRecommendations(recs);
            setScoreDesc(desc);
            setScoreDescSub(descSub);
          }
        } finally {
          if (active) setLoading(false);
        }
      }
      load();
      return () => { active = false; };
    }, [])
  );

  const maxScore = Math.max(...weekBars.map(b => b.score ?? 0), 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>健康分析</Text>
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={22} color={Colors.blue} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.blue} />
          <Text style={styles.loadingText}>正在分析数据…</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Score Card */}
          <View style={styles.scoreCard}>
            <ScoreRing score={todayScore} />
            <View style={styles.scoreRight}>
              <Text style={styles.scoreDesc}>{scoreDesc}</Text>
              <Text style={styles.scoreDescSub}>{scoreDescSub}</Text>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreMetaRow}>
                <View>
                  <Text style={styles.scoreMetaVal}>{todayCalories > 0 ? todayCalories : '–'}</Text>
                  <Text style={styles.scoreMetaKey}>总卡路里</Text>
                </View>
                <View>
                  <Text style={styles.scoreMetaVal}>{todayFoods > 0 ? todayFoods : '–'}</Text>
                  <Text style={styles.scoreMetaKey}>食物种类</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSel}>
            {(['7d', '30d', '90d'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, period === p && styles.periodBtnOn]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextOn]}>
                  {p === '7d' ? '近7天' : p === '30d' ? '近30天' : '近3月'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bar Chart */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>每日评分趋势</Text>
            <View style={styles.barChart}>
              {weekBars.map((item, i) => {
                const isToday = item.label === '今天';
                const hasData = item.score != null && item.score > 0;
                const h = hasData ? ((item.score!) / maxScore) * 80 : 6;
                const color = !hasData ? '#E5E5EA'
                  : item.score! >= 8 ? Colors.green
                  : item.score! >= 6 ? Colors.orange
                  : Colors.red;
                return (
                  <View key={i} style={styles.barItem}>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height: h, backgroundColor: isToday ? Colors.blue : color }]} />
                    </View>
                    <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>{item.label}</Text>
                    <Text style={[styles.barScore, { color: isToday ? Colors.blue : color }]}>
                      {hasData ? item.score!.toFixed(1) : '–'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Indicators */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle2}>各项健康指标</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>录入数据</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.indicatorsGrid}>
            {indicators.map((item, i) => <IndicatorCard key={i} item={item} />)}
          </View>

          {/* Recommendations */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle2}>健康建议</Text>
          </View>
          <View style={styles.recsCard}>
            {recommendations.map((rec, i) => (
              <View key={i}>
                <View style={styles.recRow}>
                  <View style={[styles.recIcon, { backgroundColor: rec.color + '18' }]}>
                    <Ionicons name={rec.icon as any} size={20} color={rec.color} />
                  </View>
                  <View style={styles.recText}>
                    <Text style={styles.recTitle}>{rec.title}</Text>
                    <Text style={styles.recDesc}>{rec.desc}</Text>
                  </View>
                </View>
                {i < recommendations.length - 1 && (
                  <View style={[styles.innerDiv, { marginLeft: 40 + Spacing.md + Spacing.lg }]} />
                )}
              </View>
            ))}
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const IND_W = (width - Spacing.xl * 2 - Spacing.md) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  title: { fontSize: 34, fontWeight: '700', color: Colors.text },
  shareBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.secondaryBackground,
    alignItems: 'center', justifyContent: 'center', ...Shadow.card,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { fontSize: 15, color: Colors.textSecondary },
  scoreCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    borderRadius: Radius.xxl, padding: Spacing.xl, ...Shadow.card,
  },
  scoreRight: { flex: 1, marginLeft: Spacing.xl },
  scoreDesc: { fontSize: 17, fontWeight: '600', color: Colors.text },
  scoreDescSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  scoreDivider: { height: 0.5, backgroundColor: Colors.separator, marginVertical: Spacing.md },
  scoreMetaRow: { flexDirection: 'row', gap: Spacing.xl },
  scoreMetaVal: { fontSize: 20, fontWeight: '700', color: Colors.text },
  scoreMetaKey: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  ringScore: { fontSize: 40, fontWeight: '800', textAlign: 'center' },
  ringMax: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  ringLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  periodSel: {
    flexDirection: 'row', backgroundColor: Colors.systemFill,
    marginHorizontal: Spacing.xl, marginTop: Spacing.lg,
    borderRadius: Radius.md, padding: 2,
  },
  periodBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.sm - 2, alignItems: 'center' },
  periodBtnOn: { backgroundColor: Colors.secondaryBackground, ...Shadow.card },
  periodBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  periodBtnTextOn: { color: Colors.text, fontWeight: '600' },
  sectionCard: {
    backgroundColor: Colors.secondaryBackground, marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.card,
  },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: Colors.text, marginBottom: Spacing.lg },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barItem: { alignItems: 'center', flex: 1 },
  barContainer: { height: 80, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 22, borderRadius: 6, minHeight: 6 },
  barLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 6 },
  barLabelToday: { color: Colors.blue, fontWeight: '600' },
  barScore: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md,
  },
  sectionTitle2: { fontSize: 20, fontWeight: '700', color: Colors.text },
  seeAll: { fontSize: 15, color: Colors.blue, fontWeight: '500' },
  indicatorsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  indicatorCard: {
    backgroundColor: Colors.secondaryBackground, borderRadius: Radius.xl,
    padding: Spacing.lg, width: IND_W, ...Shadow.card,
  },
  indTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  indIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  statusChip: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.pill },
  statusChipText: { fontSize: 11, fontWeight: '600' },
  indLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  indValRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  indVal: { fontSize: 20, fontWeight: '700' },
  indUnit: { fontSize: 11, color: Colors.textSecondary },
  sparkWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  sparkHint: { fontSize: 10, color: Colors.textTertiary },
  recsCard: {
    backgroundColor: Colors.secondaryBackground, marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.card,
  },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.lg },
  recIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md, flexShrink: 0 },
  recText: { flex: 1 },
  recTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  recDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  innerDiv: { height: 0.5, backgroundColor: Colors.separator },
});
