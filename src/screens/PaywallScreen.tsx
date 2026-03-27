import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, Shadow } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: 'camera', label: '无限食物识别', desc: '每日无限次拍照识别' },
  { icon: 'analytics', label: '完整健康分析', desc: '周/月趋势图表与洞察' },
  { icon: 'bulb', label: 'AI 个性化建议', desc: '根据病情定制饮食方案' },
  { icon: 'notifications', label: '智能提醒', desc: '三餐记录与饮水提醒' },
  { icon: 'document-text', label: '数据导出', desc: '导出 PDF 健康报告' },
  { icon: 'shield-checkmark', label: '数据安全', desc: '端对端加密保护隐私' },
];

const PLANS = [
  {
    id: 'monthly',
    label: '月度订阅',
    price: '$15',
    period: '/ 月',
    pricePerMonth: '$15 / 月',
    badge: null,
    highlight: false,
  },
  {
    id: 'yearly',
    label: '年度订阅',
    price: '$108',
    period: '/ 年',
    pricePerMonth: '$9 / 月',
    badge: '省 40%',
    highlight: true,
  },
];

export default function PaywallScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      Alert.alert('购买成功', '感谢您的订阅！', [
        { text: '开始使用', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('购买失败', '请重试或联系客服');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    Alert.alert('未找到购买记录', '请确认登录了正确的 Apple ID');
  };

  const activePlan = PLANS.find((p) => p.id === selectedPlan)!;

  return (
    <SafeAreaView style={styles.container}>
      {/* Close */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Ionicons name="close" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="heart" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>解锁完整健康管理</Text>
          <Text style={styles.heroSubtitle}>
            AI 驱动的慢性病饮食助手{'\n'}帮助你科学管控每一口食物
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.featuresCard, { opacity: fadeAnim }]}>
          {FEATURES.map((f, i) => (
            <View key={i}>
              <View style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon as any} size={18} color={Colors.blue} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
              </View>
              {i < FEATURES.length - 1 && <View style={styles.featureDivider} />}
            </View>
          ))}
        </Animated.View>

        {/* Plan Selector */}
        <View style={styles.plansRow}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, plan.highlight && styles.planCardHighlight, selectedPlan === plan.id && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan.id as 'monthly' | 'yearly')}
              activeOpacity={0.8}
            >
              {plan.badge && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}
              {selectedPlan === plan.id && (
                <View style={styles.planCheck}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.blue} />
                </View>
              )}
              <Text style={[styles.planLabel, selectedPlan === plan.id && styles.planLabelSelected]}>
                {plan.label}
              </Text>
              <View style={styles.planPriceRow}>
                <Text style={[styles.planPrice, selectedPlan === plan.id && styles.planPriceSelected]}>
                  {plan.price}
                </Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
              <Text style={styles.planPerMonth}>{plan.pricePerMonth}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trial Info */}
        <View style={styles.trialNote}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.textSecondary} />
          <Text style={styles.trialNoteText}>
            订阅将在试用结束后自动续费。可随时在 Apple ID 设置中取消。
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity
          style={[styles.purchaseButton, loading && styles.purchaseButtonLoading]}
          onPress={handlePurchase}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.purchaseButtonText}>
            {loading ? '处理中...' : `订阅 ${activePlan.label} · ${activePlan.price}`}
          </Text>
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <TouchableOpacity onPress={handleRestore} activeOpacity={0.7}>
            <Text style={styles.linkText}>恢复购买</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://example.com/privacy')} activeOpacity={0.7}>
            <Text style={styles.linkText}>隐私政策</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://example.com/terms')} activeOpacity={0.7}>
            <Text style={styles.linkText}>服务条款</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: Spacing.xl,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.systemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingBottom: 20 },
  hero: { alignItems: 'center', paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  heroIconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.blue,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.button,
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', letterSpacing: 0.3 },
  heroSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  featuresCard: {
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  featureIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.blue + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  featureDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  featureDivider: { height: 0.5, backgroundColor: Colors.separator, marginLeft: 36 + Spacing.md + Spacing.lg },
  plansRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.secondaryBackground,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.card,
  },
  planCardHighlight: { borderColor: Colors.blue + '40' },
  planCardSelected: { borderColor: Colors.blue },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.blue,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: Radius.sm,
  },
  planBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  planCheck: { position: 'absolute', top: Spacing.sm, left: Spacing.sm },
  planLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', marginTop: 4 },
  planLabelSelected: { color: Colors.blue },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: Spacing.sm },
  planPrice: { fontSize: 28, fontWeight: '800', color: Colors.text },
  planPriceSelected: { color: Colors.blue },
  planPeriod: { fontSize: 13, color: Colors.textSecondary, marginLeft: 2 },
  planPerMonth: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  trialNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  trialNoteText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  bottomCTA: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5,
    borderTopColor: Colors.separator,
  },
  purchaseButton: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.pill,
    paddingVertical: 17,
    alignItems: 'center',
    ...Shadow.button,
  },
  purchaseButtonLoading: { opacity: 0.7 },
  purchaseButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  linkText: { fontSize: 12, color: Colors.textSecondary },
  linkDot: { fontSize: 12, color: Colors.textTertiary },
});
