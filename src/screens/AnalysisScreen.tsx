import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockAnalysis = {
  healthScore: 7.5,
  trends: [
    { name: '尿酸', value: '稳定', trend: 'stable', icon: 'water-outline' },
    { name: '血压', value: '正常', trend: 'improving', icon: 'heart-outline' },
    { name: '血糖', value: '正常', trend: 'improving', icon: 'flash-outline' },
    { name: '血脂', value: '略高', trend: 'worsening', icon: 'fitness-outline' },
  ],
  recommendations: [
    '多喝水，促进尿酸排泄',
    '今日蔬菜摄入不足，建议增加',
    '减少高盐食物摄入',
  ],
};

export default function AnalysisScreen() {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#34C759';
      case 'worsening': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return 'arrow-up';
      case 'worsening': return 'arrow-down';
      default: return 'remove';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>健康分析</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{mockAnalysis.healthScore}</Text>
            <Text style={styles.scoreMax}>/10</Text>
          </View>
          <Text style={styles.scoreLabel}>今日健康评分</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>各项指标</Text>
          <View style={styles.trendsCard}>
            {mockAnalysis.trends.map((item, index) => (
              <View key={index} style={styles.trendItem}>
                <View style={styles.trendLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: getTrendColor(item.trend) + '20' }]}>
                    <Ionicons name={item.icon as any} size={22} color={getTrendColor(item.trend)} />
                  </View>
                  <View style={styles.trendInfo}>
                    <Text style={styles.trendName}>{item.name}</Text>
                    <Text style={styles.trendValue}>{item.value}</Text>
                  </View>
                </View>
                <View style={[styles.trendBadge, { backgroundColor: getTrendColor(item.trend) + '20' }]}>
                  <Ionicons name={getTrendIcon(item.trend) as any} size={14} color={getTrendColor(item.trend)} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>建议</Text>
          <View style={styles.adviceCard}>
            {mockAnalysis.recommendations.map((advice, index) => (
              <View key={index} style={styles.adviceItem}>
                <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
                <Text style={styles.adviceText}>{advice}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  scoreMax: {
    fontSize: 20,
    color: '#8E8E93',
    marginTop: 20,
  },
  scoreLabel: {
    fontSize: 17,
    color: '#8E8E93',
    marginTop: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    marginLeft: 4,
  },
  trendsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  trendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendInfo: {
    marginLeft: 12,
  },
  trendName: {
    fontSize: 15,
    color: '#8E8E93',
  },
  trendValue: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    marginTop: 2,
  },
  trendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  adviceText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 100,
  },
});