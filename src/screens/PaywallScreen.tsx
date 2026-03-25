import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { paymentService } from '../services/paymentService';

export default function PaywallScreen({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const productId = selectedPlan === 'monthly' 
        ? 'health_monitor_monthly' 
        : 'health_monitor_yearly';
      
      const success = await paymentService.purchase(productId);
      if (success) {
        Alert.alert('购买成功', '感谢您的订阅！');
        navigation.goBack();
      } else {
        Alert.alert('购买失败', '请重试或联系客服');
      }
    } catch (error) {
      Alert.alert('购买失败', '请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const success = await paymentService.restorePurchases();
      if (success) {
        Alert.alert('恢复成功', '已恢复之前的购买');
        navigation.goBack();
      } else {
        Alert.alert('恢复失败', '未找到之前的购买记录');
      }
    } catch (error) {
      Alert.alert('恢复失败', '请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>升级到高级版</Text>
      <Text style={styles.subtitle}>解锁所有功能，获取完整健康分析</Text>
      
      <View style={styles.plansContainer}>
        <TouchableOpacity 
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.selectedPlan
          ]}
          onPress={() => setSelectedPlan('monthly')}
        >
          <Text style={styles.planTitle}>月度订阅</Text>
          <Text style={styles.planPrice}>$15/月</Text>
          <Text style={styles.planFeatures}>• 无限食物识别{'\n'}• 完整健康分析{'\n'}• 数据导出</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.planCard,
            selectedPlan === 'yearly' && styles.selectedPlan
          ]}
          onPress={() => setSelectedPlan('yearly')}
        >
          <Text style={styles.planTitle}>年度订阅</Text>
          <Text style={styles.planPrice}>$108/年</Text>
          <Text style={styles.planDiscount}>省$72（6折）</Text>
          <Text style={styles.planFeatures}>• 无限食物识别{'\n'}• 完整健康分析{'\n'}• 数据导出{'\n'}• 优先支持</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.purchaseButton}
        onPress={handlePurchase}
        disabled={loading}
      >
        <Text style={styles.purchaseButtonText}>
          {loading ? '处理中...' : '立即订阅'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleRestore}>
        <Text style={styles.restoreText}>恢复购买</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  planCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
  },
  selectedPlan: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FFF0',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  planDiscount: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 8,
  },
  planFeatures: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreText: {
    color: '#4CAF50',
    fontSize: 16,
    textAlign: 'center',
  },
});