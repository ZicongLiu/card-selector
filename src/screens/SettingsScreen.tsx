import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfileStore } from '../store/useProfileStore';
import { useCardStore } from '../store/useCardStore';

const BENEFIT_CHECKS_KEY = 'benefit_checks';

export function SettingsScreen() {
  const { token, syncing, lastSynced, configured, importToken } = useProfileStore();
  const { loadFromProfile } = useCardStore();

  const [importInput, setImportInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleCopy = async () => {
    if (!token) return;
    await Clipboard.setStringAsync(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!importInput.trim()) return;
    setImportError('');
    setImportSuccess(false);
    setImporting(true);

    const result = await importToken(importInput.trim());
    setImporting(false);

    if (!result.ok) {
      setImportError(result.error);
      return;
    }

    // Apply the fetched profile locally
    const profile = result.profile;
    await loadFromProfile(profile.selected_ids ?? [], profile.custom_cards ?? []);

    if (profile.benefit_checks) {
      await AsyncStorage.setItem(BENEFIT_CHECKS_KEY, JSON.stringify(profile.benefit_checks));
    }

    setImportInput('');
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 3000);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Never';
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SMART WALLET</Text>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Sync status banner */}
      {!configured && (
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>⚠️</Text>
          <Text style={styles.bannerText}>
            Cloud sync is not configured. Your data is saved locally only.
          </Text>
        </View>
      )}

      {/* Your Token */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🔑</Text>
          <Text style={styles.cardTitle}>Your Sync Token</Text>
          {syncing && <ActivityIndicator size="small" color="#4361EE" style={{ marginLeft: 'auto' }} />}
        </View>
        <Text style={styles.cardDesc}>
          This token identifies your profile. Save it somewhere safe — you'll need it to restore your data on another device.
        </Text>

        <View style={styles.tokenBox}>
          <Text style={styles.tokenText} selectable numberOfLines={1}>
            {token ?? '—'}
          </Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.75}>
            <Text style={styles.copyBtnText}>{copied ? '✓ Copied' : 'Copy'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.syncMeta}>
          Last synced: {formatDate(lastSynced)}
        </Text>
      </View>

      {/* Import / Restore */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📥</Text>
          <Text style={styles.cardTitle}>Restore from Token</Text>
        </View>
        <Text style={styles.cardDesc}>
          Enter a token from another device to import its wallet and benefit data. This will replace your current local data.
        </Text>

        <TextInput
          style={[styles.input, importError ? styles.inputError : null]}
          placeholder="Paste your token here…"
          placeholderTextColor="#3A4A66"
          value={importInput}
          onChangeText={(t) => { setImportInput(t); setImportError(''); }}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {importError ? (
          <Text style={styles.errorText}>⚠ {importError}</Text>
        ) : null}

        {importSuccess ? (
          <Text style={styles.successText}>✓ Profile restored successfully!</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.importBtn, (!importInput.trim() || importing) && styles.importBtnDisabled]}
          onPress={handleImport}
          disabled={!importInput.trim() || importing}
          activeOpacity={0.8}
        >
          {importing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.importBtnText}>Restore Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* How it works */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>ℹ️</Text>
          <Text style={styles.cardTitle}>How Sync Works</Text>
        </View>
        <View style={styles.steps}>
          {[
            ['1', 'Copy your token on this device'],
            ['2', 'Open the app on another device'],
            ['3', 'Go to Settings → Restore from Token'],
            ['4', 'Paste the token and tap Restore'],
          ].map(([num, text]) => (
            <View key={num} style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{num}</Text>
              </View>
              <Text style={styles.stepText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  content: { padding: 20, paddingBottom: 60 },

  header: { marginBottom: 20 },
  eyebrow: { fontSize: 11, fontWeight: '700', color: '#4361EE', letterSpacing: 2.5, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },

  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1A1500',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3D3000',
    gap: 10,
  },
  bannerIcon: { fontSize: 16 },
  bannerText: { flex: 1, fontSize: 13, color: '#C8A400', lineHeight: 18 },

  card: {
    backgroundColor: '#161B24',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#232B3A',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardIcon: { fontSize: 18 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  cardDesc: { fontSize: 13, color: '#6B7A99', lineHeight: 18, marginBottom: 14 },

  tokenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1117',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2E3F6E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 10,
  },
  tokenText: {
    flex: 1,
    fontSize: 13,
    color: '#7B93FF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  copyBtn: {
    backgroundColor: '#4361EE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  copyBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  syncMeta: { fontSize: 11, color: '#3A4A66' },

  input: {
    backgroundColor: '#0D1117',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2E3F6E',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputError: { borderColor: '#EE4361' },
  errorText: { fontSize: 13, color: '#EE4361', marginBottom: 10 },
  successText: { fontSize: 13, color: '#22C55E', marginBottom: 10, fontWeight: '600' },

  importBtn: {
    backgroundColor: '#4361EE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  importBtnDisabled: { backgroundColor: '#1A2240', opacity: 0.6 },
  importBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  steps: { gap: 10 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A2240',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2E3F6E',
  },
  stepNum: { fontSize: 11, fontWeight: '800', color: '#7B93FF' },
  stepText: { fontSize: 13, color: '#8892A4', flex: 1 },
});
