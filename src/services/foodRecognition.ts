import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { medicalAPIService, FoodAnalysisResult } from './medicalAPI';
import { storageService } from './storage';

export type { FoodAnalysisResult };

class FoodRecognitionService {
  async captureFromCamera(): Promise<FoodAnalysisResult | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相机权限', '请在设置中允许访问相机', [
        { text: '取消', style: 'cancel' },
        { text: '去设置', onPress: () => ImagePicker.requestCameraPermissionsAsync() },
      ]);
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return null;
    return this.analyzeUri(result.assets[0].uri);
  }

  async captureFromLibrary(): Promise<FoodAnalysisResult | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相册权限', '请在设置中允许访问相册');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return null;
    return this.analyzeUri(result.assets[0].uri);
  }

  private async analyzeUri(uri: string): Promise<FoodAnalysisResult> {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const profile = await storageService.getUserProfile();
    const result = await medicalAPIService.analyzeFood(base64, profile);
    // Attach the local image URI for display
    return { ...result, _imageUri: uri } as FoodAnalysisResult & { _imageUri: string };
  }
}

export const foodRecognitionService = new FoodRecognitionService();
