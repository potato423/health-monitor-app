import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>早上好</Text>
        <Text style={styles.date}>3月25日 周三</Text>
      </View>

      <View style={styles.heroSection}>
        <View style={styles.scanButton}>
          <Ionicons name="camera-outline" size={48} color="#007AFF" />
          <Text style={styles.scanTitle}>扫描食物</Text>
          <Text style={styles.scanSubtitle}>拍照识别食物是否能吃</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="albums-outline" size={28} color="#34C759" />
          <Text style={styles.actionText}>从相册选择</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="add-circle-outline" size={28} color="#FF9500" />
          <Text style={styles.actionText}>手动添加</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipCard}>
        <Ionicons name="bulb-outline" size={20} color="#5856D6" />
        <Text style={styles.tipText}>今日建议：多摄入蔬菜，减少高嘌呤食物</Text>
      </View>
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
  greeting: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  date: {
    fontSize: 17,
    color: '#8E8E93',
    marginTop: 4,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  scanButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
  },
  scanSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#5856D6',
    marginLeft: 10,
  },
});