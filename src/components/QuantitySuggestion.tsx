import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QuantitySuggestionProps {
  suggestion: 'small' | 'moderate' | 'normal';
}

export default function QuantitySuggestion({ suggestion }: QuantitySuggestionProps) {
  const getSuggestionText = () => {
    switch (suggestion) {
      case 'small': return '少量';
      case 'moderate': return '适量';
      case 'normal': return '正常量';
      default: return '未知';
    }
  };

  const getSuggestionColor = () => {
    switch (suggestion) {
      case 'small': return '#F44336';
      case 'moderate': return '#FF9800';
      case 'normal': return '#4CAF50';
      default: return '#666666';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getSuggestionColor() }]}>
      <Text style={styles.text}>建议{getSuggestionText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});