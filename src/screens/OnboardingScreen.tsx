import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow } from '../constants/colors';
import { storageService } from '../services/storage';
import { HealthCondition } from '../types';

const { width } = Dimensions.get('window');

// ─── Slide data ───────────────────────────────────────────────────────────────

interface Slide {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'camera',
    iconColor: Colors.blue,
    iconBg: Colors.blue + '18',
    title: '拍照识别食物',
    subtitle: 'AI 实时分析食物对你慢性病的影响，\n让你一眼知道这顿能不能吃',
  },
  {
    id: '2',
    icon: 'bar-chart',
    iconColor: Colors.purple,
    iconBg: Colors.purple + '18',
    title: '追踪健康趋势',
    subtitle: '每日饮食记录自动生成健康评分，\n周期趋势图让你看清饮食的改善成效',
  },
  {
    id: '3',
    icon: 'bulb',
    iconColor: Colors.orange,
    iconBg: Colors.orange + '18',
    title: 'AI 个性化建议',
    subtitle: '根据你的病情和指标定制饮食方案，\n科学管控每一口食物',
  },
];

const CONDITIONS: { id: HealthCondition; label: string; icon: string; color: string }[] = [
  { id: 'hyperuricemia', label: '高尿酸血症 / 痛风', icon: 'water', color: Colors.teal },
  { id: 'hypertension', label: '高血压', icon: 'heart', color: Colors.red },
  { id: 'diabetes', label: '糖尿病', icon: 'flash', color: Colors.orange },
  { id: 'hyperlipidemia', label: '高血脂', icon: 'fitness', color: Colors.purple },
  { id: 'kidneyIssues', label: '肾脏问题', icon: 'medkit', color: Colors.indigo },
  { id: 'obesity', label: '体重管理', icon: 'scale', color: Colors.green },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [page, setPage] = useState(0);
  const [selectedConditions, setSelectedConditions] = useState<Set<HealthCondition>>(new Set());
  const flatRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const totalPages = SLIDES.length + 1; // slides + condition picker

  const goNext = async () => {
    await Haptics.selectionAsync();
    const next = page + 1;
    if (next >= totalPages) {
      await finish();
      return;
    }
    setPage(next);
    flatRef.current?.scrollToIndex({ index: next, animated: true });
    Animated.timing(progressAnim, {
      toValue: next / (totalPages - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const finish = async () => {
    await storageService.updateConditions(Array.from(selectedConditions));
    await storageService.setOnboardingDone();
    onDone();
  };

  const toggleCondition = async (id: HealthCondition) => {
    await Haptics.selectionAsync();
    setSelectedConditions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isLastPage = page === totalPages - 1;
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
    <View style={styles.slide}>
      <View style={[styles.slideIconWrap, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon as any} size={56} color={item.iconColor} />
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSub}>{item.subtitle}</Text>
    </View>
  );

  const renderConditionPicker = () => (
    <View style={styles.slide}>
      <View style={[styles.slideIconWrap, { backgroundColor: Colors.blue + '18' }]}>
        <Ionicons name="heart" size={56} color={Colors.blue} />
      </View>
      <Text style={styles.slideTitle}>选择你的健康状况</Text>
      <Text style={styles.slideSub}>我们会根据你的病情，定制专属的食物分析标准</Text>
      <View style={styles.conditionsGrid}>
        {CONDITIONS.map((c) => {
          const selected = selectedConditions.has(c.id);
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.conditionChip,
                selected && { backgroundColor: c.color + '18', borderColor: c.color },
              ]}
              onPress={() => toggleCondition(c.id)}
              activeOpacity={0.75}
            >
              <Ionicons name={c.icon as any} size={18} color={selected ? c.color : Colors.textSecondary} />
              <Text style={[styles.conditionLabel, selected && { color: c.color, fontWeight: '600' }]}>
                {c.label}
              </Text>
              {selected && <Ionicons name="checkmark-circle" size={16} color={c.color} />}
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedConditions.size === 0 && (
        <Text style={styles.skipNote}>可以暂时跳过，之后在「个人中心」补充</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={[...SLIDES, { id: 'conditions' } as any]}
        renderItem={({ item, index }) =>
          index < SLIDES.length ? renderSlide({ item, index }) : renderConditionPicker()
        }
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.flatList}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === page && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={goNext} activeOpacity={0.88}>
          <Text style={styles.nextButtonText}>
            {page === 0
              ? '开始了解'
              : isLastPage
              ? selectedConditions.size > 0 ? '开始使用' : '跳过，直接开始'
              : '继续'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {page < totalPages - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={finish} activeOpacity={0.7}>
            <Text style={styles.skipButtonText}>跳过</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressTrack: {
    height: 3,
    backgroundColor: '#E5E5EA',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.blue,
    borderRadius: 2,
  },
  flatList: { flex: 1 },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  slideIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  slideSub: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 24,
  },
  conditionsGrid: {
    width: '100%',
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.secondaryBackground,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Shadow.card,
  },
  conditionLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  skipNote: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D1D6',
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.blue,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blue,
    borderRadius: Radius.pill,
    paddingVertical: 17,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  skipButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
