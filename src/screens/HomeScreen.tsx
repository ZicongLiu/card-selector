import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useCardStore } from '../store/useCardStore';
import { CATEGORIES } from '../data/categories';
import { searchMerchants } from '../data/merchants';
import { REWARDS_LAST_VERIFIED } from '../data/cards';
import { CategoryKey, MerchantEntry } from '../types';
import { CardVisual } from '../components/CardVisual';
import { SyncModal } from '../components/SyncModal';
import { PayModal } from '../components/PayModal';

export function HomeScreen() {
  const { getRankedCards, cards } = useCardStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [merchantQuery, setMerchantQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MerchantEntry[]>([]);
  const [resolvedCategory, setResolvedCategory] = useState<CategoryKey | null>(null);
  const [mode, setMode] = useState<'category' | 'merchant'>('category');
  const [syncVisible, setSyncVisible] = useState(false);
  const [payCard, setPayCard] = useState<{ card: any; multiplier: number } | null>(null);

  const activeCategory = mode === 'category' ? selectedCategory : resolvedCategory;
  const ranked = activeCategory ? getRankedCards(activeCategory) : [];
  const best = ranked[0] ?? null;
  const others = ranked.slice(1);
  const activeCategoryObj = CATEGORIES.find((c) => c.key === activeCategory);

  const handleMerchantChange = (text: string) => {
    setMerchantQuery(text);
    setResolvedCategory(null);
    setSuggestions(searchMerchants(text));
  };

  const handleSelectMerchant = (merchant: MerchantEntry) => {
    setMerchantQuery(merchant.name);
    setResolvedCategory(merchant.category);
    setSuggestions([]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <SyncModal visible={syncVisible} onClose={() => setSyncVisible(false)} />
      <PayModal
        visible={!!payCard}
        card={payCard?.card ?? null}
        multiplier={payCard?.multiplier}
        onClose={() => setPayCard(null)}
      />

      {/* Hero header */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>SMART WALLET</Text>
        <Text style={styles.heroTitle}>Which card{'\n'}should I use?</Text>
        <View style={styles.heroBottom}>
          <TouchableOpacity style={styles.verifiedBadge} onPress={() => setSyncVisible(true)} activeOpacity={0.75}>
            <Text style={styles.verifiedDot}>●</Text>
            <Text style={styles.verifiedText}>Rates verified {REWARDS_LAST_VERIFIED}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.syncBtn} onPress={() => setSyncVisible(true)} activeOpacity={0.8}>
            <Text style={styles.syncIcon}>↻</Text>
            <Text style={styles.syncText}>Sync</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode toggle */}
      <View style={styles.pill}>
        <TouchableOpacity
          style={[styles.pillTab, mode === 'category' && styles.pillTabActive]}
          onPress={() => { setMode('category'); setResolvedCategory(null); }}
        >
          <Text style={[styles.pillTabText, mode === 'category' && styles.pillTabTextActive]}>
            By Category
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pillTab, mode === 'merchant' && styles.pillTabActive]}
          onPress={() => { setMode('merchant'); setSelectedCategory(null); }}
        >
          <Text style={[styles.pillTabText, mode === 'merchant' && styles.pillTabTextActive]}>
            By Merchant
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category grid */}
      {mode === 'category' && (
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.catTile, active && styles.catTileActive]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.catEmoji}>{cat.icon}</Text>
                <Text style={[styles.catName, active && styles.catNameActive]}>{cat.label}</Text>
                {active && <View style={styles.catActiveDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Merchant search */}
      {mode === 'merchant' && (
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Text style={styles.searchEmoji}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. Starbucks, Amazon, Shell…"
              placeholderTextColor="#8892A4"
              value={merchantQuery}
              onChangeText={handleMerchantChange}
              autoCorrect={false}
            />
            {merchantQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setMerchantQuery(''); setSuggestions([]); setResolvedCategory(null); }}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {suggestions.length > 0 && (
            <View style={styles.dropdown}>
              {suggestions.map((s, i) => {
                const cat = CATEGORIES.find((c) => c.key === s.category);
                return (
                  <TouchableOpacity
                    key={s.name}
                    style={[styles.dropdownRow, i < suggestions.length - 1 && styles.dropdownDivider]}
                    onPress={() => handleSelectMerchant(s)}
                  >
                    <View style={styles.dropdownIcon}>
                      <Text style={{ fontSize: 16 }}>{cat?.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownName}>{s.name}</Text>
                      <Text style={styles.dropdownCat}>{cat?.label}</Text>
                    </View>
                    <Text style={styles.dropdownArrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {resolvedCategory && (
            <View style={styles.resolvedTag}>
              <Text style={styles.resolvedTagText}>
                {activeCategoryObj?.icon}  {activeCategoryObj?.label}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* No cards state */}
      {cards.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💳</Text>
          <Text style={styles.emptyTitle}>No cards added yet</Text>
          <Text style={styles.emptyBody}>Head to the My Cards tab to add your credit cards and start comparing.</Text>
        </View>
      )}

      {/* Results */}
      {best && (
        <View style={styles.results}>
          <View style={styles.resultsLabel}>
            <View style={styles.resultsLabelLine} />
            <Text style={styles.resultsLabelText}>BEST PICK</Text>
            <View style={styles.resultsLabelLine} />
          </View>
          <CardVisual card={best.card} multiplier={best.multiplier} rank={0} />
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => setPayCard(best)}
            activeOpacity={0.85}
          >
            <Text style={styles.payBtnText}>Pay with this card</Text>
            <Text style={styles.payBtnArrow}>›</Text>
          </TouchableOpacity>

          {others.length > 0 && (
            <>
              <View style={[styles.resultsLabel, { marginTop: 24 }]}>
                <View style={styles.resultsLabelLine} />
                <Text style={styles.resultsLabelText}>ALSO GOOD</Text>
                <View style={styles.resultsLabelLine} />
              </View>
              {others.map(({ card, multiplier }, i) => (
                <CardVisual key={card.id} card={card} multiplier={multiplier} rank={i + 1} compact />
              ))}
            </>
          )}
        </View>
      )}

      {activeCategory && ranked.length === 0 && cards.length > 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🤷</Text>
          <Text style={styles.emptyTitle}>No rewards found</Text>
          <Text style={styles.emptyBody}>None of your cards have a specific rate for this category.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  content: { paddingBottom: 40 },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 6,
  },
  payBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  payBtnArrow: { color: '#6B7A99', fontSize: 20, lineHeight: 22 },

  // Hero
  hero: {
    backgroundColor: '#0D1117',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4361EE',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  heroBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A2335',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2A3F5F',
  },
  verifiedDot: { fontSize: 8, color: '#4CAF50' },
  verifiedText: { fontSize: 11, color: '#8892A4', fontWeight: '500' },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1A2240',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#2E3F6E',
  },
  syncIcon: { fontSize: 15, color: '#7B93FF', fontWeight: '600' },
  syncText: { fontSize: 12, color: '#7B93FF', fontWeight: '700' },

  // Mode pill
  pill: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#161B24',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#232B3A',
  },
  pillTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  pillTabActive: { backgroundColor: '#4361EE' },
  pillTabText: { fontSize: 14, color: '#6B7A99', fontWeight: '600' },
  pillTabTextActive: { color: '#FFFFFF' },

  // Category grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  catTile: {
    width: '22%',
    aspectRatio: 0.9,
    backgroundColor: '#161B24',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#232B3A',
    position: 'relative',
  },
  catTileActive: {
    borderColor: '#4361EE',
    backgroundColor: '#1A2240',
  },
  catEmoji: { fontSize: 24, marginBottom: 6 },
  catName: { fontSize: 10, color: '#6B7A99', textAlign: 'center', fontWeight: '500' },
  catNameActive: { color: '#7B93FF', fontWeight: '700' },
  catActiveDot: {
    position: 'absolute',
    bottom: 7,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4361EE',
  },

  // Merchant search
  searchSection: { paddingHorizontal: 20, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#232B3A',
    gap: 10,
  },
  searchEmoji: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#FFFFFF' },
  clearBtn: { fontSize: 14, color: '#6B7A99', paddingLeft: 6 },
  dropdown: {
    backgroundColor: '#161B24',
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#232B3A',
    overflow: 'hidden',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    gap: 10,
  },
  dropdownDivider: { borderBottomWidth: 1, borderBottomColor: '#232B3A' },
  dropdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E2738',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  dropdownCat: { fontSize: 12, color: '#6B7A99', marginTop: 1 },
  dropdownArrow: { fontSize: 22, color: '#3A4A66' },
  resolvedTag: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#1A2240',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2E3F6E',
  },
  resolvedTagText: { color: '#7B93FF', fontWeight: '700', fontSize: 13 },

  // Results
  results: { paddingHorizontal: 20, marginTop: 16 },
  resultsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  resultsLabelLine: { flex: 1, height: 1, backgroundColor: '#232B3A' },
  resultsLabelText: { fontSize: 11, color: '#4361EE', fontWeight: '700', letterSpacing: 2 },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 52,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#6B7A99', textAlign: 'center', lineHeight: 21 },
});
