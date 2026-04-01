import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Animated, Linking, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow, Type } from '../constants/colors';
import { paymentService, SubscriptionProduct } from '../services/paymentService';

const FEATURES = [
  { icon: 'camera',           title: 'Unlimited Food Scans',   desc: 'Scan every meal — no daily cap' },
  { icon: 'bar-chart',        title: 'Full Health Analytics',  desc: 'Weekly & monthly trend charts' },
  { icon: 'bulb',             title: 'AI Personalized Advice', desc: 'Tailored to your conditions' },
  { icon: 'notifications',    title: 'Smart Meal Reminders',   desc: 'Custom breakfast, lunch & dinner alerts' },
  { icon: 'document-text',    title: 'Health Reports',         desc: 'Exportable summaries to share with your doctor' },
  { icon: 'shield-checkmark', title: 'End-to-End Privacy',     desc: 'Your data never leaves your device' },
];

export default function PaywallScreen() {
  const navigation = useNavigation();
  const [plan, setPlan]           = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading]     = useState(false);
  const [products, setProducts]   = useState<SubscriptionProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();

    // Load real prices from App Store
    paymentService.getProducts().then(p => {
      setProducts(p);
      setLoadingProducts(false);
    });
  }, []);

  const handlePurchase = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    const productId = plan === 'monthly'
      ? 'com.healthmonitor.chroniccare.monthly'
      : 'com.healthmonitor.chroniccare.yearly';
    const result = await paymentService.purchase(productId);
    setLoading(false);
    if (result.success) {
      Alert.alert('Welcome to Pro!', 'All features are now unlocked.', [
        { text: 'Get Started', onPress: () => navigation.goBack() },
      ]);
    } else {
      // Only show error for real failures (not user-cancelled)
      if (result.error && !result.error.includes('cancelled')) {
        Alert.alert('Purchase Failed', result.error);
      }
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const result = await paymentService.restorePurchases();
    setLoading(false);
    Alert.alert(
      result.success ? 'Restored!' : 'Nothing to Restore',
      result.success
        ? 'Your subscription has been restored.'
        : 'No previous purchase found for this Apple ID.'
    );
  };

  // Find active plan display data
  const monthly = products.find(p => p.period === 'monthly');
  const yearly  = products.find(p => p.period === 'yearly');
  const activePlan = plan === 'monthly' ? monthly : yearly;

  return (
    <SafeAreaView style={styles.container}>
      {/* Close */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Ionicons name="close" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.heroIcon}>
            <Ionicons name="heart" size={42} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Take Control of{'\n'}Your Health</Text>
          <Text style={styles.heroSub}>
            AI-powered chronic disease diet tracking{'\n'}designed for real results
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.featuresCard, { opacity: fadeAnim }]}>
          {FEATURES.map((f, i) => (
            <View key={i}>
              <View style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon as any} size={18} color={Colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
              </View>
              {i < FEATURES.length - 1 && (
                <View style={[styles.featureDiv, { marginLeft: 36 + Spacing.md + Spacing.lg }]} />
              )}
            </View>
          ))}
        </Animated.View>

        {/* Plan Selector */}
        {loadingProducts ? (
          <View style={styles.productLoading}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.productLoadingText}>Loading prices…</Text>
          </View>
        ) : (
          <View style={styles.plansRow}>
            {[
              { id: 'monthly' as const, data: monthly, highlight: false },
              { id: 'yearly'  as const, data: yearly,  highlight: true  },
            ].map(({ id, data, highlight }) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.planCard,
                  highlight && styles.planCardHL,
                  plan === id && styles.planCardSel,
                ]}
                onPress={async () => { await Haptics.selectionAsync(); setPlan(id); }}
                activeOpacity={0.8}
              >
                {data?.savings && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{data.savings}</Text>
                  </View>
                )}
                {plan === id && (
                  <View style={styles.planCheck}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  </View>
                )}
                <Text style={[styles.planLabel, plan === id && { color: Colors.primary }]}>
                  {data?.title ?? (id === 'monthly' ? 'Monthly' : 'Annual')}
                </Text>
                <Text style={[styles.planPrice, plan === id && { color: Colors.primary }]}>
                  {data?.price ?? (id === 'monthly' ? '$14.99' : '$89.99')}
                </Text>
                <Text style={styles.planSub}>
                  {data?.pricePerMonth ?? (id === 'monthly' ? '$14.99 / mo' : '$7.50 / mo')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Legal */}
        <View style={styles.legalNote}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.legalText}>
            Payment charged to your Apple ID. Subscription auto-renews unless cancelled at least
            24 hours before the renewal date. Manage in Apple ID Settings.
          </Text>
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={[styles.ctaBtn, (loading || loadingProducts) && { opacity: 0.7 }]}
          onPress={handlePurchase}
          disabled={loading || loadingProducts}
          activeOpacity={0.88}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.ctaBtnText}>
                {`Subscribe · ${activePlan?.price ?? '—'}`}
              </Text>
          }
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <TouchableOpacity onPress={handleRestore} activeOpacity={0.7}>
            <Text style={styles.linkText}>Restore Purchase</Text>
          </TouchableOpacity>
          <Text style={styles.dot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://potato423.github.io/health-monitor-app/privacy-policy.html')} activeOpacity={0.7}>
            <Text style={styles.linkText}>Privacy</Text>
          </TouchableOpacity>
          <Text style={styles.dot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://potato423.github.io/health-monitor-app/terms.html')} activeOpacity={0.7}>
            <Text style={styles.linkText}>Terms</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeBtn: { position: 'absolute', top: 56, right: Spacing.xl, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.systemFill, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 20 },
  hero: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  heroIcon: { width: 84, height: 84, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, ...Shadow.button },
  heroTitle: { ...Type.title1, color: Colors.text, textAlign: 'center', letterSpacing: -0.5 },
  heroSub: { ...Type.body, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md, lineHeight: 23 },
  featuresCard: { backgroundColor: Colors.cardBackground, marginHorizontal: Spacing.xl, borderRadius: Radius.xxl, overflow: 'hidden', ...Shadow.card },
  featureRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  featureIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  featureText: { flex: 1 },
  featureTitle: { ...Type.callout, fontWeight: '600', color: Colors.text },
  featureDesc: { ...Type.caption, color: Colors.textSecondary, marginTop: 1 },
  featureDiv: { height: 0.5, backgroundColor: Colors.separator },
  productLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  productLoadingText: { ...Type.callout, color: Colors.textSecondary },
  plansRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, gap: Spacing.md },
  planCard: { flex: 1, backgroundColor: Colors.cardBackground, borderRadius: Radius.xxl, padding: Spacing.lg, borderWidth: 2, borderColor: 'transparent', position: 'relative', overflow: 'hidden', ...Shadow.card },
  planCardHL: { borderColor: Colors.primary + '40' },
  planCardSel: { borderColor: Colors.primary },
  planBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.primary, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderBottomLeftRadius: Radius.md },
  planBadgeText: { ...Type.caption, fontWeight: '700', color: '#fff' },
  planCheck: { position: 'absolute', top: Spacing.sm, left: Spacing.sm },
  planLabel: { ...Type.subhead, color: Colors.textSecondary, marginTop: Spacing.xs },
  planPrice: { fontSize: 28, fontWeight: '800', color: Colors.text, marginTop: Spacing.xs },
  planSub: { ...Type.caption, color: Colors.textSecondary, marginTop: 2 },
  legalNote: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: Spacing.xl, marginTop: Spacing.lg, gap: Spacing.xs },
  legalText: { flex: 1, ...Type.caption, color: Colors.textTertiary, lineHeight: 17 },
  cta: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, paddingTop: Spacing.md, backgroundColor: Colors.background, borderTopWidth: 0.5, borderTopColor: Colors.separator },
  ctaBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 17, alignItems: 'center', ...Shadow.button },
  ctaBtnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  linksRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.sm },
  linkText: { ...Type.footnote, color: Colors.textSecondary },
  dot: { ...Type.footnote, color: Colors.textTertiary },
});
