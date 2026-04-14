import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCardStore } from '../store/useCardStore';
import { encodeWallet, decodeWallet, walletSummary } from '../lib/token';

const BENEFIT_CHECKS_KEY = 'benefit_checks';

export function SettingsScreen() {
  const { getWalletSnapshot, loadFromProfile, cards } = useCardStore();

  const [token, setToken] = useState('');
  const [importInput, setImportInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  // Rebuild token whenever wallet changes (includes benefit checks from storage)
  const refreshToken = useCallback(async () => {
    const snap = getWalletSnapshot();
    const raw = await AsyncStorage.getItem(BENEFIT_CHECKS_KEY);
    const benefitChecks: Record<string, string> = raw ? JSON.parse(raw) : {};
    setToken(encodeWallet({ ...snap, benefitChecks }));
  }, [cards]);

  useEffect(() => { refreshToken(); }, [refreshToken]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview decode on input change so user sees what they're about to import
  const handleInputChange = (text: string) => {
    setImportInput(text);
    setImportError('');
    setImportSuccess('');
    setPreview(null);
    if (text.trim().length > 10) {
      const result = decodeWallet(text.trim());
      if (result.ok) {
        setPreview(walletSummary(result.data));
      } else {
        setPreview(null);
      }
    }
  };

  const handleImport = async () => {
    if (!importInput.trim()) return;
    setImportError('');
    setImportSuccess('');
    setImporting(true);

    const result = decodeWallet(importInput.trim());
    if (!result.ok) {
      setImportError(result.error);
      setImporting(false);
      return;
    }

    const { selectedIds, customCards, preferences, benefitChecks } = result.data;
    await loadFromProfile(selectedIds, customCards, preferences);
    // Restore benefit checks — auto-reset logic in BenefitsScreen discards stale ones
    if (Object.keys(benefitChecks).length > 0) {
      await AsyncStorage.setItem(BENEFIT_CHECKS_KEY, JSON.stringify(benefitChecks));
    }
    await refreshToken();

    setImportInput('');
    setPreview(null);
    setImporting(false);
    setImportSuccess(`Restored: ${walletSummary(result.data)}`);
    setTimeout(() => setImportSuccess(''), 4000);
  };

  const cardCount = cards.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SMART WALLET</Text>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Export token */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📤</Text>
          <Text style={styles.cardTitle}>Export Wallet</Text>
        </View>
        <Text style={styles.cardDesc}>
          This token encodes your entire wallet — {cardCount} card{cardCount !== 1 ? 's' : ''}, custom rules, and category choices. Copy and paste it on another device to restore.
        </Text>

        <View style={styles.tokenBox}>
          <Text style={styles.tokenText} selectable numberOfLines={3}>
            {token}
          </Text>
        </View>

        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.75}>
          <Text style={styles.copyBtnText}>{copied ? '✓  Copied to clipboard' : '⎘  Copy Token'}</Text>
        </TouchableOpacity>

        <Text style={styles.tokenMeta}>Token updates automatically as your wallet changes.</Text>
      </View>

      {/* Import token */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📥</Text>
          <Text style={styles.cardTitle}>Import Wallet</Text>
        </View>
        <Text style={styles.cardDesc}>
          Paste a token exported from another device. Your current wallet will be replaced.
        </Text>

        <TextInput
          style={[styles.input, importError ? styles.inputError : null]}
          placeholder="Paste token here…"
          placeholderTextColor="#3A4A66"
          value={importInput}
          onChangeText={handleInputChange}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          numberOfLines={3}
        />

        {/* Live preview of what will be imported */}
        {preview && !importError && (
          <View style={styles.previewRow}>
            <Text style={styles.previewIcon}>👀</Text>
            <Text style={styles.previewText}>Will restore: {preview}</Text>
          </View>
        )}

        {importError ? <Text style={styles.errorText}>⚠  {importError}</Text> : null}
        {importSuccess ? <Text style={styles.successText}>✓  {importSuccess}</Text> : null}

        <TouchableOpacity
          style={[styles.importBtn, (!importInput.trim() || importing) && styles.importBtnDisabled]}
          onPress={handleImport}
          disabled={!importInput.trim() || importing}
          activeOpacity={0.8}
        >
          {importing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.importBtnText}>Restore Wallet</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* How it works */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>ℹ️</Text>
          <Text style={styles.cardTitle}>How It Works</Text>
        </View>
        <View style={styles.steps}>
          {[
            ['📤', 'Copy your token on this device'],
            ['💬', 'Send it to yourself (Notes, email, message)'],
            ['📱', 'Open the app on another device → Settings'],
            ['📥', 'Paste and tap Restore Wallet'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.step}>
              <Text style={styles.stepIcon}>{icon}</Text>
              <Text style={styles.stepText}>{text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.noteBanner}>
          <Text style={styles.noteText}>
            The token is self-contained — no account or internet needed. It encodes preloaded card selections, your BofA category choice, and any custom cards with their full reward rules.
          </Text>
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

  card: {
    backgroundColor: '#161B24', borderRadius: 16, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: '#232B3A',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardIcon: { fontSize: 18 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  cardDesc: { fontSize: 13, color: '#6B7A99', lineHeight: 18, marginBottom: 14 },

  tokenBox: {
    backgroundColor: '#0D1117', borderRadius: 10, borderWidth: 1, borderColor: '#2E3F6E',
    padding: 14, marginBottom: 12,
  },
  tokenText: {
    fontSize: 11, color: '#7B93FF', lineHeight: 17,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.3,
  },
  copyBtn: {
    backgroundColor: '#4361EE', borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  copyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  tokenMeta: { fontSize: 11, color: '#3A4A66', marginTop: 10, textAlign: 'center' },

  input: {
    backgroundColor: '#0D1117', borderRadius: 10, borderWidth: 1, borderColor: '#2E3F6E',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 12, color: '#FFFFFF',
    marginBottom: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    minHeight: 80, textAlignVertical: 'top',
  },
  inputError: { borderColor: '#EE4361' },

  previewRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0F1A0F', borderRadius: 10, padding: 10, marginBottom: 10,
    borderWidth: 1, borderColor: '#1E3A1E',
  },
  previewIcon: { fontSize: 14 },
  previewText: { fontSize: 12, color: '#4CAF50', flex: 1, fontWeight: '600' },

  errorText: { fontSize: 13, color: '#EE4361', marginBottom: 10 },
  successText: { fontSize: 13, color: '#22C55E', marginBottom: 10, fontWeight: '600' },

  importBtn: {
    backgroundColor: '#4361EE', borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  importBtnDisabled: { backgroundColor: '#1A2240', opacity: 0.6 },
  importBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  steps: { gap: 12, marginBottom: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  stepText: { fontSize: 13, color: '#8892A4', flex: 1, lineHeight: 19 },

  noteBanner: {
    backgroundColor: '#1A2240', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#2E3F6E',
  },
  noteText: { fontSize: 12, color: '#6B7A99', lineHeight: 18 },
});
