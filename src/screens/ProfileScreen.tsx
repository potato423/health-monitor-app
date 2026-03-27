import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { storageService } from '../services/storage';
import { notificationService } from '../services/notificationService';
import { HealthCondition, HealthMetrics, UserHealthProfile } from '../types';

type Nav = StackNavigationProp<RootStackParamList>;

// ─── Condition config ─────────────────────────────────────────────────────────

const CONDITIONS: { id: HealthCondition; label: string; icon: string; color: string }[] = [
  { id: 'hyperuricemia', label: '高尿酸血症', icon: 'water', color: Colors.teal },
  { id: 'hypertension',  label: '高血压',     icon: 'heart', color: Colors.red },
  { id: 'diabetes',      label: '糖尿病',     icon: 'flash', color: Colors.orange },
  { id: 'hyperlipidemia',label: '高血脂',     icon: 'fitness', color: Colors.purple },
  { id: 'kidneyIssues',  label: '肾脏问题',   icon: 'medkit', color: Colors.indigo },
  { id: 'obesity',       label: '体重管理',   icon: 'scale', color: Colors.green },
];

interface MetricField {
  key: keyof HealthMetrics;
  label: string;
  unit: string;
  icon: string;
  iconColor: string;
  placeholder: string;
  display: (m: HealthMetrics) => string;
}

