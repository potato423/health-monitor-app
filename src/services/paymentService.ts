import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from './storage';

export interface SubscriptionProduct {
  productId: string;
  price: string;
  pricePerMonth: string;
  period: 'monthly' | 'yearly';
  savings?: string;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

const PRODUCTS: SubscriptionProduct[] = [
  {
    productId: 'com.healthmonitor.monthly',
    price: '$14.99',
    pricePerMonth: '$14.99 / 月',
    period: 'monthly',
  },
  {
    productId: 'com.healthmonitor.yearly',
    price: '$89.99',
    pricePerMonth: '$7.50 / 月',
    period: 'yearly',
    savings: '省 50%',
  },
];

class PaymentService {
  getProducts(): SubscriptionProduct[] {
    return PRODUCTS;
  }

  async getTrialStatus(): Promise<{ isTrial: boolean; daysLeft: number }> {
    const installDate = await storageService.getInstallDate();
    const now = new Date();
    const trialDays = 3;
    const msPerDay = 86_400_000;
    const elapsed = Math.floor((now.getTime() - installDate.getTime()) / msPerDay);
    const daysLeft = Math.max(0, trialDays - elapsed);
    return { isTrial: daysLeft > 0, daysLeft };
  }

  async purchase(productId: string): Promise<PurchaseResult> {
    // In production, integrate expo-in-app-purchases or react-native-purchases (RevenueCat).
    // This implementation simulates the purchase flow for demo/development builds.
    return new Promise((resolve) => {
      setTimeout(async () => {
        await storageService.setSubscriptionStatus('pro');
        resolve({ success: true });
      }, 1500);
    });
  }

  async restorePurchases(): Promise<PurchaseResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: false, error: '未找到购买记录' });
      }, 1000);
    });
  }

  async isSubscribed(): Promise<boolean> {
    const status = await storageService.getSubscriptionStatus();
    return status === 'pro';
  }
}

export const paymentService = new PaymentService();
