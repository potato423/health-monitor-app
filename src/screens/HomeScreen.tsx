import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow, Type } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { foodRecognitionService, FoodAnalysisResult } from '../services/foodRecognition';
import { databaseService } from '../services/database';

type HomeNav = StackNavigationProp<RootStackParamList>;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const sw = size * 0.085;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score / 10,
      duration: 1400,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const offset = anim.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] });
  const color = score >= 8 ? Colors.green : score >= 6 ? Colors.blue : score >= 4 ? Colors.orange : Colors.red;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={Colors.systemFill} strokeWidth={sw} fill="none" />
        <AnimatedCircle
          cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth={sw} fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </Svg>
      <Text style={[styles.ringVal, { color, fontSize: size * 0.25 }]}>
        {score > 0 ? score.toFixed(1) : '—'}
      </Text>
      <Text style={styles.ringLabel}>/ 10</Text>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const TIPS = [
  { icon: 'water-outline' as const,   color: Colors.teal,   title: 'Stay Hydrated', body: 'Drink 2 L of water today to help flush uric acid from your system.' },
  { icon: 'leaf-outline' as const,    color: Colors.green,  title: 'Load Up on Greens', body: "You've had little vegetable intake today — add leafy greens at your next meal." },
  { icon: 'walk-outline' as const,    color: Colors.blue,   title: 'Move After Meals', body: 'A 10-minute walk after eating helps blunt blood sugar spikes by up to 30%.' },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const [scanning, setScanning] = useState(false);
  const [score, setScore] = useState(0);
  const [meals, setMeals] = useState(0);
  const [calories, setCalories] = useState(0);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.025, duration: 1500, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,     duration: 1500, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  useFocusEffect(useCallback(() => {
    databaseService.getMealRecords(new Date()).then((recs) => {
      const allFoods = recs.flatMap(r => r.foods);
      setMeals(recs.length);
      setCalories(recs.reduce((s, r) => s + r.totalCalories, 0));
      setScore(allFoods.length > 0
        ? Number((allFoods.reduce((s, f) => s + (f.healthScore ?? 5), 0) / allFoods.length).toFixed(1))
        : 0);
    }).catch(() => {});
  }, []));

  const openCamera = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanning(true);
    try {
      const result = await foodRecognitionService.captureFromCamera();
      if (result) navigation.navigate('FoodResult', { analysisResult: result });
    } catch {
      Alert.alert('Recognition Failed', 'Please try again or add food manually.');
    } finally {
      setScanning(false);
    }
  };

  const openLibrary = async () => {
    await Haptics.selectionAsync();
    setScanning(true);
    try {
      const result = await foodRecognitionService.captureFromLibrary();
      if (result) navigation.navigate('FoodResult', { analysisResult: result });
    } catch {
      Alert.alert('Recognition Failed', 'Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const scoreColor = score >= 8 ? Colors.green : score >= 6 ? Colors.blue : score >= 4 ? Colors.orange : Colors.red;
  const scoreText  = score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Fair' : score > 0 ? 'Needs Work' : 'No Data Yet';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.dateLabel}>{todayLabel()}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={async () => { await Haptics.selectionAsync(); navigation.navigate('Profile'); }}
            activeOpacity={0.75}
          >
            <Ionicons name="person-circle-outline" size={36} color={Colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Today Score Card ── */}
        <Animated.View style={[styles.scoreCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreCardTitle}>Today's Health Score</Text>
            <View style={[styles.scoreStatusPill, { backgroundColor: scoreColor + '18' }]}>
              <View style={[styles.scoreStatusDot, { backgroundColor: scoreColor }]} />
              <Text style={[styles.scoreStatusText, { color: scoreColor }]}>{scoreText}</Text>
            </View>
            <View style={styles.scoreMetaRow}>
              <View style={styles.scoreMeta}>
                <Text style={styles.scoreMetaVal}>{meals > 0 ? meals : '—'}</Text>
                <Text style={styles.scoreMetaKey}>Meals</Text>
              </View>
              <View style={[styles.scoreMetaDivider]} />
              <View style={styles.scoreMeta}>
                <Text style={styles.scoreMetaVal}>{calories > 0 ? calories : '—'}</Text>
                <Text style={styles.scoreMetaKey}>kcal</Text>
              </View>
            </View>
          </View>
          <ScoreRing score={score} size={110} />
        </Animated.View>

        {/* ── Primary Scan CTA ── */}
        <Animated.View style={[styles.ctaWrap, { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={[styles.ctaButton, scanning && { opacity: 0.75 }]}
            onPress={openCamera}
            disabled={scanning}
            activeOpacity={0.88}
          >
            <View style={styles.ctaIconRing}>
              {scanning
                ? <ActivityIndicator color="#fff" size="large" />
                : <Ionicons name="camera" size={36} color="#fff" />}
            </View>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>
                {scanning ? 'Analyzing…' : 'Scan Your Food'}
              </Text>
              <Text style={styles.ctaSub}>
                {scanning ? 'AI is assessing health impact' : 'AI rates every meal for your conditions'}
              </Text>
            </View>
            {!scanning && <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.55)" />}
          </TouchableOpacity>
        </Animated.View>

        {/* ── Quick Actions ── */}
        <Animated.View style={[styles.quickRow, { opacity: fadeAnim }]}>
          {[
            { icon: 'images-outline', label: 'Photo Library', sub: 'Pick an image', color: Colors.green,  bg: '#D1FAE5', onPress: openLibrary },
            { icon: 'search-outline', label: 'Search Food',   sub: 'Type to add',   color: Colors.orange, bg: '#FEF3C7', onPress: () => navigation.navigate('FoodResult', { analysisResult: undefined }) },
            { icon: 'star-outline',   label: 'Favorites',     sub: 'Quick log',     color: Colors.purple, bg: '#EDE9FE', onPress: () => {} },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.quickCard} onPress={item.onPress} activeOpacity={0.75}>
              <View style={[styles.quickIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Text style={styles.quickSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ── Insight Tips ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Insights</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>
          {TIPS.map((tip, i) => (
            <TouchableOpacity key={i} style={styles.tipCard} activeOpacity={0.75}>
              <View style={[styles.tipIcon, { backgroundColor: tip.color + '18' }]}>
                <Ionicons name={tip.icon} size={20} color={tip.color} />
              </View>
              <View style={styles.tipBody}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.body}</Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ── Upgrade Banner ── */}
        <TouchableOpacity
          style={styles.upgradeBanner}
          onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('Paywall'); }}
          activeOpacity={0.88}
        >
          <View style={styles.upgradeLeft}>
            <View style={styles.upgradeIconWrap}>
              <Ionicons name="sparkles" size={18} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.upgradeTitle}>Unlock Full Access</Text>
              <Text style={styles.upgradeSub}>Trial ended · Upgrade to continue</Text>
            </View>
          </View>
          <View style={styles.upgradeChevron}>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { paddingBottom: 20 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  greeting:  { ...Type.largeTitle, color: Colors.text },
  dateLabel: { ...Type.subhead, color: Colors.textSecondary, marginTop: 3 },
  avatarBtn: { padding: 4 },

  scoreCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl, marginTop: Spacing.sm,
    borderRadius: Radius.xxl, padding: Spacing.xl,
    ...Shadow.card,
  },
  scoreLeft:        { flex: 1, paddingRight: Spacing.md },
  scoreCardTitle:   { ...Type.headline, color: Colors.text },
  scoreStatusPill:  { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, marginTop: Spacing.sm, gap: 5 },
  scoreStatusDot:   { width: 7, height: 7, borderRadius: 3.5 },
  scoreStatusText:  { ...Type.subhead, fontWeight: '700' as const },
  scoreMetaRow:     { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.lg },
  scoreMeta:        {},
  scoreMetaVal:     { fontSize: 22, fontWeight: '700' as const, color: Colors.text },
  scoreMetaKey:     { ...Type.caption, color: Colors.textSecondary, marginTop: 1 },
  scoreMetaDivider: { width: 1, height: 28, backgroundColor: Colors.separator },
  ringVal:          { fontWeight: '800' as const, textAlign: 'center' },
  ringLabel:        { ...Type.caption, color: Colors.textSecondary, textAlign: 'center' },

  ctaWrap:   { paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xxl, padding: Spacing.xl,
    ...Shadow.button,
  },
  ctaIconRing: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText:  { flex: 1, marginLeft: Spacing.lg },
  ctaTitle: { fontSize: 19, fontWeight: '700' as const, color: '#fff', letterSpacing: -0.2 },
  ctaSub:   { ...Type.callout, color: 'rgba(255,255,255,0.72)', marginTop: 3 },

  quickRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, marginTop: Spacing.lg, gap: Spacing.md },
  quickCard: {
    flex: 1, backgroundColor: Colors.cardBackground,
    borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center',
    ...Shadow.xs,
  },
  quickIcon:  { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  quickLabel: { ...Type.subhead, fontWeight: '600' as const, color: Colors.text, textAlign: 'center' },
  quickSub:   { ...Type.caption, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, marginTop: Spacing.xxl, marginBottom: Spacing.md },
  sectionTitle:  { ...Type.title3, color: Colors.text },
  sectionLink:   { ...Type.subhead, color: Colors.primary },

  tipCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.sm,
    borderRadius: Radius.xl, padding: Spacing.lg,
    gap: Spacing.md, ...Shadow.xs,
  },
  tipIcon:  { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipBody:  { flex: 1 },
  tipTitle: { ...Type.callout, fontWeight: '600' as const, color: Colors.text },
  tipText:  { ...Type.footnote, color: Colors.textSecondary, marginTop: 3, lineHeight: 17 },

  upgradeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    marginHorizontal: Spacing.xl, marginTop: Spacing.lg,
    borderRadius: Radius.xl, padding: Spacing.lg,
  },
  upgradeLeft:    { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.md },
  upgradeIconWrap:{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(245,158,11,0.18)', alignItems: 'center', justifyContent: 'center' },
  upgradeTitle:   { ...Type.callout, fontWeight: '600' as const, color: '#fff' },
  upgradeSub:     { ...Type.caption, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  upgradeChevron: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
});
