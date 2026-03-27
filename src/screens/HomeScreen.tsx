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
import { Colors, Spacing, Radius, Shadow } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { foodRecognitionService, FoodAnalysisResult } from '../services/foodRecognition';
import { mealService } from '../services/mealService';
import { storageService } from '../services/storage';

type HomeNav = StackNavigationProp<RootStackParamList>;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

// ─── Health Ring ──────────────────────────────────────────────────────────────

function HealthRing({ score }: { score: number }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const size = 120;
  const sw = 10;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    Animated.timing(animValue, { toValue: score / 10, duration: 1200, useNativeDriver: false }).start();
  }, [score]);

  const offset = animValue.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] });
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
      <Text style={[styles.ringScore, { color }]}>{score.toFixed(1)}</Text>
      <Text style={styles.ringMax}>/ 10</Text>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

function formatDate() {
  const now = new Date();
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`;
}

const TIPS = [
  { icon: 'water' as const, color: Colors.teal, text: '多喝水有助于促进尿酸排泄，建议每日饮水 2000ml 以上' },
  { icon: 'leaf' as const, color: Colors.green, text: '今日蔬菜摄入不足，晚餐建议增加绿叶蔬菜' },
  { icon: 'warning' as const, color: Colors.orange, text: '高嘌呤食物今日已摄入，建议控制今晚饮食' },
];

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const [scanning, setScanning] = useState(false);
  const [todayScore, setTodayScore] = useState(7.5);
  const [todayMeals, setTodayMeals] = useState(2);
  const [todayCalories, setTodayCalories] = useState(1240);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scanPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  }, []);

  // Pulse animation on scan button
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanPulse, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(scanPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh today summary when returning from record screen
      mealService.getTodayMeals().then((meals) => {
        const cal = meals.reduce((s, m) => s + m.totalCalories, 0);
        setTodayMeals(meals.length);
        setTodayCalories(cal);
      }).catch(() => {});
    }, [])
  );

  const handleScan = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanning(true);
    try {
      const result = await foodRecognitionService.captureFromCamera();
      if (result) {
        navigation.navigate('FoodResult', { analysisResult: result });
      }
    } catch (e) {
      Alert.alert('识别失败', '请重试或手动添加食物');
    } finally {
      setScanning(false);
    }
  };

  const handlePickImage = async () => {
    await Haptics.selectionAsync();
    setScanning(true);
    try {
      const result = await foodRecognitionService.captureFromLibrary();
      if (result) {
        navigation.navigate('FoodResult', { analysisResult: result });
      }
    } catch {
      Alert.alert('识别失败', '请重试');
    } finally {
      setScanning(false);
    }
  };

  const handleManualAdd = async () => {
    await Haptics.selectionAsync();
    navigation.navigate('FoodResult', { analysisResult: undefined });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={async () => {
              await Haptics.selectionAsync();
              navigation.navigate('Profile');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={34} color={Colors.blue} />
          </TouchableOpacity>
        </Animated.View>

        {/* Summary Card */}
        <Animated.View style={[styles.summaryCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryTitle}>今日健康评分</Text>
            <Text style={styles.summaryMeta}>
              已记录 {todayMeals} 餐 · {todayCalories} 千卡
            </Text>
            <TouchableOpacity style={styles.detailLink} activeOpacity={0.7}>
              <Text style={styles.detailLinkText}>查看完整分析</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.blue} />
            </TouchableOpacity>
          </View>
          <HealthRing score={todayScore} />
        </Animated.View>

        {/* Main Scan Button */}
        <Animated.View style={[styles.scanWrap, { opacity: fadeAnim, transform: [{ scale: scanPulse }] }]}>
          <TouchableOpacity
            style={[styles.scanButton, scanning && styles.scanButtonLoading]}
            onPress={handleScan}
            disabled={scanning}
            activeOpacity={0.88}
          >
            <View style={styles.scanInner}>
              <View style={styles.scanIconRing}>
                {scanning
                  ? <ActivityIndicator color="#FFFFFF" size="large" />
                  : <Ionicons name="camera" size={38} color="#FFFFFF" />
                }
              </View>
              <View style={styles.scanTextCol}>
                <Text style={styles.scanTitle}>{scanning ? 'AI 识别中…' : '拍照识别食物'}</Text>
                <Text style={styles.scanSub}>{scanning ? '正在分析食物健康影响' : 'AI 分析食物对你健康的影响'}</Text>
              </View>
              {!scanning && <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.quickRow, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.quickCard} onPress={handlePickImage} activeOpacity={0.75}>
            <View style={[styles.quickIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="images" size={22} color={Colors.green} />
            </View>
            <Text style={styles.quickLabel}>从相册</Text>
            <Text style={styles.quickSub}>选择图片</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} onPress={handleManualAdd} activeOpacity={0.75}>
            <View style={[styles.quickIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="search" size={22} color={Colors.orange} />
            </View>
            <Text style={styles.quickLabel}>搜索食物</Text>
            <Text style={styles.quickSub}>手动添加</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} onPress={() => {}} activeOpacity={0.75}>
            <View style={[styles.quickIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="star" size={22} color={Colors.purple} />
            </View>
            <Text style={styles.quickLabel}>常用食物</Text>
            <Text style={styles.quickSub}>一键记录</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Health Tips */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.sectionTitle}>今日健康建议</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: tip.color + '18' }]}>
                <Ionicons name={tip.icon} size={18} color={tip.color} />
              </View>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Upgrade Banner */}
        <TouchableOpacity
          style={styles.upgradeBanner}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Paywall');
          }}
          activeOpacity={0.88}
        >
          <View style={styles.upgradLeft}>
            <Ionicons name="sparkles" size={18} color="#FFD700" />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={styles.upgradeTitle}>解锁完整功能</Text>
              <Text style={styles.upgradeSub}>试用期已结束 · 升级继续使用</Text>
            </View>
          </View>
          <View style={styles.upgradeArrow}>
            <Ionicons name="chevron-forward" size={15} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  greeting: { fontSize: 34, fontWeight: '700', color: Colors.text, letterSpacing: 0.2 },
  date: { fontSize: 15, color: Colors.textSecondary, marginTop: 2 },
  profileBtn: { padding: 4 },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    ...Shadow.card,
  },
  summaryLeft: { flex: 1, paddingRight: Spacing.lg },
  summaryTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  summaryMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  detailLink: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  detailLinkText: { fontSize: 14, color: Colors.blue, fontWeight: '500', marginRight: 2 },
  ringScore: { fontSize: 30, fontWeight: '700', textAlign: 'center' },
  ringMax: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  scanWrap: { paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
  scanButton: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    ...Shadow.button,
  },
  scanButtonLoading: { opacity: 0.8 },
  scanInner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.xl },
  scanIconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTextCol: { flex: 1, marginLeft: Spacing.lg },
  scanTitle: { fontSize: 19, fontWeight: '700', color: '#FFF', letterSpacing: 0.2 },
  scanSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 3 },
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.secondaryBackground,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.card,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  quickSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  tipText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 21, paddingTop: 2 },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  upgradLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  upgradeTitle: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  upgradeSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  upgradeArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
