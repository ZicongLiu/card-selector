import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCardStore } from '../store/useCardStore';
import { CATEGORIES } from '../data/categories';
import { CreditCard } from '../types';

export function MyCardsScreen() {
  const { cards, removeCard } = useCardStore();
  const navigation = useNavigation<any>();

  const handleDelete = (card: CreditCard) => {
    if (card.isPreloaded) {
      Alert.alert('Built-in Card', 'Pre-loaded cards cannot be removed.');
      return;
    }
    Alert.alert('Remove Card', `Remove "${card.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeCard(card.id) },
    ]);
  };

  const renderCard = ({ item }: { item: CreditCard }) => {
    const activeCategories = CATEGORIES.filter((cat) => item.rewards[cat.key] !== undefined);
    return (
      <View style={[styles.card, { backgroundColor: item.color }]}>
        <View style={styles.cardShine} />

        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.chip}>
            <View style={styles.chipLine} />
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.issuerText, { color: item.textColor }]}>{item.issuer}</Text>
            {!item.isPreloaded && (
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.deleteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.deleteIcon, { color: item.textColor }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={[styles.cardName, { color: item.textColor }]}>{item.name}</Text>

        {/* Reward pills */}
        <View style={styles.pills}>
          {activeCategories.map((cat) => (
            <View key={cat.key} style={styles.pill}>
              <Text style={styles.pillEmoji}>{cat.icon}</Text>
              <Text style={styles.pillValue}>{item.rewards[cat.key]}x</Text>
            </View>
          ))}
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
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCard')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabPlus}>＋</Text>
        <Text style={styles.fabLabel}>Add Custom Card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },

  header: {
    backgroundColor: '#0D1117',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4361EE',
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: 14, color: '#6B7A99', marginTop: 4 },

  list: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 4 },

  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    minHeight: 180,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardShine: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    width: 34,
    height: 26,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipLine: { height: 1.5, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  issuerText: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700', opacity: 0.8 },
  deleteBtn: { padding: 2 },
  deleteIcon: { fontSize: 13, opacity: 0.6, fontWeight: '700' },

  cardName: { fontSize: 19, fontWeight: '700', letterSpacing: 0.2, marginTop: 10 },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillBase: { backgroundColor: 'rgba(255,255,255,0.1)' },
  pillEmoji: { fontSize: 12 },
  pillValue: { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  dots: { flexDirection: 'row', gap: 6 },
  dotGroup: { flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  nfc: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nfcInner: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#6B7A99', textAlign: 'center', lineHeight: 21 },

  fab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#4361EE',
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4361EE',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  fabPlus: { color: '#FFF', fontSize: 22, fontWeight: '300', lineHeight: 24 },
  fabLabel: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
