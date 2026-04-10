import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PRELOADED_CARDS } from '../data/cards';
import { CATEGORIES } from '../data/categories';
import { useCardStore } from '../store/useCardStore';
import { CreditCard, CategoryKey } from '../types';

const ISSUERS = ['All', ...Array.from(new Set(PRELOADED_CARDS.map((c) => c.issuer))).sort()];

// Simulated web-lookup: maps common card queries to structured data.
// When a card isn't in the catalog the app shows this confirmed data to the user.
const KNOWN_WEB_CARDS: Record<string, Omit<CreditCard, 'id'> & { sourceUrl: string; notes: string }> = {
  'amex blue business cash': {
    name: 'Blue Business Cash',
    issuer: 'American Express',
    color: '#1565C0',
    textColor: '#FFFFFF',
    rewards: { online_shopping: 2, dining: 2, groceries: 2, gas: 2, travel: 2 },
    defaultReward: 2,
    sourceUrl: 'https://www.americanexpress.com/us/credit-cards/card/blue-business-cash/',
    notes: '2% cash back on all eligible purchases (up to $50k/yr, then 1%)',
  },
  'chase ink business preferred': {
    name: 'Ink Business Preferred',
    issuer: 'Chase',
    color: '#0A4C8C',
    textColor: '#FFFFFF',
    rewards: { travel: 3, online_shopping: 3, transit: 3, entertainment: 3 },
    defaultReward: 1,
    sourceUrl: 'https://creditcards.chase.com/business-credit-cards/ink/preferred',
    notes: '3x on travel, shipping, ads, internet/cable/phone up to $150k/yr',
  },
  'chase ink business unlimited': {
    name: 'Ink Business Unlimited',
    issuer: 'Chase',
    color: '#1A3A5C',
    textColor: '#FFFFFF',
    rewards: {},
    defaultReward: 1.5,
    sourceUrl: 'https://creditcards.chase.com/business-credit-cards/ink/unlimited',
    notes: '1.5% cash back on all purchases, no annual fee',
  },
  'amex delta gold': {
    name: 'Delta SkyMiles Gold',
    issuer: 'American Express',
    color: '#1A237E',
    textColor: '#FFFFFF',
    rewards: { travel: 2, dining: 2, groceries: 2 },
    defaultReward: 1,
    sourceUrl: 'https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-gold-american-express-card/',
    notes: '2x on Delta purchases, dining, and US supermarkets',
  },
  'amex delta reserve': {
    name: 'Delta SkyMiles Reserve',
    issuer: 'American Express',
    color: '#0D0D2B',
    textColor: '#C9A84C',
    rewards: { travel: 3 },
    defaultReward: 1,
    sourceUrl: 'https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-reserve-american-express-card/',
    notes: '3x on Delta purchases, unlimited Delta Sky Club access',
  },
  'united club infinite': {
    name: 'United Club Infinite',
    issuer: 'Chase',
    color: '#003087',
    textColor: '#FFFFFF',
    rewards: { travel: 4, dining: 2, groceries: 2 },
    defaultReward: 1,
    sourceUrl: 'https://creditcards.chase.com/travel-credit-cards/united/club-infinite-card',
    notes: '4x on United, 2x on other travel/dining, United Club membership included',
  },
  'citi strata premier': {
    name: 'Strata Premier',
    issuer: 'Citi',
    color: '#002060',
    textColor: '#FFFFFF',
    rewards: { travel: 3, dining: 3, groceries: 3, gas: 3, online_shopping: 3 },
    defaultReward: 1,
    sourceUrl: 'https://www.citi.com/credit-cards/citi-strata-premier-credit-card',
    notes: '3x on hotels, air travel, restaurants, supermarkets, and gas',
  },
  'bilt mastercard': {
    name: 'Bilt Mastercard',
    issuer: 'Wells Fargo',
    color: '#1A1A1A',
    textColor: '#FFFFFF',
    rewards: { travel: 3, dining: 2 },
    defaultReward: 1,
    sourceUrl: 'https://biltrewards.com/card',
    notes: 'Earn points on rent with no fee. 3x travel, 2x dining, 1x rent/other',
  },
};

