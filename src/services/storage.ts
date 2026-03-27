import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserHealthProfile, HealthCondition, HealthMetrics } from '../types';

const KEYS = {
  onboardingDone: 'onboarding_completed',
  userProfile: 'user_health_profile',
  installDate: 'install_date',
  subscriptionStatus: 'subscription_status',
} as const;

class StorageService {
  async isOnboardingDone(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.onboardingDone);
    return val === 'true';
  }

  async setOnboardingDone(): Promise<void> {
    await AsyncStorage.setItem(KEYS.onboardingDone, 'true');
  }

  async getUserProfile(): Promise<UserHealthProfile> {
    const raw = await AsyncStorage.getItem(KEYS.userProfile);
    if (raw) return JSON.parse(raw) as UserHealthProfile;
    return this.defaultProfile();
  }

  async saveUserProfile(profile: UserHealthProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.userProfile, JSON.stringify(profile));
  }

  async updateConditions(conditions: HealthCondition[]): Promise<void> {
    const profile = await this.getUserProfile();
    profile.conditions = conditions;
    await this.saveUserProfile(profile);
  }

  async updateMetrics(metrics: Partial<HealthMetrics>): Promise<void> {
    const profile = await this.getUserProfile();
    profile.currentMetrics = { ...profile.currentMetrics, ...metrics };
    await this.saveUserProfile(profile);
  }

  async getInstallDate(): Promise<Date> {
    const raw = await AsyncStorage.getItem(KEYS.installDate);
    if (raw) return new Date(raw);
    const now = new Date();
    await AsyncStorage.setItem(KEYS.installDate, now.toISOString());
    return now;
  }

  async getSubscriptionStatus(): Promise<'free' | 'trial' | 'pro'> {
    const val = await AsyncStorage.getItem(KEYS.subscriptionStatus);
    return (val as 'free' | 'trial' | 'pro') ?? 'trial';
  }

  async setSubscriptionStatus(status: 'free' | 'trial' | 'pro'): Promise<void> {
    await AsyncStorage.setItem(KEYS.subscriptionStatus, status);
  }

  private defaultProfile(): UserHealthProfile {
    return {
      userId: Math.random().toString(36).slice(2),
      conditions: ['hyperuricemia'],
      currentMetrics: {},
      preferences: {
        reminders: true,
        reminderInterval: 8,
        theme: 'light',
      },
    };
  }
}

export const storageService = new StorageService();
