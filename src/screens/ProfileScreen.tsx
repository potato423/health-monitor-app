import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Switch, Alert, Linking, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadow, Type } from '../constants/colors';
import { RootStackParamList } from '../../App';
import { storageService } from '../services/storage';
import { notificationService } from '../services/notificationService';
import { HealthCondition, HealthMetrics, UserHealthProfile } from '../types';

type Nav = StackNavigationProp<RootStackParamList>;

const CONDITIONS: { id: HealthCondition; label: string; icon: string; color: string }[] = [
  { id: 'hyperuricemia',  label: 'Gout / High Uric Acid',  icon: 'water',   color: Colors.teal },
  { id: 'hypertension',   label: 'High Blood Pressure',     icon: 'heart',   color: Colors.red },
  { id: 'diabetes',       label: 'Diabetes',                icon: 'flash',   color: Colors.orange },
  { id: 'hyperlipidemia', label: 'High Cholesterol',        icon: 'fitness', color: Colors.purple },
  { id: 'kidneyIssues',   label: 'Kidney Disease',          icon: 'medkit',  color: Colors.indigo },
  { id: 'obesity',        label: 'Weight Management',       icon: 'scale',   color: Colors.green },
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

const METRICS: MetricField[] = [
  { key: 'uricAcid',   label: 'Uric Acid',       unit: 'μmol/L', icon: 'water-outline',   iconColor: Colors.teal,   placeholder: 'e.g. 362', display: m => m.uricAcid   != null ? `${m.uricAcid} μmol/L`           : 'Not set' },
  { key: 'systolic',   label: 'Blood Pressure',   unit: 'mmHg',   icon: 'heart-outline',   iconColor: Colors.red,    placeholder: 'e.g. 120', display: m => m.systolic   != null ? `${m.systolic}/${m.diastolic ?? '?'} mmHg` : 'Not set' },
  { key: 'bloodSugar', label: 'Blood Sugar',      unit: 'mmol/L', icon: 'flash-outline',   iconColor: Colors.orange, placeholder: 'e.g. 5.8', display: m => m.bloodSugar != null ? `${m.bloodSugar} mmol/L`          : 'Not set' },
  { key: 'weight',     label: 'Weight',           unit: 'kg',     icon: 'fitness-outline', iconColor: Colors.purple, placeholder: 'e.g. 70',  display: m => m.weight     != null ? `${m.weight} kg`                 : 'Not set' },
];

// ─── Metric Modal ─────────────────────────────────────────────────────────────
function MetricModal({ field, metrics, onSave, onClose }: {
  field: MetricField | null; metrics: HealthMetrics;
  onSave: (key: keyof HealthMetrics, val: number) => void; onClose: () => void;
}) {
  const [val, setVal] = useState('');
  React.useEffect(() => {
    if (field) setVal(field.key in metrics && metrics[field.key] != null ? String(metrics[field.key]) : '');
  }, [field]);
  if (!field) return null;
  const save = () => {
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) { Alert.alert('Invalid value', 'Please enter a positive number.'); return; }
    onSave(field.key, n); onClose();
  };
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Update {field.label}</Text>
          <Text style={styles.modalSub}>Enter value in {field.unit}</Text>
          <View style={styles.inputWrap}>
            <TextInput style={styles.input} value={val} onChangeText={setVal}
              keyboardType="decimal-pad" placeholder={field.placeholder}
              placeholderTextColor={Colors.textTertiary} autoFocus
              returnKeyType="done" onSubmitEditing={save} />
            <Text style={styles.inputUnit}>{field.unit}</Text>
          </View>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({ icon, iconColor, label, value, onPress, rightElement }: {
  icon: string; iconColor: string; label: string; value?: string;
  onPress?: () => void; rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.6 : 1}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor }]}>
        <Ionicons name={icon as any} size={15} color="#fff" />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue} numberOfLines={1}>{value}</Text>}
        {rightElement}
        {!rightElement && onPress && <Ionicons name="chevron-forward" size={15} color={Colors.textTertiary} />}
      </View>
    </TouchableOpacity>
  );
}
function Divider() { return <View style={styles.divider} />; }
function SectionLabel({ title }: { title: string }) { return <Text style={styles.sectionLabel}>{title}</Text>; }

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [profile, setProfile]       = useState<UserHealthProfile | null>(null);
  const [editField, setEditField]   = useState<MetricField | null>(null);
  const [subLabel, setSubLabel]     = useState('Free Trial');

  useFocusEffect(useCallback(() => {
    storageService.getUserProfile().then(setProfile);
    storageService.getSubscriptionStatus().then(s => setSubLabel(s === 'pro' ? 'Pro Member' : 'Free Trial'));
  }, []));

  if (!profile) return null;

  const selected = new Set(profile.conditions);
  const prefs = profile.preferences;
  const metrics = profile.currentMetrics;

  const toggleCondition = async (id: HealthCondition) => {
    await Haptics.selectionAsync();
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    const updated = { ...profile, conditions: Array.from(next) as HealthCondition[] };
    setProfile(updated);
    await storageService.saveUserProfile(updated);
  };

  const saveMetric = async (key: keyof HealthMetrics, value: number) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await storageService.updateMetrics({ [key]: value });
    setProfile(await storageService.getUserProfile());
  };

  const handleReminderToggle = async (on: boolean) => {
    await Haptics.selectionAsync();
    if (on) {
      const ok = await notificationService.requestPermission();
      if (!ok) { Alert.alert('Permission Required', 'Enable notifications in your device Settings.'); return; }
      await notificationService.scheduleMealReminders();
    } else {
      await notificationService.cancelMealReminders();
    }
    await storageService.updatePreferences({ reminders: on });
    setProfile(p => p ? { ...p, preferences: { ...p.preferences, reminders: on } } : p);
  };

  const handleWaterToggle = async (on: boolean) => {
    await Haptics.selectionAsync();
    if (on) {
      const ok = await notificationService.requestPermission();
      if (!ok) return;
      await notificationService.scheduleWaterReminders();
    } else {
      await notificationService.cancelWaterReminders();
    }
    await storageService.updatePreferences({ waterReminder: on });
    setProfile(p => p ? { ...p, preferences: { ...p.preferences, waterReminder: on } } : p);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navClose} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-down" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={44} color="#fff" />
          </View>
          <Text style={styles.userName}>Your Health Profile</Text>
          <Text style={styles.userSub}>Personalized for your conditions</Text>
          <TouchableOpacity style={styles.proBadge} onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
            <Ionicons name="sparkles" size={13} color="#F59E0B" />
            <Text style={styles.proBadgeText}>{subLabel} · Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Conditions */}
        <SectionLabel title="MY CONDITIONS" />
        <View style={styles.card}>
          <Text style={styles.condHint}>
            Select all that apply — your food scores are calibrated to these conditions.
          </Text>
          <View style={styles.condGrid}>
            {CONDITIONS.map(c => {
              const on = selected.has(c.id);
              return (
                <TouchableOpacity key={c.id}
                  style={[styles.condChip, on && { backgroundColor: c.color + '1A', borderColor: c.color }]}
                  onPress={() => toggleCondition(c.id)} activeOpacity={0.7}>
                  <Ionicons name={c.icon as any} size={15} color={on ? c.color : Colors.textSecondary} />
                  <Text style={[styles.condLabel, on && { color: c.color }]}>{c.label}</Text>
                  {on && <Ionicons name="checkmark-circle" size={14} color={c.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Metrics */}
        <SectionLabel title="HEALTH METRICS" />
        <View style={styles.card}>
          {METRICS.map((f, i) => (
            <React.Fragment key={f.key}>
              <SettingRow icon={f.icon} iconColor={f.iconColor} label={f.label}
                value={f.display(metrics)} onPress={() => setEditField(f)} />
              {i < METRICS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        {/* Notifications */}
        <SectionLabel title="NOTIFICATIONS" />
        <View style={styles.card}>
          <SettingRow icon="notifications-outline" iconColor={Colors.primary} label="Meal Reminders"
            rightElement={
              <Switch value={prefs.reminders} onValueChange={handleReminderToggle}
                trackColor={{ false: Colors.systemFill, true: Colors.primary }} thumbColor="#fff" />
            } />
          <Divider />
          <SettingRow icon="water-outline" iconColor={Colors.teal} label="Hydration Reminders"
            rightElement={
              <Switch value={prefs.waterReminder ?? false} onValueChange={handleWaterToggle}
                trackColor={{ false: Colors.systemFill, true: Colors.teal }} thumbColor="#fff" />
            } />
        </View>

        {/* Subscription */}
        <SectionLabel title="SUBSCRIPTION" />
        <View style={styles.card}>
          <SettingRow icon="star-outline" iconColor={Colors.orange} label="Upgrade to Pro"
            value={subLabel} onPress={() => navigation.navigate('Paywall')} />
          <Divider />
          <SettingRow icon="refresh-outline" iconColor={Colors.primary} label="Restore Purchase"
            onPress={() => Alert.alert('Nothing to Restore', 'No previous purchase found for this Apple ID.')} />
        </View>

        {/* Legal */}
        <SectionLabel title="LEGAL" />
        <View style={styles.card}>
          <SettingRow icon="document-text-outline" iconColor={Colors.indigo} label="Privacy Policy"
            onPress={() => Linking.openURL('https://potato423.github.io/health-monitor-app/privacy-policy.html')} />
          <Divider />
          <SettingRow icon="shield-outline" iconColor={Colors.green} label="Terms of Service"
            onPress={() => Linking.openURL('https://potato423.github.io/health-monitor-app/terms.html')} />
          <Divider />
          <SettingRow icon="information-circle-outline" iconColor={Colors.textSecondary}
            label="Version" value="1.1.0" />
        </View>

        {/* Sign Out */}
        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <TouchableOpacity style={styles.signOutBtn}
            onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => {} },
            ])} activeOpacity={0.7}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <MetricModal field={editField} metrics={metrics} onSave={saveMetric} onClose={() => setEditField(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  navClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.systemFill, alignItems: 'center', justifyContent: 'center' },
  navTitle: { ...Type.headline, color: Colors.text },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xxl },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, ...Shadow.button },
  userName: { ...Type.title2, color: Colors.text },
  userSub: { ...Type.callout, color: Colors.textSecondary, marginTop: 4 },
  proBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: '#0F172A', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill, marginTop: Spacing.md },
  proBadgeText: { ...Type.subhead, fontWeight: '600', color: '#fff' },
  sectionLabel: { ...Type.caption, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.8, paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  card: { backgroundColor: Colors.cardBackground, marginHorizontal: Spacing.xl, borderRadius: Radius.xxl, overflow: 'hidden', ...Shadow.card },
  condHint: { ...Type.callout, color: Colors.textSecondary, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm, lineHeight: 20 },
  condGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  condChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Colors.separator, backgroundColor: Colors.systemFill },
  condLabel: { ...Type.subhead, color: Colors.textSecondary },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  settingIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  settingLabel: { flex: 1, ...Type.callout, color: Colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, maxWidth: 160 },
  settingValue: { ...Type.callout, color: Colors.textSecondary, flexShrink: 1, textAlign: 'right' },
  divider: { height: 0.5, backgroundColor: Colors.separator, marginLeft: 30 + Spacing.md + Spacing.lg },
  signOutBtn: { paddingVertical: Spacing.lg, alignItems: 'center' },
  signOutText: { ...Type.headline, color: Colors.red, fontWeight: '500' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { backgroundColor: Colors.cardBackground, borderTopLeftRadius: Radius.xxxl, borderTopRightRadius: Radius.xxxl, padding: Spacing.xl, paddingBottom: 44 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.separator, alignSelf: 'center', marginBottom: Spacing.xl },
  modalTitle: { ...Type.title2, color: Colors.text, marginBottom: 4 },
  modalSub: { ...Type.callout, color: Colors.textSecondary, marginBottom: Spacing.xl },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: Radius.xl, paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  input: { flex: 1, fontSize: 30, fontWeight: '700', color: Colors.text, paddingVertical: Spacing.lg },
  inputUnit: { ...Type.callout, color: Colors.textSecondary },
  modalBtns: { flexDirection: 'row', gap: Spacing.md },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: Radius.pill, backgroundColor: Colors.systemFill, alignItems: 'center' },
  cancelBtnText: { ...Type.headline, color: Colors.text },
  saveBtn: { flex: 2, paddingVertical: 15, borderRadius: Radius.pill, backgroundColor: Colors.primary, alignItems: 'center', ...Shadow.button },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
