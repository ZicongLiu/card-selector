import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCardStore } from '../store/useCardStore';
import { CATEGORIES } from '../data/categories';
import { CategoryKey, CreditCard } from '../types';

const COLORS = [
  { bg: '#1A1A2E', text: '#FFFFFF' },
  { bg: '#4361EE', text: '#FFFFFF' },
  { bg: '#3A0CA3', text: '#FFFFFF' },
  { bg: '#7209B7', text: '#FFFFFF' },
  { bg: '#B8962E', text: '#FFFFFF' },
  { bg: '#CC0000', text: '#FFFFFF' },
  { bg: '#006400', text: '#FFFFFF' },
  { bg: '#0070CC', text: '#FFFFFF' },
  { bg: '#2D2D2D', text: '#FFFFFF' },
  { bg: '#1B4332', text: '#FFFFFF' },
];

export function AddCardScreen() {
  const navigation = useNavigation<any>();
  const { addCard } = useCardStore();
  const [showTips, setShowTips] = useState(false);
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[1]);
  const [rewards, setRewards] = useState<Partial<Record<CategoryKey, string>>>({});
  const [defaultReward, setDefaultReward] = useState('1');

  const handleSave = () => {
    if (!name.trim() || !issuer.trim()) {
      Alert.alert('Missing Info', 'Please enter a card name and issuer.');
      return;
    }
    const parsedRewards: Partial<Record<CategoryKey, number>> = {};
    for (const [key, val] of Object.entries(rewards)) {
      const num = parseFloat(val as string);
      if (!isNaN(num) && num > 0) parsedRewards[key as CategoryKey] = num;
    }
    addCard({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      issuer: issuer.trim(),
      color: selectedColor.bg,
      textColor: selectedColor.text,
      rewards: parsedRewards,
      defaultReward: parseFloat(defaultReward) || 1,
    });
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* How to find tip */}
      <TouchableOpacity
        style={styles.tipToggle}
        onPress={() => setShowTips(!showTips)}
        activeOpacity={0.7}
      >
        <View style={styles.tipToggleLeft}>
          <Text style={styles.tipToggleIcon}>💡</Text>
          <Text style={styles.tipToggleText}>How to find your card's reward rates</Text>
        </View>
        <Text style={styles.tipChevron}>{showTips ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showTips && (
        <View style={styles.tipBox}>
          {[
            { n: '1', t: 'Search "[Card Name] rewards" on Google' },
            { n: '2', t: "Visit your bank's website → Benefits or Earn Rewards section" },
            { n: '3', t: 'Check NerdWallet, The Points Guy, or Doctor of Credit' },
            { n: '4', t: 'Look at your card statement — earn rates are usually listed there' },
          ].map((tip) => (
            <View key={tip.n} style={styles.tipRow}>
              <View style={styles.tipNum}><Text style={styles.tipNumText}>{tip.n}</Text></View>
              <Text style={styles.tipText}>{tip.t}</Text>
            </View>
          ))}
          <View style={styles.tipDivider} />
          <Text style={styles.tipNote}>Enter just the number (e.g. for "3x on dining" → type 3). Leave blank to use the base rate.</Text>
        </View>
      )}

      {/* Card preview */}
      <View style={[styles.cardPreview, { backgroundColor: selectedColor.bg }]}>
        <View style={styles.previewShine} />
        <View style={styles.previewTop}>
          <View style={styles.previewChip}><View style={styles.previewChipLine} /></View>
          <Text style={[styles.previewIssuer, { color: selectedColor.text }]}>{issuer || 'Bank Name'}</Text>
        </View>
        <Text style={[styles.previewName, { color: selectedColor.text }]}>{name || 'Card Name'}</Text>
        <View style={styles.previewBottom}>
          <View style={styles.previewDots}>
            {[0,1,2,3].map(g=>(
              <View key={g} style={styles.dotGroup}>
                {[0,1,2,3].map(d=>(
                  <View key={d} style={[styles.dot, { backgroundColor: selectedColor.text + '50' }]} />
                ))}
              </View>
            ))}
          </View>
          <View style={[styles.previewNfc, { borderColor: selectedColor.text + '55' }]}>
            <View style={[styles.previewNfcInner, { borderColor: selectedColor.text + '40' }]} />
          </View>
        </View>
      </View>

      {/* Card info */}
      <Text style={styles.sectionLabel}>Card Info</Text>
      <TextInput style={styles.input} placeholder="Bank / Issuer (e.g. Chase, HSBC)" placeholderTextColor="#3A4A66" value={issuer} onChangeText={setIssuer} />
      <TextInput style={styles.input} placeholder="Card name (e.g. Sapphire Preferred)" placeholderTextColor="#3A4A66" value={name} onChangeText={setName} />

      {/* Color */}
      <Text style={styles.sectionLabel}>Card Color</Text>
      <View style={styles.colorRow}>
        {COLORS.map((c, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.swatch, { backgroundColor: c.bg }, selectedColor.bg === c.bg && styles.swatchActive]}
            onPress={() => setSelectedColor(c)}
          />
        ))}
      </View>

      {/* Reward multipliers */}
      <Text style={styles.sectionLabel}>Reward Multipliers</Text>

      {CATEGORIES.filter((c) => c.key !== 'other').map((cat) => (
        <View key={cat.key} style={styles.rewardRow}>
          <View style={styles.rewardIconBox}><Text style={{ fontSize: 16 }}>{cat.icon}</Text></View>
          <Text style={styles.rewardLabel}>{cat.label}</Text>
          <TextInput
            style={styles.rewardInput}
            placeholder="–"
            placeholderTextColor="#3A4A66"
            keyboardType="decimal-pad"
            value={rewards[cat.key] ?? ''}
            onChangeText={(v) => setRewards((r) => ({ ...r, [cat.key]: v }))}
          />
          <Text style={styles.rewardX}>x</Text>
        </View>
      ))}

      <View style={styles.rewardRow}>
        <View style={styles.rewardIconBox}><Text style={{ fontSize: 16 }}>🏷️</Text></View>
        <Text style={[styles.rewardLabel, { color: '#FFFFFF', fontWeight: '600' }]}>Base rate (everything else)</Text>
        <TextInput
          style={styles.rewardInput}
          placeholder="1"
          placeholderTextColor="#3A4A66"
          keyboardType="decimal-pad"
          value={defaultReward}
          onChangeText={setDefaultReward}
        />
        <Text style={styles.rewardX}>x</Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>Save Card</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  content: { padding: 16 },

  tipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161B24',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#2A3345',
  },
  tipToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  tipToggleIcon: { fontSize: 18 },
  tipToggleText: { fontSize: 14, fontWeight: '600', color: '#C8A94A', flex: 1 },
  tipChevron: { fontSize: 11, color: '#6B7A99' },

  tipBox: {
    backgroundColor: '#131A10',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A3820',
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tipNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#2A4020', alignItems: 'center', justifyContent: 'center' },
  tipNumText: { fontSize: 11, fontWeight: '700', color: '#7CBF5A' },
  tipText: { flex: 1, fontSize: 13, color: '#8BA87A', lineHeight: 18 },
  tipDivider: { height: 1, backgroundColor: '#2A3820', marginVertical: 10 },
  tipNote: { fontSize: 12, color: '#6B8A58', lineHeight: 18 },

  cardPreview: {
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  previewShine: {
    position: 'absolute', top: -50, right: -30,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewChip: {
    width: 34, height: 26, borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center', paddingHorizontal: 4,
  },
  previewChipLine: { height: 1.5, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 },
  previewIssuer: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700', opacity: 0.8 },
  previewName: { fontSize: 19, fontWeight: '700', marginTop: 10 },
  previewBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  previewDots: { flexDirection: 'row', gap: 6 },
  dotGroup: { flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  previewNfc: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  previewNfcInner: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#4361EE',
    textTransform: 'uppercase', letterSpacing: 2,
    marginTop: 20, marginBottom: 10,
  },
  input: {
    backgroundColor: '#161B24',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#232B3A',
  },

  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  swatchActive: { borderWidth: 3, borderColor: '#4361EE' },

  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: '#232B3A',
  },
  rewardIconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#1E2738', alignItems: 'center', justifyContent: 'center',
  },
  rewardLabel: { flex: 1, fontSize: 14, color: '#8892A4' },
  rewardInput: {
    width: 56, backgroundColor: '#0D1117', borderRadius: 8,
    padding: 8, textAlign: 'center', fontSize: 14,
    color: '#FFFFFF', fontWeight: '600',
    borderWidth: 1, borderColor: '#232B3A',
  },
  rewardX: { fontSize: 14, color: '#3A4A66', fontWeight: '700', width: 14 },

  saveBtn: {
    backgroundColor: '#4361EE',
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4361EE',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
