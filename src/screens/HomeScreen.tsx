import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useCardStore } from '../store/useCardStore';
import { CATEGORIES } from '../data/categories';
import { searchMerchants } from '../data/merchants';
import { REWARDS_LAST_VERIFIED } from '../data/cards';
import { CategoryKey, CreditCard, MerchantEntry } from '../types';
import { CardVisual } from '../components/CardVisual';
import { SyncModal } from '../components/SyncModal';
import { PayModal } from '../components/PayModal';

// One tile per unique rotating merchant across all wallet cards
interface RotatingTile {
  merchant: string;
  rate: number;
  cards: CreditCard[];
  note: string; // e.g. "Q2 2026 (Apr–Jun)"
}

export function HomeScreen() {
  const { cards } = useCardStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedRotatingMerchant, setSelectedRotatingMerchant] = useState<string | null>(null);
  const [merchantQuery, setMerchantQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MerchantEntry[]>([]);
  const [resolvedMerchant, setResolvedMerchant] = useState<MerchantEntry | null>(null);
  const [mode, setMode] = useState<'category' | 'merchant'>('category');
  const [syncVisible, setSyncVisible] = useState(false);
  const [payCard, setPayCard] = useState<{ card: any; multiplier: number } | null>(null);

  // Derive rotating tiles from wallet cards
  const rotatingTiles = useMemo<RotatingTile[]>(() => {
    const map = new Map<string, RotatingTile>();
    for (const card of cards) {
      if (!card.rotatingMerchants?.length) continue;
      for (const merchant of card.rotatingMerchants) {
        const existing = map.get(merchant);
        if (existing) {
          existing.cards.push(card);
        } else {
          map.set(merchant, {
            merchant,
            rate: card.rewards.rotating ?? card.defaultReward,
            cards: [card],
            note: card.rotatingNote ?? '',
          });
        }
      }
    }
    return Array.from(map.values());
  }, [cards]);

  // Regular category results
  const activeCategory = mode === 'category' ? selectedCategory : resolvedMerchant?.category ?? null;
  const ranked = useMemo(() => {
    if (!activeCategory) return [];
    return cards
      .map((card) => ({ card, multiplier: card.rewards[activeCategory] ?? card.defaultReward }))
      .sort((a, b) => b.multiplier - a.multiplier);
  }, [activeCategory, cards]);

  // Rotating merchant results: only cards that include that merchant
  const rotatingRanked = useMemo(() => {
    if (!selectedRotatingMerchant) return [];
    return cards
      .filter((c) => c.rotatingMerchants?.includes(selectedRotatingMerchant))
      .map((card) => ({ card, multiplier: card.rewards.rotating ?? card.defaultReward }))
      .sort((a, b) => b.multiplier - a.multiplier);
  }, [selectedRotatingMerchant, cards]);

  const isRotatingMode = mode === 'category' && !!selectedRotatingMerchant;
  const displayRanked = isRotatingMode ? rotatingRanked : ranked;
  const best = displayRanked[0] ?? null;
  const others = displayRanked.slice(1);
  const activeCategoryObj = CATEGORIES.find((c) => c.key === activeCategory);
  const activeRotatingTile = rotatingTiles.find((t) => t.merchant === selectedRotatingMerchant);

  const handleCategorySelect = (key: CategoryKey) => {
    setSelectedCategory(key);
    setSelectedRotatingMerchant(null);
  };

  const handleRotatingSelect = (merchant: string) => {
    setSelectedRotatingMerchant(merchant);
    setSelectedCategory(null);
  };

  const handleMerchantChange = (text: string) => {
    setMerchantQuery(text);
    setResolvedMerchant(null);
    setSuggestions(searchMerchants(text));
  };

  const handleSelectMerchant = (merchant: MerchantEntry) => {
    setMerchantQuery(merchant.name);
    setResolvedMerchant(merchant);
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

      {/* Hero */}
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
          onPress={() => { setMode('category'); setResolvedMerchant(null); }}
        >
          <Text style={[styles.pillTabText, mode === 'category' && styles.pillTabTextActive]}>By Category</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pillTab, mode === 'merchant' && styles.pillTabActive]}
          onPress={() => { setMode('merchant'); setSelectedCategory(null); setSelectedRotatingMerchant(null); }}
        >
          <Text style={[styles.pillTabText, mode === 'merchant' && styles.pillTabTextActive]}>By Merchant</Text>
        </TouchableOpacity>
      </View>

      {/* Category grid */}
      {mode === 'category' && (
        <>
          {/* Standard categories */}
          <View style={styles.grid}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.catTile, active && styles.catTileActive]}
                  onPress={() => handleCategorySelect(cat.key)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                  <Text style={[styles.catName, active && styles.catNameActive]}>{cat.label}</Text>
                  {active && <View style={styles.catActiveDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Rotating merchant tiles — only shown when wallet has rotating cards */}
          {rotatingTiles.length > 0 && (
            <View style={styles.rotatingSection}>
              <View style={styles.rotatingSectionHeader}>
                <Text style={styles.rotatingSectionLabel}>⚡ ROTATING BONUS</Text>
                <Text style={styles.rotatingSectionPeriod}>{rotatingTiles[0]?.note.split(':')[0]}</Text>
              </View>
              <View style={styles.rotatingGrid}>
                {rotatingTiles.map((tile) => {
                  const active = selectedRotatingMerchant === tile.merchant;
                  return (
                    <TouchableOpacity
                      key={tile.merchant}
                      style={[styles.rotatingTile, active && styles.rotatingTileActive]}
                      onPress={() => handleRotatingSelect(tile.merchant)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.rotatingTileTop}>
                        <Text style={styles.rotatingTileMerchant}>{tile.merchant}</Text>
                        <View style={[styles.rotatingRateBadge, active && styles.rotatingRateBadgeActive]}>
                          <Text style={[styles.rotatingRate, active && styles.rotatingRateActive]}>
                            {tile.rate}x
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.rotatingTileCards} numberOfLines={1}>
                        {tile.cards.map((c) => c.name).join(', ')}
                      </Text>
                      {active && <View style={styles.rotatingActiveDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </>
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
              <TouchableOpacity onPress={() => { setMerchantQuery(''); setSuggestions([]); setResolvedMerchant(null); }}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {suggestions.length > 0 && (
            <View style={styles.dropdown}>
              {suggestions.map((s, i) => {
                const cat = CATEGORIES.find((c) => c.key === s.category);
                const isRotating = s.category === 'rotating';
                return (
                  <TouchableOpacity
                    key={s.name}
                    style={[styles.dropdownRow, i < suggestions.length - 1 && styles.dropdownDivider]}
                    onPress={() => handleSelectMerchant(s)}
                  >
                    <View style={[styles.dropdownIcon, isRotating && styles.dropdownIconRotating]}>
                      <Text style={{ fontSize: 16 }}>{isRotating ? '⚡' : cat?.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownName}>{s.name}</Text>
                      {s.rotatingNote
                        ? <Text style={styles.dropdownRotatingNote}>{s.rotatingNote}</Text>
                        : <Text style={styles.dropdownCat}>{cat?.label}</Text>
                      }
                    </View>
                    <Text style={styles.dropdownArrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {resolvedMerchant && (
            <View style={[styles.resolvedTag, resolvedMerchant.category === 'rotating' && styles.resolvedTagRotating]}>
              <Text style={[styles.resolvedTagText, resolvedMerchant.category === 'rotating' && styles.resolvedTagTextRotating]}>
                {resolvedMerchant.category === 'rotating'
                  ? resolvedMerchant.rotatingNote
                  : `${activeCategoryObj?.icon}  ${activeCategoryObj?.label}`}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* No cards */}
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
          {/* Rotating merchant context banner */}
          {isRotatingMode && activeRotatingTile && (
            <View style={styles.rotatingBanner}>
              <Text style={styles.rotatingBannerIcon}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rotatingBannerTitle}>{activeRotatingTile.merchant} — Rotating Bonus</Text>
                <Text style={styles.rotatingBannerNote}>{activeRotatingTile.note}</Text>
              </View>
              <Text style={styles.rotatingBannerRate}>{activeRotatingTile.rate}x</Text>
            </View>
          )}

          <View style={styles.resultsLabel}>
            <View style={styles.resultsLabelLine} />
            <Text style={styles.resultsLabelText}>BEST PICK</Text>
            <View style={styles.resultsLabelLine} />
          </View>

          <CardVisual card={best.card} multiplier={best.multiplier} rank={0} />

          <TouchableOpacity style={styles.payBtn} onPress={() => setPayCard(best)} activeOpacity={0.85}>
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

      {(activeCategory || isRotatingMode) && displayRanked.length === 0 && cards.length > 0 && (
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#000000', borderRadius: 14, paddingVertical: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A', gap: 6,
  },
  payBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  payBtnArrow: { color: '#6B7A99', fontSize: 20, lineHeight: 22 },

  // Hero
  hero: { backgroundColor: '#0D1117', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 },
  heroEyebrow: { fontSize: 11, fontWeight: '700', color: '#4361EE', letterSpacing: 2.5, marginBottom: 8 },
  heroTitle: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', lineHeight: 40, letterSpacing: -0.5, marginBottom: 14 },
  heroBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1A2335',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#2A3F5F',
  },
  verifiedDot: { fontSize: 8, color: '#4CAF50' },
  verifiedText: { fontSize: 11, color: '#8892A4', fontWeight: '500' },
  syncBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1A2240',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#2E3F6E',
  },
  syncIcon: { fontSize: 15, color: '#7B93FF', fontWeight: '600' },
  syncText: { fontSize: 12, color: '#7B93FF', fontWeight: '700' },

  // Mode pill
  pill: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: '#161B24',
    borderRadius: 14, padding: 4, borderWidth: 1, borderColor: '#232B3A',
  },
  pillTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  pillTabActive: { backgroundColor: '#4361EE' },
  pillTabText: { fontSize: 14, color: '#6B7A99', fontWeight: '600' },
  pillTabTextActive: { color: '#FFFFFF' },

  // Standard category grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  catTile: {
    width: '22%', aspectRatio: 0.9, backgroundColor: '#161B24', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#232B3A',
    position: 'relative', gap: 2,
  },
  catTileActive: { borderColor: '#4361EE', backgroundColor: '#1A2240' },
  catEmoji: { fontSize: 24 },
  catName: { fontSize: 9, color: '#6B7A99', textAlign: 'center', fontWeight: '500' },
  catNameActive: { color: '#7B93FF', fontWeight: '700' },
  catActiveDot: { position: 'absolute', bottom: 7, width: 4, height: 4, borderRadius: 2, backgroundColor: '#4361EE' },

  // Rotating section
  rotatingSection: { paddingHorizontal: 16, marginBottom: 8 },
  rotatingSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  rotatingSectionLabel: { fontSize: 11, fontWeight: '800', color: '#F59E0B', letterSpacing: 1.5 },
  rotatingSectionPeriod: {
    fontSize: 10, color: '#78490A', fontWeight: '700',
    backgroundColor: '#2A1800', paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1, borderColor: '#5C3A00',
  },
  rotatingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rotatingTile: {
    flex: 1, minWidth: '45%', backgroundColor: '#1A1200', borderRadius: 14,
    padding: 14, borderWidth: 1.5, borderColor: '#5C3A00', position: 'relative', gap: 6,
  },
  rotatingTileActive: { borderColor: '#F59E0B', backgroundColor: '#241900' },
  rotatingTileTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rotatingTileMerchant: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  rotatingRateBadge: {
    backgroundColor: '#2A1800', borderRadius: 8, paddingHorizontal: 8,
    paddingVertical: 3, borderWidth: 1, borderColor: '#5C3A00',
  },
  rotatingRateBadgeActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  rotatingRate: { fontSize: 13, fontWeight: '800', color: '#F59E0B' },
  rotatingRateActive: { color: '#000000' },
  rotatingTileCards: { fontSize: 11, color: '#78490A' },
  rotatingActiveDot: { position: 'absolute', bottom: 8, right: 10, width: 5, height: 5, borderRadius: 3, backgroundColor: '#F59E0B' },

  // Merchant search
  searchSection: { paddingHorizontal: 20, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B24',
    borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: '#232B3A', gap: 10,
  },
  searchEmoji: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#FFFFFF' },
  clearBtn: { fontSize: 14, color: '#6B7A99', paddingLeft: 6 },
  dropdown: {
    backgroundColor: '#161B24', borderRadius: 14, marginTop: 6,
    borderWidth: 1, borderColor: '#232B3A', overflow: 'hidden',
  },
  dropdownRow: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 10 },
  dropdownDivider: { borderBottomWidth: 1, borderBottomColor: '#232B3A' },
  dropdownIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1E2738', alignItems: 'center', justifyContent: 'center' },
  dropdownIconRotating: { backgroundColor: '#2A1800' },
  dropdownName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  dropdownCat: { fontSize: 12, color: '#6B7A99', marginTop: 1 },
  dropdownRotatingNote: { fontSize: 12, color: '#F59E0B', marginTop: 1, fontWeight: '600' },
  dropdownArrow: { fontSize: 22, color: '#3A4A66' },
  resolvedTag: {
    marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#1A2240',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: '#2E3F6E',
  },
  resolvedTagRotating: { backgroundColor: '#2A1800', borderColor: '#F59E0B' },
  resolvedTagText: { color: '#7B93FF', fontWeight: '700', fontSize: 13 },
  resolvedTagTextRotating: { color: '#F59E0B' },

  // Rotating result banner
  rotatingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1A1200', borderRadius: 14, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#5C3A00',
  },
  rotatingBannerIcon: { fontSize: 22 },
  rotatingBannerTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  rotatingBannerNote: { fontSize: 12, color: '#78490A', marginTop: 2 },
  rotatingBannerRate: { fontSize: 24, fontWeight: '900', color: '#F59E0B' },

  // Results
  results: { paddingHorizontal: 20, marginTop: 16 },
  resultsLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  resultsLabelLine: { flex: 1, height: 1, backgroundColor: '#232B3A' },
  resultsLabelText: { fontSize: 11, color: '#4361EE', fontWeight: '700', letterSpacing: 2 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 52, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#6B7A99', textAlign: 'center', lineHeight: 21 },
});
