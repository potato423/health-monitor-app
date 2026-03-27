import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface ReminderConfig {
  hour: number;
  minute: number;
  title: string;
  body: string;
}

const MEAL_REMINDERS: ReminderConfig[] = [
  { hour: 7,  minute: 45, title: '早餐记录提醒 ☀️', body: '早餐吃了什么？记录一下，AI 为你分析健康影响' },
  { hour: 12, minute: 0,  title: '午餐记录提醒 🌤️', body: '午饭时间到了，别忘了记录今天的午餐' },
  { hour: 18, minute: 30, title: '晚餐记录提醒 🌙', body: '一天快结束了，记录晚餐完成今日饮食追踪' },
];

const WATER_REMINDERS: ReminderConfig[] = [
  { hour: 9,  minute: 0,  title: '喝水提醒 💧', body: '已工作一段时间了，记得喝 200ml 水' },
  { hour: 11, minute: 0,  title: '喝水提醒 💧', body: '多喝水有助于尿酸排泄，现在补充一杯' },
  { hour: 14, minute: 30, title: '喝水提醒 💧', body: '午后补水，建议全天饮水 2000ml 以上' },
  { hour: 16, minute: 30, title: '喝水提醒 💧', body: '下午喝水时间，保持充足水分摄入' },
];

class NotificationService {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('meal-reminders', {
        name: '三餐提醒',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async scheduleMealReminders(): Promise<void> {
    // Cancel existing meal reminders before re-scheduling
    await this.cancelMealReminders();

    for (const r of MEAL_REMINDERS) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: r.title,
          body: r.body,
          sound: true,
          categoryIdentifier: 'meal-reminder',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: r.hour,
          minute: r.minute,
        },
      });
    }
  }

  async scheduleWaterReminders(): Promise<void> {
    await this.cancelWaterReminders();

    for (const r of WATER_REMINDERS) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: r.title,
          body: r.body,
          sound: false,
          categoryIdentifier: 'water-reminder',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: r.hour,
          minute: r.minute,
        },
      });
    }
  }

  async cancelMealReminders(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.categoryIdentifier === 'meal-reminder') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  }

  async cancelWaterReminders(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.categoryIdentifier === 'water-reminder') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  }

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
