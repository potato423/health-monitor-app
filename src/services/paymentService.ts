import { Platform } from 'react-native';

interface Subscription {
  productId: string;
  price: string;
  period: 'monthly' | 'yearly';
  isActive: boolean;
}

class PaymentService {
  private readonly PRODUCTS = {
    monthly: 'health_monitor_monthly',
    yearly: 'health_monitor_yearly',
  };

  private readonly PRICES = {
    monthly: '$15',
    yearly: '$108',
  };

  async checkTrialStatus(): Promise<{ isTrial: boolean; trialEndDate: Date | null }> {
    // 实际实现需要检查用户订阅状态
    // 这里简化处理
    const installDate = await this.getInstallDate();
    const now = new Date();
    const trialEndDate = new Date(installDate.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      isTrial: now < trialEndDate,
      trialEndDate: now < trialEndDate ? trialEndDate : null,
    };
  }

  private async getInstallDate(): Promise<Date> {
    // 实际实现需要从存储中读取安装日期
    // 这里简化处理，返回当前时间
    return new Date();
  }

  async purchase(productId: string): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // iOS App Store购买流程
        return await this.purchaseIOS(productId);
      } else {
        // Android Google Play购买流程
        return await this.purchaseAndroid(productId);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  }

  private async purchaseIOS(productId: string): Promise<boolean> {
    // 实际实现需要集成StoreKit
    // 这里简化处理
    console.log('iOS purchase:', productId);
    return true;
  }

  private async purchaseAndroid(productId: string): Promise<boolean> {
    // 实际实现需要集成Google Play Billing
    // 这里简化处理
    console.log('Android purchase:', productId);
    return true;
  }

  async restorePurchases(): Promise<boolean> {
    try {
      // 实际实现需要恢复购买
      console.log('Restoring purchases');
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }

  getProducts(): Subscription[] {
    return [
      {
        productId: this.PRODUCTS.monthly,
        price: this.PRICES.monthly,
        period: 'monthly',
        isActive: false,
      },
      {
        productId: this.PRODUCTS.yearly,
        price: this.PRICES.yearly,
        period: 'yearly',
        isActive: false,
      },
    ];
  }
}

export const paymentService = new PaymentService();