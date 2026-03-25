import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { analysisService } from '../services/analysisService';

interface DailyAnalysis {
  date: Date;
  totalCalories: number;
  healthScore: number;
  trends: {
    uricAcid: 'improving' | 'stable' | 'worsening';
    bloodPressure: 'improving' | 'stable' | 'worsening';
    bloodSugar: 'improving' | 'stable' | 'worsening';
    bloodFat: 'improving' | 'stable' | 'worsening';
    kidneyLoad: 'improving' | 'stable' | 'worsening';
    weightManagement: 'improving' | 'stable' | 'worsening';
  };
  recommendations: string[];
}

export default function AnalysisScreen() {
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      const dailyAnalysis = await analysisService.generateDailyAnalysis();
      setAnalysis(dailyAnalysis);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↓';
      case 'worsening': return '↑';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'worsening': return '#F44336';
      default: return '#666666';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>健康分析报告</Text>
      
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>今日健康得分</Text>
        <Text style={styles.scoreValue}>
          {analysis ? `${analysis.healthScore}/10` : '--/10'}
        </Text>
        <Text style={styles.scoreSubtitle}>
          {analysis ? `${analysis.totalCalories} kcal` : '等待数据'}
        </Text>
      </View>
      
      {analysis && (
        <View style={styles.trendsCard}>
          <Text style={styles.sectionTitle}>健康趋势</Text>
          
          {Object.entries(analysis.trends).map(([key, trend]) => (
            <View key={key} style={styles.trendItem}>
              <Text style={styles.trendLabel}>
                {key === 'uricAcid' ? '尿酸' :
                 key === 'bloodPressure' ? '血压' :
                 key === 'bloodSugar' ? '血糖' :
                 key === 'bloodFat' ? '血脂' :
                 key === 'kidneyLoad' ? '肾脏' : '体重'}
              </Text>
              <Text style={[styles.trendValue, { color: getTrendColor(trend) }]}>
                {trend} {getTrendIcon(trend)}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {analysis && (
        <View style={styles.adviceCard}>
          <Text style={styles.sectionTitle}>明日建议</Text>
          {analysis.recommendations.map((rec, index) => (
            <Text key={index} style={styles.adviceText}>• {rec}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  scoreSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  trendsCard: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  trendLabel: {
    fontSize: 16,
    color: '#333333',
  },
  trendValue: {
    fontSize: 16,
    color: '#666666',
  },
  adviceCard: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  adviceText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
});