const METRIC_FIELDS: MetricField[] = [
  {
    key: 'uricAcid', label: '尿酸', unit: 'μmol/L',
    icon: 'water-outline', iconColor: Colors.teal,
    placeholder: '例如: 362',
    display: (m) => m.uricAcid != null ? `${m.uricAcid} μmol/L` : '未录入',
  },
  {
    key: 'systolic', label: '收缩压', unit: 'mmHg',
    icon: 'heart-outline', iconColor: Colors.red,
    placeholder: '例如: 120',
    display: (m) => m.systolic != null ? `${m.systolic}/${m.diastolic ?? '?'} mmHg` : '未录入',
  },
  {
    key: 'bloodSugar', label: '血糖', unit: 'mmol/L',
    icon: 'flash-outline', iconColor: Colors.orange,
    placeholder: '例如: 5.8',
    display: (m) => m.bloodSugar != null ? `${m.bloodSugar} mmol/L` : '未录入',
  },
  {
    key: 'weight', label: '体重', unit: 'kg',
    icon: 'fitness-outline', iconColor: Colors.purple,
    placeholder: '例如: 70',
    display: (m) => m.weight != null ? `${m.weight} kg` : '未录入',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function SettingRow({
  icon, iconColor, label, value, onPress, showChevron = true, rightElement,
}: {
  icon: string; iconColor: string; label: string; value?: string;
  onPress?: () => void; showChevron?: boolean; rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.6 : 1}>
      <View style={[styles.settingIconWrap, { backgroundColor: iconColor }]}>
        <Ionicons name={icon as any} size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue} numberOfLines={1}>{value}</Text>}
        {rightElement}
        {showChevron && !rightElement && (
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Metric Edit Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  field: MetricField | null;
  currentMetrics: HealthMetrics;
  onSave: (key: keyof HealthMetrics, value: number) => void;
  onClose: () => void;
}

function MetricEditModal({ field, currentMetrics, onSave, onClose }: EditModalProps) {
  const [value, setValue] = useState('');

  // Pre-fill on open
  React.useEffect(() => {
    if (field) {
      const cur = currentMetrics[field.key];
      setValue(cur != null ? String(cur) : '');
    }
  }, [field]);

  if (!field) return null;

  const handleSave = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      Alert.alert('请输入有效数值');
      return;
    }
    onSave(field.key, num);
    onClose();
  };

  return (
    <Modal visible={!!field} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>录入 {field.label}</Text>
          <Text style={styles.modalSub}>单位：{field.unit}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              placeholder={field.placeholder}
              placeholderTextColor={Colors.textTertiary}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <Text style={styles.inputUnit}>{field.unit}</Text>
          </View>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.modalSaveText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserHealthProfile | null>(null);
  const [editingField, setEditingField] = useState<MetricField | null>(null);
  const [subscriptionLabel, setSubscriptionLabel] = useState('免费试用中');

  useFocusEffect(
    useCallback(() => {
      storageService.getUserProfile().then(setProfile);
      storageService.getSubscriptionStatus().then((s) => {
        setSubscriptionLabel(s === 'pro' ? 'Pro 会员' : '免费试用中');
      });
    }, [])
  );

  if (!profile) return null;

  const selectedConditions = new Set(profile.conditions);

  const toggleCondition = async (id: HealthCondition) => {
    await Haptics.selectionAsync();
    const next = new Set(selectedConditions);
    next.has(id) ? next.delete(id) : next.add(id);
    const updated = { ...profile, conditions: Array.from(next) as HealthCondition[] };
    setProfile(updated);
    await storageService.saveUserProfile(updated);
  };

  const handleMetricSave = async (key: keyof HealthMetrics, value: number) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await storageService.updateMetrics({ [key]: value });
    const updated = await storageService.getUserProfile();
    setProfile(updated);
  };

  const handleReminderToggle = async (on: boolean) => {
    await Haptics.selectionAsync();
    if (on) {
      const granted = await notificationService.requestPermission();
      if (!granted) {
        Alert.alert('需要通知权限', '请在系统设置中开启通知权限');
        return;
      }
      await notificationService.scheduleMealReminders();
    } else {
      await notificationService.cancelAllReminders();
    }
    await storageService.updatePreferences({ reminders: on });
    setProfile((p) => p ? { ...p, preferences: { ...p.preferences, reminders: on } } : p);
  };

  const handleWaterToggle = async (on: boolean) => {
    await Haptics.selectionAsync();
    await storageService.updatePreferences({ waterReminder: on });
    setProfile((p) => p ? { ...p, preferences: { ...p.preferences, waterReminder: on } } : p);
  };

  const metrics = profile.currentMetrics;
  const prefs = profile.preferences;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navClose} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-down" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>个人中心</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>健康用户</Text>
          <Text style={styles.userSub}>管理你的健康档案</Text>
          <TouchableOpacity
            style={styles.premiumBadge}
            onPress={() => navigation.navigate('Paywall')}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={13} color="#FFD700" />
            <Text style={styles.premiumBadgeText}>{subscriptionLabel} · 升级 Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Health Conditions */}
        <SectionHeader title="我的健康状况" />
        <View style={styles.card}>
          <Text style={styles.conditionHint}>选择你的慢性病情况，让 AI 给出更精准的建议</Text>
          <View style={styles.conditionsGrid}>
            {CONDITIONS.map((c) => {
              const selected = selectedConditions.has(c.id);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.conditionChip, selected && { backgroundColor: c.color + '20', borderColor: c.color }]}
                  onPress={() => toggleCondition(c.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={c.icon as any} size={16} color={selected ? c.color : Colors.textSecondary} />
                  <Text style={[styles.conditionChipText, selected && { color: c.color }]}>{c.label}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={14} color={c.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Health Metrics */}
        <SectionHeader title="健康指标" />
        <View style={styles.card}>
          {METRIC_FIELDS.map((f, i) => (
            <React.Fragment key={f.key}>
              <SettingRow
                icon={f.icon}
                iconColor={f.iconColor}
                label={f.label}
                value={f.display(metrics)}
                onPress={() => setEditingField(f)}
              />
              {i < METRIC_FIELDS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        {/* Notifications */}
        <SectionHeader title="通知设置" />
        <View style={styles.card}>
          <SettingRow
            icon="notifications-outline"
            iconColor={Colors.blue}
            label="三餐记录提醒"
            showChevron={false}
            rightElement={
              <Switch
                value={prefs.reminders}
                onValueChange={handleReminderToggle}
                trackColor={{ false: Colors.systemFill, true: Colors.blue }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <Divider />
          <SettingRow
            icon="water-outline"
            iconColor={Colors.teal}
            label="饮水提醒"
            showChevron={false}
            rightElement={
              <Switch
                value={prefs.waterReminder ?? false}
                onValueChange={handleWaterToggle}
                trackColor={{ false: Colors.systemFill, true: Colors.teal }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Subscription */}
        <SectionHeader title="订阅" />
        <View style={styles.card}>
          <SettingRow
            icon="star-outline"
            iconColor={Colors.orange}
            label="升级到 Pro"
            value={subscriptionLabel}
            onPress={() => navigation.navigate('Paywall')}
          />
          <Divider />
          <SettingRow
            icon="refresh-outline"
            iconColor={Colors.blue}
            label="恢复购买"
            onPress={() => Alert.alert('恢复购买', '未找到购买记录，请确认登录了正确的 Apple ID')}
          />
        </View>

        {/* About */}
        <SectionHeader title="关于" />
        <View style={styles.card}>
          <SettingRow
            icon="document-text-outline"
            iconColor={Colors.indigo}
            label="隐私政策"
            onPress={() => Linking.openURL('https://example.com/privacy')}
          />
          <Divider />
          <SettingRow
            icon="shield-outline"
            iconColor={Colors.green}
            label="服务条款"
            onPress={() => Linking.openURL('https://example.com/terms')}
          />
          <Divider />
          <SettingRow
            icon="information-circle-outline"
            iconColor={Colors.textSecondary}
            label="版本"
            value="1.1.0"
            showChevron={false}
          />
        </View>

        {/* Sign Out */}
        <View style={[styles.card, styles.signOutCard]}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => Alert.alert('退出登录', '确认要退出吗？', [
              { text: '取消', style: 'cancel' },
              { text: '退出', style: 'destructive', onPress: () => {} },
            ])}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>退出登录</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Metric Edit Modal */}
      <MetricEditModal
        field={editingField}
        currentMetrics={metrics}
        onSave={handleMetricSave}
        onClose={() => setEditingField(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  navClose: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.systemFill,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  scrollContent: { paddingBottom: 20 },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.blue,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, ...Shadow.button,
  },
  userName: { fontSize: 22, fontWeight: '700', color: Colors.text },
  userSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.pill, marginTop: Spacing.md,
  },
  premiumBadgeText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  sectionHeader: {
    fontSize: 13, fontWeight: '500', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.secondaryBackground, marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.card,
  },
  conditionHint: {
    fontSize: 13, color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, lineHeight: 18,
  },
  conditionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm,
  },
  conditionChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.pill, borderWidth: 1,
    borderColor: Colors.separator, backgroundColor: Colors.systemFill,
  },
  conditionChipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  settingIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  settingLabel: { flex: 1, fontSize: 15, color: Colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, maxWidth: 160 },
  settingValue: { fontSize: 14, color: Colors.textSecondary, textAlign: 'right', flexShrink: 1 },
  divider: { height: 0.5, backgroundColor: Colors.separator, marginLeft: 30 + Spacing.md + Spacing.lg },
  signOutCard: { marginTop: Spacing.xl },
  signOutButton: { paddingVertical: Spacing.lg, alignItems: 'center' },
  signOutText: { fontSize: 17, color: Colors.red, fontWeight: '500' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: Colors.secondaryBackground,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.separator,
    alignSelf: 'center', marginBottom: Spacing.xl,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  modalSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.xl },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl,
  },
  input: {
    flex: 1, fontSize: 28, fontWeight: '700', color: Colors.text,
    paddingVertical: Spacing.lg,
  },
  inputUnit: { fontSize: 15, color: Colors.textSecondary, marginLeft: Spacing.sm },
  modalBtns: { flexDirection: 'row', gap: Spacing.md },
  modalCancelBtn: {
    flex: 1, paddingVertical: 15,
    borderRadius: Radius.pill, backgroundColor: Colors.systemFill,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: Colors.text },
  modalSaveBtn: {
    flex: 2, paddingVertical: 15,
    borderRadius: Radius.pill, backgroundColor: Colors.blue,
    alignItems: 'center',
    shadowColor: Colors.blue, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  modalSaveText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
