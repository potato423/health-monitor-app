import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { medicalAPIService } from './medicalAPI';
import { FoodItem, UserHealthProfile } from '../types';

class FoodRecognitionService {
  async captureImage(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('需要相机权限才能拍照');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Camera capture failed:', error);
      alert('拍照失败，请重试');
      return null;
    }
  }

  async pickImage(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('需要相册权限才能选择图片');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Image picker failed:', error);
      alert('选择图片失败，请重试');
      return null;
    }
  }

  async analyzeFood(
    imageUri: string,
    userProfile: UserHealthProfile
  ): Promise<FoodItem> {
    try {
      // 读取图片并转换为base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      // 调用医学API分析
      const foodItem = await medicalAPIService.analyzeFood(base64, userProfile);
      return foodItem;
    } catch (error) {
      console.error('Food recognition failed:', error);
      throw new Error('食物识别失败，请重试');
    }
  }

  async getImageBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      return base64;
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      throw new Error('图片处理失败');
    }
  }
}

export const foodRecognitionService = new FoodRecognitionService();
