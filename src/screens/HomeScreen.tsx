import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { foodRecognitionService } from '../services/foodRecognition';

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleTakePhoto = async () => {
    try {
      const uri = await foodRecognitionService.captureImage();
      if (uri) {
        setSelectedImage(uri);
      }
    } catch (error) {
      Alert.alert('错误', '无法打开相机，请检查相机权限');
    }
  };

  const handlePickImage = async () => {
    try {
      setAnalyzing(true);
      const uri = await foodRecognitionService.pickImage();
      if (uri) {
        setSelectedImage(uri);
      }
    } catch (error) {
      Alert.alert('错误', '无法打开相册，请检查相册权限');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>健康监测</Text>
      <Text style={styles.subtitle}>拍照识别食物，了解健康影响</Text>
      
      {selectedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleTakePhoto}
        disabled={analyzing}
      >
        <Text style={styles.buttonText}>
          {analyzing ? '分析中...' : '拍照识别食物'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={handlePickImage}
        disabled={analyzing}
      >
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
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
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