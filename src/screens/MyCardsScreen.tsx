import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCardStore } from '../store/useCardStore';
import { CATEGORIES } from '../data/categories';
import { CreditCard, CategoryKey } from '../types';

export function MyCardsScreen() {
  const { cards, removeCard, updateCardChoice } = useCardStore();
  const navigation = useNavigation<any>();
  const [pickerCard, setPickerCard] = useState<CreditCard | null>(null);

  const handleDelete = (card: CreditCard) => {
    const label = card.isPreloaded
      ? `Remove "${card.name}" from your wallet? You can re-add it any time from Browse Cards.`
      : `Remove "${card.name}" from your wallet?`;
    if (window.confirm(label)) {
      removeCard(card.id);
    }
  };

  const handleChoiceSelect = (cardId: string, key: CategoryKey) => {
    updateCardChoice(cardId, { choiceCategory: key });
    setPickerCard(null);
  };

  const renderCard = ({ item }: { item: CreditCard }) => {
    const activeCategories = CATEGORIES.filter(
      (cat) => cat.key !== 'other' && item.rewards[cat.key] !== undefined && cat.key !== 'rotating'
    );
    const rotatingCategories = CATEGORIES.filter(
      (cat) => item.rotatingCategories?.includes(cat.key)
    );
    const hasChoice = !!item.choiceCategories?.length;
    const choiceCat = CATEGORIES.find((c) => c.key === item.choiceCategory);

    return (
      <View style={styles.cardWrapper}>
        <View style={[styles.card, { backgroundColor: item.color }]}>
          <View style={styles.cardShine} />

          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.chip}>
              <View style={styles.chipLine} />
            </View>
            <View style={styles.headerRight}>
              <Text style={[styles.issuerText, { color: item.textColor }]}>{item.issuer}</Text>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.deleteIcon, { color: item.textColor }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.cardName, { color: item.textColor }]}>{item.name}</Text>

          {/* Reward pills */}
          <View style={styles.pills}>
            {/* Fixed category rewards */}
            {activeCategories.map((cat) => (
              <View key={cat.key} style={styles.pill}>
                <Text style={styles.pillEmoji}>{cat.icon}</Text>
                <Text style={styles.pillValue}>{item.rewards[cat.key]}x</Text>
              </View>
            ))}
            {/* Rotating category bonuses */}
            {rotatingCategories.map((cat) => (
              <View key={`rot-${cat.key}`} style={[styles.pill, styles.pillRotating]}>
                <Text style={styles.pillEmoji}>{cat.icon}</Text>
                <Text style={styles.pillValue}>{item.rewards.rotating}x</Text>
                <Text style={styles.pillRotatingBadge}>⚡</Text>
              </View>
            ))}
            {/* Rotating merchant bonuses */}
            {item.rotatingMerchants?.map((m) => (
              <View key={`merch-${m}`} style={[styles.pill, styles.pillRotating]}>
                <Text style={styles.pillEmoji}>🏪</Text>
                <Text style={styles.pillValue}>{item.rewards.rotating}x</Text>
                <Text style={styles.pillRotatingBadge}>⚡</Text>
              </View>
            ))}
            {/* User choice category */}
            {hasChoice && choiceCat && (
              <View key="choice" style={[styles.pill, styles.pillChoice]}>
                <Text style={styles.pillEmoji}>{choiceCat.icon}</Text>
                <Text style={styles.pillValue}>{item.choiceRate}x</Text>
                <Text style={styles.pillChoiceBadge}>✓</Text>
              </View>
            )}
            <View style={[styles.pill, styles.pillBase]}>
              <Text style={styles.pillEmoji}>🏷️</Text>
              <Text style={styles.pillValue}>{item.defaultReward}x</Text>
            </View>
          </View>

          {/* Card number dots + NFC */}
          <View style={styles.cardFooter}>
            <View style={styles.dots}>
              {[0,1,2,3].map(g => (
                <View key={g} style={styles.dotGroup}>
                  {[0,1,2,3].map(d => (
                    <View key={d} style={[styles.dot, { backgroundColor: item.textColor + '50' }]} />
                  ))}
                </View>
              ))}
            </View>
            <View style={[styles.nfc, { borderColor: item.textColor + '55' }]}>
              <View style={[styles.nfcInner, { borderColor: item.textColor + '40' }]} />
            </View>
          </View>
        </View>

        {/* Rotating note */}
        {item.rotatingNote && (
          <View style={styles.rotatingNote}>
            <Text style={styles.rotatingNoteText}>⚡ {item.rotatingNote}</Text>
          </View>
        )}

        {/* BofA-style: category picker row */}
        {hasChoice && (
          <TouchableOpacity style={styles.choiceRow} onPress={() => setPickerCard(item)} activeOpacity={0.8}>
            <View style={styles.choiceLeft}>
              <Text style={styles.choiceLabel}>3% bonus category</Text>
              <Text style={styles.choiceValue}>
                {choiceCat ? `${choiceCat.icon} ${choiceCat.label}` : 'Tap to select'}
              </Text>
            </View>
            <Text style={styles.choiceArrow}>›</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>SMART WALLET</Text>
        <Text style={styles.headerTitle}>My Cards</Text>
        <Text style={styles.headerSub}>{cards.length} card{cards.length !== 1 ? 's' : ''} in your wallet</Text>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💳</Text>
            <Text style={styles.emptyTitle}>No cards yet</Text>
            <Text style={styles.emptyBody}>Tap the button below to add your first card.</Text>
          </View>
        }
      />

      <View style={styles.fabRow}>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('BrowseCards')} activeOpacity={0.85}>
          <Text style={styles.fabPlus}>⊕</Text>
          <Text style={styles.fabLabel}>Browse Cards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabSecondary} onPress={() => navigation.navigate('AddCard')} activeOpacity={0.85}>
          <Text style={styles.fabPlus}>✏️</Text>
          <Text style={styles.fabLabelSecondary}>Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Category picker modal for choice cards */}
      <Modal visible={!!pickerCard} transparent animationType="slide" onRequestClose={() => setPickerCard(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose Your 3% Category</Text>
            <Text style={styles.modalSub}>
              {pickerCard?.name} — select the category you earn {pickerCard?.choiceRate}x on
            </Text>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {pickerCard?.choiceCategories?.map((key) => {
                const cat = CATEGORIES.find((c) => c.key === key);
                if (!cat) return null;
                const selected = pickerCard.choiceCategory === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => handleChoiceSelect(pickerCard.id, key)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.modalOptionIcon}>{cat.icon}</Text>
                    <Text style={[styles.modalOptionLabel, selected && styles.modalOptionLabelSelected]}>
                      {cat.label}
                    </Text>
                    {selected && <Text style={styles.modalOptionCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setPickerCard(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },

  header: { backgroundColor: '#0D1117', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  headerEyebrow: { fontSize: 11, fontWeight: '700', color: '#4361EE', letterSpacing: 2.5, marginBottom: 6 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#6B7A99', marginTop: 4 },

  list: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 4 },

  cardWrapper: { marginBottom: 18 },

  card: {
    borderRadius: 22, padding: 20, minHeight: 180,
    justifyContent: 'space-between', overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  cardShine: {
    position: 'absolute', top: -50, right: -30, width: 160, height: 160,
    borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: {
    width: 34, height: 26, borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.28)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center', paddingHorizontal: 4,
  },
  chipLine: { height: 1.5, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  issuerText: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700', opacity: 0.8 },
  deleteBtn: { padding: 2 },
  deleteIcon: { fontSize: 13, opacity: 0.6, fontWeight: '700' },

  cardName: { fontSize: 19, fontWeight: '700', letterSpacing: 0.2, marginTop: 10 },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  pillBase: { backgroundColor: 'rgba(255,255,255,0.1)' },
  pillRotating: { backgroundColor: 'rgba(245,158,11,0.25)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' },
  pillChoice: { backgroundColor: 'rgba(99,255,132,0.2)', borderWidth: 1, borderColor: 'rgba(99,255,132,0.4)' },
  pillEmoji: { fontSize: 12 },
  pillValue: { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },
  pillRotatingBadge: { fontSize: 9, lineHeight: 12 },
  pillChoiceBadge: { fontSize: 9, color: '#4CAF50', fontWeight: '800', lineHeight: 12 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  dots: { flexDirection: 'row', gap: 6 },
  dotGroup: { flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  nfc: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nfcInner: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },

  rotatingNote: {
    backgroundColor: '#1A1200', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    marginTop: 8, borderWidth: 1, borderColor: '#5C3A00',
  },
  rotatingNoteText: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },

  choiceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#161B24', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    marginTop: 8, borderWidth: 1, borderColor: '#2E3F6E',
  },
  choiceLeft: { gap: 2 },
  choiceLabel: { fontSize: 11, color: '#6B7A99', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  choiceValue: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },
  choiceArrow: { fontSize: 22, color: '#3A4A66' },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#6B7A99', textAlign: 'center', lineHeight: 21 },

  fabRow: { position: 'absolute', bottom: 24, left: 20, right: 20, flexDirection: 'row', gap: 10 },
  fab: {
    flex: 1, backgroundColor: '#4361EE', borderRadius: 18, paddingVertical: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: '#4361EE', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 10,
  },
  fabSecondary: {
    flex: 1, backgroundColor: '#161B24', borderRadius: 18, paddingVertical: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: '#2E3F6E',
  },
  fabPlus: { color: '#FFF', fontSize: 20, fontWeight: '300', lineHeight: 22 },
  fabLabel: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  fabLabelSecondary: { color: '#7B93FF', fontSize: 14, fontWeight: '700' },

  // Category picker modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#161B24', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, maxHeight: '80%',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#2E3F6E', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#6B7A99', marginBottom: 20, lineHeight: 18 },
  modalList: { maxHeight: 400 },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14,
    marginBottom: 8, backgroundColor: '#1E2738',
    borderWidth: 1, borderColor: '#232B3A',
  },
  modalOptionSelected: { borderColor: '#4361EE', backgroundColor: '#1A2240' },
  modalOptionIcon: { fontSize: 22 },
  modalOptionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  modalOptionLabelSelected: { color: '#7B93FF' },
  modalOptionCheck: { fontSize: 16, color: '#4361EE', fontWeight: '800' },
  modalCancel: {
    marginTop: 12, backgroundColor: '#0D1117', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#232B3A',
  },
  modalCancelText: { fontSize: 15, color: '#6B7A99', fontWeight: '600' },
});
