import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HealthStatusBadgeProps {
  status: 'green' | 'yellow' | 'red';
  label: string;
}

export default function HealthStatusBadge({ status, label }: HealthStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'green': return '#4CAF50';
      case 'yellow': return '#FF9800';
      case 'red': return '#F44336';
      default: return '#666666';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'green': return '能吃';
      case 'yellow': return '谨慎吃';
      case 'red': return '避免吃';
      default: return '未知';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.text}>{getStatusText()}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});