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

interface RotatingTile {
  merchant: string;
  rate: number;
  cards: CreditCard[];
  note: string;
}

// Unified tile for both standard categories and rotating merchants
type UnifiedTile =
  | { kind: 'category'; key: CategoryKey; label: string; icon: string; bestRate: number; isRotatingBonus: boolean }
  | { kind: 'rotating'; merchant: string; rate: number; cards: CreditCard[]; note: string };

export function HomeScreen() {
  const { cards, getRankedCards } = useCardStore();
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
          if ((card.rewards.rotating ?? card.defaultReward) > existing.rate) {
            existing.rate = card.rewards.rotating ?? card.defaultReward;
          }
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

  // Merchant emoji map for rotating merchant tiles
  const MERCHANT_ICON: Record<string, string> = {
    'Amazon': '📦',
    'Whole Foods': '🥦',
    'Target': '🎯',
    'Walmart': '🛒',
    'Gas Stations': '⛽',
    'Grocery Stores': '🛒',
    'Restaurants': '🍽️',
  };

  // Unified sorted tile list: all categories + rotating, sorted by best rate
  const sortedTiles = useMemo<UnifiedTile[]>(() => {
    if (cards.length === 0) {
      return CATEGORIES.map((cat) => ({
        kind: 'category' as const,
        key: cat.key,
        label: cat.label,
        icon: cat.icon,
        bestRate: 0,
        isRotatingBonus: false,
      }));
    }

    // For each category, compute best rate across all cards
    // — includes rotatingCategories cards and choiceCategory cards
    const categoryTiles: UnifiedTile[] = CATEGORIES.map((cat) => {
      let bestRate = 0;
      let isRotatingBonus = false;
      for (const card of cards) {
        let rate = card.rewards[cat.key] ?? card.defaultReward;
        if (card.rotatingCategories?.includes(cat.key)) {
          rate = card.rewards.rotating ?? card.defaultReward;
          if (rate > bestRate) isRotatingBonus = true;
        }
        if (card.choiceCategory === cat.key && card.choiceRate !== undefined) {
          rate = Math.max(rate, card.choiceRate);
        }
        if (rate > bestRate) bestRate = rate;
      }
      return { kind: 'category', key: cat.key, label: cat.label, icon: cat.icon, bestRate, isRotatingBonus };
    });

    const rotatingUnified: UnifiedTile[] = rotatingTiles.map((t) => ({
      kind: 'rotating',
      merchant: t.merchant,
      rate: t.rate,
      cards: t.cards,
      note: t.note,
    }));

    return [...categoryTiles, ...rotatingUnified].sort((a, b) => {
      const rateA = a.kind === 'category' ? a.bestRate : a.rate;
      const rateB = b.kind === 'category' ? b.bestRate : b.rate;
      return rateB - rateA;
    });
  }, [cards, rotatingTiles]);

  // Regular category results — use store's effectiveRate so rotating/choice categories rank correctly
  const activeCategory = mode === 'category' ? selectedCategory : resolvedMerchant?.category ?? null;
  const ranked = useMemo(() => {
    if (!activeCategory) return [];
    return getRankedCards(activeCategory);
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

      {/* Unified sorted category + rotating grid */}
      {mode === 'category' && (
        <View style={styles.grid}>
          {sortedTiles.map((tile) => {
            if (tile.kind === 'category') {
              const active = selectedCategory === tile.key;
              return (
                <TouchableOpacity
                  key={tile.key}
                  style={[styles.catTile, active && styles.catTileActive, tile.isRotatingBonus && styles.catTileRotatingBonus, active && tile.isRotatingBonus && styles.catTileRotatingBonusActive]}
                  onPress={() => handleCategorySelect(tile.key)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.catEmoji}>{tile.icon}</Text>
                  <Text style={[styles.catName, active && styles.catNameActive]}>{tile.label}</Text>
                  {cards.length > 0 && (
                    <Text style={[styles.catRate, active && styles.catRateActive, tile.isRotatingBonus && styles.catRateRotating]}>
                      {tile.bestRate}x
                    </Text>
                  )}
                  {tile.isRotatingBonus && (
                    <View style={styles.rotatingBadge}>
                      <Text style={styles.rotatingBadgeText}>⚡</Text>
                    </View>
                  )}
                  {active && <View style={[styles.catActiveDot, tile.isRotatingBonus && { backgroundColor: '#F59E0B' }]} />}
                </TouchableOpacity>
              );
            } else {
              const active = selectedRotatingMerchant === tile.merchant;
              const icon = MERCHANT_ICON[tile.merchant] ?? '🏪';
              return (
                <TouchableOpacity
                  key={`rotating-${tile.merchant}`}
                  style={[styles.catTile, styles.catTileRotating, active && styles.catTileRotatingActive]}
                  onPress={() => handleRotatingSelect(tile.merchant)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.catEmoji}>{icon}</Text>
                  <Text style={[styles.catName, styles.catNameRotating, active && styles.catNameRotatingActive]} numberOfLines={1}>
                    {tile.merchant}
                  </Text>
                  <Text style={[styles.catRate, styles.catRateRotating, active && styles.catRateRotatingActive]}>
                    {tile.rate}x
                  </Text>
                  <View style={styles.rotatingBadge}>
                    <Text style={styles.rotatingBadgeText}>⚡</Text>
                  </View>
                  {active && <View style={[styles.catActiveDot, { backgroundColor: '#F59E0B' }]} />}
                </TouchableOpacity>
              );
            }
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

  // Unified category + rotating grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  catTile: {
    width: '22%', aspectRatio: 0.9, backgroundColor: '#161B24', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#232B3A',
    position: 'relative', gap: 1, paddingHorizontal: 4,
  },
  catTileActive: { borderColor: '#4361EE', backgroundColor: '#1A2240' },
  catTileRotatingBonus: { borderColor: '#5C3A00' },
  catTileRotatingBonusActive: { borderColor: '#F59E0B', backgroundColor: '#1A1200' },
  catTileRotating: { backgroundColor: '#1A1200', borderColor: '#5C3A00' },
  catTileRotatingActive: { borderColor: '#F59E0B', backgroundColor: '#241900' },
  catEmoji: { fontSize: 22 },
  catName: { fontSize: 9, color: '#6B7A99', textAlign: 'center', fontWeight: '500' },
  catNameActive: { color: '#7B93FF', fontWeight: '700' },
  catNameRotating: { color: '#C08020' },
  catNameRotatingActive: { color: '#F59E0B', fontWeight: '700' },
  catRate: { fontSize: 11, fontWeight: '800', color: '#4361EE' },
  catRateActive: { color: '#7B93FF' },
  catRateRotating: { color: '#F59E0B' },
  catRateRotatingActive: { color: '#FCD34D' },
  catActiveDot: { position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#4361EE' },
  rotatingBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#2A1800', borderRadius: 5, paddingHorizontal: 3, paddingVertical: 1 },
  rotatingBadgeText: { fontSize: 8, lineHeight: 10 },

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
