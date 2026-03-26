import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { i18n, Language } from '../i18n';

export default function HomeScreen() {
  const [lang, setLang] = useState<Language>('zh');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const t = i18n[lang];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t.home.greeting}</Text>
          <Text style={styles.date}>3月25日 周三 · Mar 25 Wed</Text>
        </View>
        <TouchableOpacity 
          style={styles.langButton}
          onPress={() => setShowLangPicker(true)}
        >
          <Text style={styles.langText}>{lang === 'zh' ? '中' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        <TouchableOpacity style={styles.scanButton}>
          <View style={styles.scanIconContainer}>
            <Ionicons name="camera" size={52} color="#FFFFFF" />
          </View>
          <Text style={styles.scanTitle}>{t.home.scanFood}</Text>
          <Text style={styles.scanTitleEn}>Scan Food</Text>
          <Text style={styles.scanSubtitle}>{t.home.scanSubtitle}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="images-outline" size={26} color="#34C759" />
          </View>
          <Text style={styles.actionText}>{t.home.fromAlbum}</Text>
          <Text style={styles.actionTextEn}>From Album</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="create-outline" size={26} color="#FF9500" />
          </View>
          <Text style={styles.actionText}>{t.home.manualAdd}</Text>
          <Text style={styles.actionTextEn}>Manual Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipCard}>
        <Ionicons name="bulb" size={20} color="#5856D6" />
        <View style={styles.tipContent}>
          <Text style={styles.tipText}>{t.home.todayTip}</Text>
          <Text style={styles.tipTextEn}>Today's tip: Eat more vegetables, reduce high-purine foods</Text>
        </View>
      </View>

      <Modal
        visible={showLangPicker}
        transparent
        animationType="fade"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowLangPicker(false)}
        >
          <View style={styles.langPicker}>
            <Text style={styles.langPickerTitle}>语言 / Language</Text>
            <TouchableOpacity 
              style={[styles.langOption, lang === 'zh' && styles.langOptionActive]}
              onPress={() => { setLang('zh'); setShowLangPicker(false); }}
            >
              <Text style={styles.langOptionText}>中文</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.langOption, lang === 'en' && styles.langOptionActive]}
              onPress={() => { setLang('en'); setShowLangPicker(false); }}
            >
              <Text style={styles.langOptionText}>English</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 4,
  },
  langButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  scanIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scanTitleEn: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scanSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  actionTextEn: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
  },
  tipTextEn: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: 280,
  },
  langPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  langOption: {
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  langOptionActive: {
    backgroundColor: '#007AFF',
  },
  langOptionText: {
    fontSize: 17,
    color: '#000000',
    textAlign: 'center',
  },
});