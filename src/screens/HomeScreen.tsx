import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>健康监测</Text>
      <Text style={styles.subtitle}>拍照识别食物，了解健康影响</Text>
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>拍照识别食物</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>从相册选择</Text>
      </TouchableOpacity>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>今日状态</Text>
        <Text style={styles.statusValue}>等待记录</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    width: '100%',
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
});