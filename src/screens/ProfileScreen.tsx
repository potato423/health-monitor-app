import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, Spacing, Radius, Shadow } from '../constants/colors';
import { RootStackParamList } from '../../App';

type Nav = StackNavigationProp<RootStackParamList>;

interface HealthCondition {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const CONDITIONS: HealthCondition[] = [
  { id: 'hyperuricemia', label: '高尿酸血症', icon: 'water', color: Colors.teal },
  { id: 'hypertension', label: '高血压', icon: 'heart', color: Colors.red },
  { id: 'diabetes', label: '糖尿病', icon: 'flash', color: Colors.orange },
  { id: 'hyperlipidemia', label: '高血脂', icon: 'fitness', color: Colors.purple },
  { id: 'kidneyIssues', label: '肾脏问题', icon: 'medkit', color: Colors.indigo },
  { id: 'obesity', label: '体重管理', icon: 'scale', color: Colors.green },
];

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  showChevron = true,
  rightElement,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.6 : 1}>
      <View style={[styles.settingIconWrap, { backgroundColor: iconColor }]}>
        <Ionicons name={icon as any} size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {rightElement}
        {showChevron && !rightElement && (
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(
    new Set(['hyperuricemia', 'hypertension'])
  );
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [waterReminder, setWaterReminder] = useState(false);

  const toggleCondition = (id: string) => {
    setSelectedConditions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navClose}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-down" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>个人中心</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.navEdit}>编辑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar + Name */}
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
            <Text style={styles.premiumBadgeText}>免费试用中 · 升级 Pro</Text>
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
                  <Text style={[styles.conditionChipText, selected && { color: c.color }]}>
                    {c.label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={14} color={c.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Health Metrics */}
        <SectionHeader title="健康指标" />
        <View style={styles.card}>
          <SettingRow icon="water-outline" iconColor={Colors.teal} label="尿酸" value="362 μmol/L" onPress={() => {}} />
          <Divider />
          <SettingRow icon="heart-outline" iconColor={Colors.red} label="血压" value="118/76 mmHg" onPress={() => {}} />
          <Divider />
          <SettingRow icon="flash-outline" iconColor={Colors.orange} label="血糖" value="5.8 mmol/L" onPress={() => {}} />
          <Divider />
          <SettingRow icon="fitness-outline" iconColor={Colors.purple} label="体重" value="72 kg" onPress={() => {}} />
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
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
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
                value={waterReminder}
                onValueChange={setWaterReminder}
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
            value="免费试用中"
            onPress={() => navigation.navigate('Paywall')}
          />
          <Divider />
          <SettingRow
            icon="refresh-outline"
            iconColor={Colors.blue}
            label="恢复购买"
            onPress={() => Alert.alert('恢复购买', '未找到购买记录')}
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
            value="1.0.0"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  navClose: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.systemFill,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  navEdit: { fontSize: 17, color: Colors.blue, fontWeight: '500' },
  scrollContent: { paddingBottom: 20 },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.blue,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.button,
  },
  userName: { fontSize: 22, fontWeight: '700', color: Colors.text },
  userSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    marginTop: Spacing.md,
  },
  premiumBadgeText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.secondaryBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  conditionHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    lineHeight: 18,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.separator,
    backgroundColor: Colors.systemFill,
  },
  conditionChipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  settingIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingLabel: { flex: 1, fontSize: 15, color: Colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  settingValue: { fontSize: 15, color: Colors.textSecondary },
  divider: { height: 0.5, backgroundColor: Colors.separator, marginLeft: 30 + Spacing.md + Spacing.lg },
  signOutCard: { marginTop: Spacing.xl },
  signOutButton: { paddingVertical: Spacing.lg, alignItems: 'center' },
  signOutText: { fontSize: 17, color: Colors.red, fontWeight: '500' },
});
