import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow, Type } from '../constants/colors';
import { storageService } from '../services/storage';
import { HealthCondition } from '../types';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1', icon: 'camera' as const, iconColor: Colors.primary, iconBg: Colors.primary + '18',
    title: 'Scan Any Food Instantly',
    sub:   'Point your camera at any meal. Our AI identifies it and scores its impact on your specific chronic conditions — in seconds.',
  },
  {
    id: '2', icon: 'bar-chart' as const, iconColor: Colors.purple, iconBg: Colors.purple + '18',
    title: 'Track Every Trend',
    sub:   'Each logged meal builds your health picture. See weekly patterns, spot risky habits, and watch your score improve over time.',
  },
  {
    id: '3', icon: 'bulb' as const, iconColor: Colors.orange, iconBg: Colors.orange + '18',
    title: 'Guidance Made for You',
    sub:   'Not generic advice — recommendations calibrated to your exact conditions, metrics, and food history.',
  },
];

const CONDITIONS: { id: HealthCondition; label: string; icon: string; color: string }[] = [
  { id: 'hyperuricemia',  label: 'Gout / High Uric Acid',    icon: 'water',   color: Colors.teal },
  { id: 'hypertension',   label: 'High Blood Pressure',       icon: 'heart',   color: Colors.red },
  { id: 'diabetes',       label: 'Diabetes / Pre-diabetes',   icon: 'flash',   color: Colors.orange },
  { id: 'hyperlipidemia', label: 'High Cholesterol',          icon: 'fitness', color: Colors.purple },
  { id: 'kidneyIssues',   label: 'Kidney Disease',            icon: 'medkit',  color: Colors.indigo },
  { id: 'obesity',        label: 'Weight Management',         icon: 'scale',   color: Colors.green },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<HealthCondition>>(new Set());
  const listRef  = useRef<FlatList>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const TOTAL    = SLIDES.length + 1;

  const advance = async () => {
    await Haptics.selectionAsync();
    const next = page + 1;
    if (next >= TOTAL) { await finish(); return; }
    setPage(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
    Animated.spring(progress, { toValue: next / (TOTAL - 1), useNativeDriver: false, tension: 60, friction: 12 }).start();
  };

  const finish = async () => {
    await storageService.updateConditions(Array.from(selected));
    await storageService.setOnboardingDone();
    onDone();
  };

  const toggle = async (id: HealthCondition) => {
    await Haptics.selectionAsync();
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const isLast   = page === TOTAL - 1;

  const renderSlide = ({ item, index }: { item: (typeof SLIDES)[0]; index: number }) => (
    <View style={styles.slide}>
      <View style={[styles.slideIcon, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={60} color={item.iconColor} />
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSub}>{item.sub}</Text>
    </View>
  );

  const renderConditions = () => (
    <View style={styles.slide}>
      <View style={[styles.slideIcon, { backgroundColor: Colors.primary + '18' }]}>
        <Ionicons name="heart" size={60} color={Colors.primary} />
      </View>
      <Text style={styles.slideTitle}>What are you managing?</Text>
      <Text style={styles.slideSub}>Select all that apply. This personalizes every food score you receive.</Text>
      <View style={styles.condGrid}>
        {CONDITIONS.map(c => {
          const on = selected.has(c.id);
          return (
            <TouchableOpacity key={c.id}
              style={[styles.condChip, on && { backgroundColor: c.color + '1A', borderColor: c.color }]}
              onPress={() => toggle(c.id)} activeOpacity={0.75}>
              <Ionicons name={c.icon as any} size={18} color={on ? c.color : Colors.textSecondary} />
              <Text style={[styles.condLabel, on && { color: c.color, fontWeight: '600' }]}>{c.label}</Text>
              {on && <Ionicons name="checkmark-circle" size={16} color={c.color} />}
            </TouchableOpacity>
          );
        })}
      </View>
      {selected.size === 0 && (
        <Text style={styles.skipHint}>You can set this later in your profile</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: barWidth }]} />
      </View>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={[...SLIDES, { id: 'cond' } as any]}
        renderItem={({ item, index }) => index < SLIDES.length ? renderSlide({ item, index }) : renderConditions()}
        keyExtractor={item => item.id}
        horizontal pagingEnabled scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={advance} activeOpacity={0.88}>
          <Text style={styles.nextBtnText}>
            {page === 0 ? "Let's Go" : isLast ? (selected.size > 0 ? 'Start Tracking' : 'Skip & Start') : 'Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {page > 0 && !isLast && (
          <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.7}>
            <Text style={styles.skipBtnText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressTrack: { height: 3, backgroundColor: Colors.separator, marginHorizontal: Spacing.xl, marginTop: Spacing.md, borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  slideIcon: { width: 128, height: 128, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xxxl },
  slideTitle: { ...Type.title1, color: Colors.text, textAlign: 'center', letterSpacing: -0.4 },
  slideSub: { ...Type.body, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md, lineHeight: 24 },
  condGrid: { width: '100%', marginTop: Spacing.xl, gap: Spacing.sm },
  condChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.cardBackground, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1.5, borderColor: 'transparent', ...Shadow.xs },
  condLabel: { flex: 1, ...Type.body, color: Colors.text },
  skipHint: { ...Type.footnote, color: Colors.textTertiary, marginTop: Spacing.lg, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: Spacing.lg },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.separator },
  dotActive: { width: 22, backgroundColor: Colors.primary },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.md },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 17, ...Shadow.button },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipBtnText: { ...Type.body, color: Colors.textSecondary },
});