function normalizeQuery(q: string) {
  return q.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function webSearch(query: string): Promise<(Omit<CreditCard, 'id'> & { sourceUrl: string; notes: string }) | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = normalizeQuery(query);
      // Try exact match first
      if (KNOWN_WEB_CARDS[q]) { resolve(KNOWN_WEB_CARDS[q]); return; }
      // Partial match
      const key = Object.keys(KNOWN_WEB_CARDS).find((k) => q.includes(k) || k.includes(q));
      resolve(key ? KNOWN_WEB_CARDS[key] : null);
    }, 1200); // Simulate network delay
  });
}

export function BrowseCardsScreen() {
  const navigation = useNavigation<any>();
  const { addCard, removeCard, hasCard } = useCardStore();
  const [search, setSearch] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('All');

  // Web search state
  const [webLoading, setWebLoading] = useState(false);
  const [webResult, setWebResult] = useState<(Omit<CreditCard, 'id'> & { sourceUrl: string; notes: string }) | null>(null);
  const [webNotFound, setWebNotFound] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const localResults = useMemo(() => {
    return PRELOADED_CARDS.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q);
      const matchesIssuer = issuerFilter === 'All' || c.issuer === issuerFilter;
      return matchesSearch && matchesIssuer;
    });
  }, [search, issuerFilter]);

  const hasLocalResults = localResults.length > 0;
  const showWebPrompt = search.trim().length > 2 && !hasLocalResults;

  const handleWebSearch = async () => {
    setWebLoading(true);
    setWebNotFound(false);
    setWebResult(null);
    const result = await webSearch(search);
    setWebLoading(false);
    if (result) {
      setWebResult(result);
      setConfirmVisible(true);
    } else {
      setWebNotFound(true);
    }
  };

  const handleConfirmAdd = () => {
    if (!webResult) return;
    const card: CreditCard = {
      id: `web-${normalizeQuery(webResult.name).replace(/\s+/g, '-')}-${Date.now()}`,
      name: webResult.name,
      issuer: webResult.issuer,
      color: webResult.color,
      textColor: webResult.textColor,
      rewards: webResult.rewards,
      defaultReward: webResult.defaultReward,
      isPreloaded: false,
    };
    addCard(card);
    setConfirmVisible(false);
    setWebResult(null);
    setSearch('');
    Alert.alert('Added!', `${card.name} has been added to your wallet.`);
  };

  const toggle = (card: CreditCard) => {
    if (hasCard(card.id)) removeCard(card.id);
    else addCard(card);
  };

  const renderCard = ({ item }: { item: CreditCard }) => {
    const inWallet = hasCard(item.id);
    const topCategories = CATEGORIES.filter((cat) => item.rewards[cat.key] !== undefined).slice(0, 4);
    return (
      <View style={styles.card}>
        <View style={[styles.colorBar, { backgroundColor: item.color }]}>
          <View style={styles.chipSmall} />
          <Text style={styles.colorBarIssuer}>{item.issuer}</Text>
          <Text style={styles.colorBarName}>{item.name}</Text>
          <View style={styles.colorBarPills}>
            {topCategories.map((cat) => (
              <View key={cat.key} style={styles.pill}>
                <Text style={styles.pillText}>{cat.icon} {item.rewards[cat.key]}x</Text>
              </View>
            ))}
            <View style={[styles.pill, styles.pillBase]}>
              <Text style={styles.pillText}>🏷️ {item.defaultReward}x</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, inWallet && styles.toggleBtnActive]}
          onPress={() => toggle(item)}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, inWallet && styles.toggleTextActive]}>
            {inWallet ? '✓  In My Wallet' : '+  Add to Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIconText}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cards or type a card name…"
            placeholderTextColor="#3A4A66"
            value={search}
            onChangeText={(t) => { setSearch(t); setWebNotFound(false); setWebResult(null); }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setWebNotFound(false); setWebResult(null); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Issuer filter */}
      <FlatList
        data={ISSUERS}
        keyExtractor={(i) => i}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.issuerList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.issuerChip, issuerFilter === item && styles.issuerChipActive]}
            onPress={() => setIssuerFilter(item)}
          >
            <Text style={[styles.issuerChipText, issuerFilter === item && styles.issuerChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Web search prompt */}
      {showWebPrompt && (
        <View style={styles.webPromptBox}>
          <Text style={styles.webPromptLabel}>
            No local results for "{search}"
          </Text>
          {webLoading ? (
            <View style={styles.webLoadingRow}>
              <ActivityIndicator color="#4361EE" size="small" />
              <Text style={styles.webLoadingText}>Searching the web…</Text>
            </View>
          ) : webNotFound ? (
            <View>
              <Text style={styles.webNotFoundText}>
                Couldn't find this card in our database. You can add it manually with custom rates.
              </Text>
              <TouchableOpacity
                style={styles.webBtn}
                onPress={() => navigation.navigate('AddCard')}
              >
                <Text style={styles.webBtnText}>✏️  Add Custom Card</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.webBtn} onPress={handleWebSearch}>
              <Text style={styles.webBtnText}>🌐  Search the web for this card</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Card list */}
      <FlatList
        data={localResults}
        keyExtractor={(c) => c.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!showWebPrompt ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Start typing to find a card</Text>
          </View>
        ) : null}
      />

      {/* Confirmation modal */}
      <Modal visible={confirmVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setConfirmVisible(false)}>
        {webResult && (
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalEyebrow}>WEB RESULT</Text>
              <Text style={styles.modalTitle}>Is this correct?</Text>
              <Text style={styles.modalSub}>We found this card online. Please verify before adding.</Text>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              {/* Card preview */}
              <View style={[styles.modalCardPreview, { backgroundColor: webResult.color }]}>
                <View style={styles.chipSmall} />
                <Text style={[styles.colorBarIssuer, { marginTop: 8 }]}>{webResult.issuer}</Text>
                <Text style={[styles.colorBarName, { fontSize: 20 }]}>{webResult.name}</Text>
              </View>

              {/* Rewards */}
              <Text style={styles.modalSectionLabel}>REWARD RATES</Text>
              {CATEGORIES.filter((c) => webResult.rewards[c.key as CategoryKey] !== undefined).map((cat) => (
                <View key={cat.key} style={styles.modalRewardRow}>
                  <Text style={styles.modalRewardIcon}>{cat.icon}</Text>
                  <Text style={styles.modalRewardLabel}>{cat.label}</Text>
                  <Text style={styles.modalRewardValue}>{webResult.rewards[cat.key as CategoryKey]}x</Text>
                </View>
              ))}
              <View style={styles.modalRewardRow}>
                <Text style={styles.modalRewardIcon}>🏷️</Text>
                <Text style={styles.modalRewardLabel}>Everything else</Text>
                <Text style={styles.modalRewardValue}>{webResult.defaultReward}x</Text>
              </View>

              {/* Notes */}
              {webResult.notes && (
                <View style={styles.modalNoteBox}>
                  <Text style={styles.modalNoteText}>ℹ️  {webResult.notes}</Text>
                </View>
              )}

              {/* Source */}
              <TouchableOpacity onPress={() => Linking.openURL(webResult.sourceUrl)} style={styles.modalSourceRow}>
                <Text style={styles.modalSourceText}>Verify at official source ↗</Text>
              </TouchableOpacity>

              <View style={styles.modalWarning}>
                <Text style={styles.modalWarningText}>
                  ⚠️  Reward rates change. Always verify at the link above before relying on this data.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Not correct</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleConfirmAdd}>
                <Text style={styles.modalBtnConfirmText}>Looks right — Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },

  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161B24', borderRadius: 12,
    paddingHorizontal: 12, borderWidth: 1, borderColor: '#232B3A', gap: 8,
  },
  searchIconText: { fontSize: 15 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: '#FFFFFF' },
  clearBtn: { color: '#6B7A99', fontSize: 13, padding: 4 },

  issuerList: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  issuerChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#161B24', borderWidth: 1, borderColor: '#232B3A',
  },
  issuerChipActive: { backgroundColor: '#1A2240', borderColor: '#4361EE' },
  issuerChipText: { fontSize: 13, color: '#6B7A99', fontWeight: '600' },
  issuerChipTextActive: { color: '#7B93FF' },

  webPromptBox: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#161B24', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: '#232B3A',
  },
  webPromptLabel: { fontSize: 13, color: '#6B7A99', marginBottom: 10 },
  webLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  webLoadingText: { color: '#7B93FF', fontSize: 13 },
  webNotFoundText: { fontSize: 13, color: '#6B7A99', lineHeight: 18, marginBottom: 10 },
  webBtn: {
    backgroundColor: '#1A2240', borderRadius: 10,
    paddingVertical: 11, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#2E3F6E', alignItems: 'center',
  },
  webBtnText: { color: '#7B93FF', fontWeight: '700', fontSize: 14 },

  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { marginBottom: 14, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#232B3A' },
  colorBar: { padding: 18, minHeight: 130, justifyContent: 'space-between' },
  chipSmall: {
    width: 28, height: 20, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  colorBarIssuer: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700', marginTop: 6 },
  colorBarName: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginTop: 2, marginBottom: 10 },
  colorBarPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  pill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  pillBase: { backgroundColor: 'rgba(255,255,255,0.1)' },
  pillText: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  toggleBtn: {
    backgroundColor: '#161B24', paddingVertical: 13,
    alignItems: 'center', borderTopWidth: 1, borderTopColor: '#232B3A',
  },
  toggleBtnActive: { backgroundColor: '#1A2240' },
  toggleText: { fontSize: 14, fontWeight: '700', color: '#6B7A99' },
  toggleTextActive: { color: '#7B93FF' },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#6B7A99', fontSize: 14 },

  // Modal
  modal: { flex: 1, backgroundColor: '#0D1117' },
  modalHeader: { padding: 20, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: '#161B24' },
  modalEyebrow: { fontSize: 10, fontWeight: '700', color: '#4361EE', letterSpacing: 2.5, marginBottom: 4 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  modalSub: { fontSize: 13, color: '#6B7A99', marginTop: 4 },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: 16, paddingBottom: 20 },
  modalCardPreview: {
    borderRadius: 18, padding: 18, marginBottom: 20,
    minHeight: 120, justifyContent: 'flex-end',
  },
  modalSectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#4361EE',
    letterSpacing: 2, marginBottom: 8,
  },
  modalRewardRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161B24', borderRadius: 10,
    padding: 12, marginBottom: 5, borderWidth: 1, borderColor: '#232B3A', gap: 10,
  },
  modalRewardIcon: { fontSize: 16, width: 24 },
  modalRewardLabel: { flex: 1, fontSize: 14, color: '#8892A4' },
  modalRewardValue: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  modalNoteBox: {
    marginTop: 12, backgroundColor: '#161B24', borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: '#232B3A',
  },
  modalNoteText: { fontSize: 12, color: '#8892A4', lineHeight: 18 },
  modalSourceRow: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  modalSourceText: { color: '#4361EE', fontSize: 13, fontWeight: '600' },
  modalWarning: {
    marginTop: 8, backgroundColor: '#1A1500', borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: '#3D2E00',
  },
  modalWarningText: { fontSize: 12, color: '#C8A54A', lineHeight: 18 },
  modalBtns: {
    flexDirection: 'row', padding: 16, gap: 10,
    borderTopWidth: 1, borderTopColor: '#161B24',
  },
  modalBtnCancel: {
    flex: 1, backgroundColor: '#161B24', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#232B3A',
  },
  modalBtnCancelText: { color: '#6B7A99', fontWeight: '700', fontSize: 14 },
  modalBtnConfirm: {
    flex: 1, backgroundColor: '#4361EE', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: '#4361EE', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  modalBtnConfirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
