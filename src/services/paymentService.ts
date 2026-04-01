/**
 * paymentService.ts
 *
 * Uses expo-in-app-purchases → Apple StoreKit (iOS) exclusively.
 * No PayPal, Stripe, or any third-party payment processor.
 * Apple takes 15–30% commission and handles all billing, receipts, and refunds.
 *
 * Setup checklist (before submitting to App Store):
 *  1. Create subscription products in App Store Connect
 *  2. Set productIds below to match exactly
 *  3. Add "In-App Purchase" capability in Xcode / EAS
 *  4. Run on a real device (IAP doesn't work in Expo Go or simulator)
 */

import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';
import { storageService } from './storage';

// ── Product IDs (must match App Store Connect exactly) ──────────────────────
export const PRODUCT_IDS = {
  monthly: 'com.healthmonitor.chroniccare.monthly',
  yearly:  'com.healthmonitor.chroniccare.yearly',
} as const;

export interface SubscriptionProduct {
  productId: string;
  title: string;
  price: string;
  pricePerMonth: string;
  period: 'monthly' | 'yearly';
  savings?: string;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

// Fallback display prices when StoreKit is unavailable (Expo Go / simulator)
const FALLBACK_PRODUCTS: SubscriptionProduct[] = [
  {
    productId: PRODUCT_IDS.monthly,
    title:        'Monthly',
    price:        '$14.99',
    pricePerMonth:'$14.99 / mo',
    period:       'monthly',
  },
  {
    productId: PRODUCT_IDS.yearly,
    title:        'Annual',
    price:        '$89.99',
    pricePerMonth:'$7.50 / mo',
    period:       'yearly',
    savings:      'Save 50%',
  },
];

// ── Service ──────────────────────────────────────────────────────────────────

class PaymentService {
  private connected = false;
  private cachedProducts: SubscriptionProduct[] = [];

  // ── Connect to StoreKit ──────────────────────────────────────────────────

  private async connect(): Promise<void> {
    if (this.connected) return;
    try {
      await InAppPurchases.connectAsync();
      this.connected = true;

      // Listen for purchase updates
      InAppPurchases.setPurchaseListener(async ({ responseCode, results }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
          for (const purchase of results) {
            if (!purchase.acknowledged) {
              // Finish the transaction (required by Apple)
              await InAppPurchases.finishTransactionAsync(purchase, true);
              await storageService.setSubscriptionStatus('pro');
            }
          }
        }
      });
    } catch (e) {
      // IAP not available in Expo Go or simulator — handled gracefully
      console.warn('[IAP] StoreKit not available:', e);
    }
  }

  // ── Load products from App Store ─────────────────────────────────────────

  async getProducts(): Promise<SubscriptionProduct[]> {
    if (this.cachedProducts.length) return this.cachedProducts;

    if (Platform.OS !== 'ios') return FALLBACK_PRODUCTS;

    try {
      await this.connect();
      const { responseCode, results } = await InAppPurchases.getProductsAsync(
        Object.values(PRODUCT_IDS)
      );

      if (responseCode === InAppPurchases.IAPResponseCode.OK && results?.length) {
        this.cachedProducts = results.map(p => {
          const isYearly = p.productId === PRODUCT_IDS.yearly;
          // price is already formatted with currency symbol (e.g. "$89.99")
          const yearlyMonthly = isYearly && p.priceAmountMicros
            ? `$${(p.priceAmountMicros / 12_000_000).toFixed(2)} / mo`
            : `${p.price} / mo`;
          return {
            productId:     p.productId,
            title:         isYearly ? 'Annual' : 'Monthly',
            price:         p.price ?? (isYearly ? '$89.99' : '$14.99'),
            pricePerMonth: isYearly ? yearlyMonthly : `${p.price} / mo`,
            period:        isYearly ? 'yearly' : 'monthly',
            savings:       isYearly ? 'Save 50%' : undefined,
          };
        });
        return this.cachedProducts;
      }
    } catch (e) {
      console.warn('[IAP] Failed to load products:', e);
    }

    // Fall back to hardcoded prices if StoreKit unavailable
    return FALLBACK_PRODUCTS;
  }

  // ── Purchase ─────────────────────────────────────────────────────────────

  async purchase(productId: string): Promise<PurchaseResult> {
    if (Platform.OS !== 'ios') {
      // Non-iOS: simulate for development
      await new Promise(r => setTimeout(r, 1200));
      await storageService.setSubscriptionStatus('pro');
      return { success: true };
    }

    try {
      await this.connect();
      await InAppPurchases.purchaseItemAsync(productId);
      // Result is handled asynchronously by setPurchaseListener above
      return { success: true };
    } catch (e: any) {
      if (e?.code === 'E_USER_CANCELLED') {
        return { success: false, error: 'Purchase cancelled.' };
      }
      return { success: false, error: 'Purchase failed. Please try again.' };
    }
  }

  // ── Restore (required by Apple guidelines) ───────────────────────────────

  async restorePurchases(): Promise<PurchaseResult> {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'No previous purchase found for this Apple ID.' };
    }

    try {
      await this.connect();
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();

      if (responseCode === InAppPurchases.IAPResponseCode.OK && results?.length) {
        const active = results.find(p =>
          Object.values(PRODUCT_IDS).includes(p.productId as any)
        );
        if (active) {
          await storageService.setSubscriptionStatus('pro');
          return { success: true };
        }
      }
      return { success: false, error: 'No previous purchase found for this Apple ID.' };
    } catch (e) {
      return { success: false, error: 'Restore failed. Please try again.' };
    }
  }

  // ── Trial status ─────────────────────────────────────────────────────────

  async getTrialStatus(): Promise<{ isTrial: boolean; daysLeft: number }> {
    const installDate = await storageService.getInstallDate();
    const elapsed = Math.floor((Date.now() - installDate.getTime()) / 86_400_000);
    const daysLeft = Math.max(0, 3 - elapsed);
    return { isTrial: daysLeft > 0, daysLeft };
  }

  // ── Subscription check ───────────────────────────────────────────────────

  async isSubscribed(): Promise<boolean> {
    const status = await storageService.getSubscriptionStatus();
    return status === 'pro';
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────

  async disconnect(): Promise<void> {
    if (this.connected) {
      try { await InAppPurchases.disconnectAsync(); } catch {}
      this.connected = false;
    }
  }
}

export const paymentService = new PaymentService();
