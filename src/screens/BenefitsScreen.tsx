import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SectionList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCardStore } from '../store/useCardStore';
import {
  BENEFITS,
  BENEFIT_CATEGORY_ICONS,
  REFRESH_PERIOD_LABELS,
  REFRESH_PERIOD_ICONS,
  RefreshPeriod,
  Benefit,
} from '../data/benefits';
import { PRELOADED_CARDS } from '../data/cards';

const STORAGE_KEY = 'benefit_checks'; // { [benefitId]: ISO date string of when it was checked }

// Returns the reset date for a check done on `checkedAt`
function getResetDate(period: RefreshPeriod, checkedAt: Date): Date | null {
  const d = new Date(checkedAt);
  switch (period) {
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);
      return d;
    case 'quarterly':
      d.setMonth(d.getMonth() + 3);
      d.setDate(1);
      return d;
    case 'annual':
      d.setFullYear(d.getFullYear() + 1);
      d.setMonth(0);
      d.setDate(1);
      return d;
    case 'per_stay':
    case 'once':
      return null; // manual reset only
  }
}

function daysUntil(date: Date): number {
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const PERIOD_ORDER: RefreshPeriod[] = ['monthly', 'quarterly', 'annual', 'per_stay', 'once'];

const SECTION_DESCRIPTIONS: Record<RefreshPeriod, string> = {
  monthly:   'Use these by end of month — they expire if you don\'t.',
  quarterly: 'Activate or use before the quarter ends.',
  annual:    'Track these year by year — big value if you don\'t miss them.',
  per_stay:  'Available every time you travel or make a qualifying purchase.',
  once:      'One-time perks — use them, then you\'re done.',
};

export function BenefitsScreen() {
  const { cards } = useCardStore();
  const [checks, setChecks] = useState<Record<string, string>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((json) => {
      if (json) setChecks(JSON.parse(json));
    });
  }, []);

  const myCardIds = cards.map((c) => c.id);

  // Auto-reset benefits whose reset date has passed
  useEffect(() => {
    const now = new Date();
    let changed = false;
    const updated = { ...checks };
    for (const [id, dateStr] of Object.entries(checks)) {
      const benefit = BENEFITS.find((b) => b.id === id);
      if (!benefit) continue;
      const resetDate = getResetDate(benefit.refreshPeriod, new Date(dateStr));
      if (resetDate && now >= resetDate) {
        delete updated[id];
        changed = true;
      }
    }
    if (changed) {
      setChecks(updated);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [checks]);

  const toggle = (id: string) => {
    const updated = { ...checks };
    if (updated[id]) {
      delete updated[id];
    } else {
      updated[id] = new Date().toISOString();
    }
    setChecks(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const myBenefits = useMemo(() =>
    BENEFITS.filter((b) => b.cardIds.some((id) => myCardIds.includes(id))),
    [myCardIds]
  );

  const sections = useMemo(() =>
    PERIOD_ORDER
      .map((period) => ({
        period,
        data: myBenefits.filter((b) => b.refreshPeriod === period),
      }))
      .filter((s) => s.data.length > 0),
    [myBenefits]
  );

  const cardNameFor = (b: Benefit) =>
    b.cardIds
      .filter((id) => myCardIds.includes(id))
      .map((id) => {
        const c = PRELOADED_CARDS.find((c) => c.id === id);
        return c?.name ?? id;
      })
      .join(', ');

  const renderItem = ({ item }: { item: Benefit }) => {
    const checked = !!checks[item.id];
    const checkedAt = checks[item.id] ? new Date(checks[item.id]) : null;
    const resetDate = checkedAt ? getResetDate(item.refreshPeriod, checkedAt) : null;
    const daysLeft = resetDate ? daysUntil(resetDate) : null;

    return (
      <TouchableOpacity
        style={[styles.item, checked && styles.itemChecked]}
        onPress={() => toggle(item.id)}
        activeOpacity={0.75}
      >
        {/* Checkbox */}
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>

        {/* Content */}
        <View style={styles.itemBody}>
          <View style={styles.itemTitleRow}>
            <Text style={[styles.itemTitle, checked && styles.itemTitleChecked]}>
              {item.title}
            </Text>
            <Text style={[styles.itemValue, checked && styles.itemValueChecked]}>
              {item.value}
            </Text>
          </View>

          <Text style={[styles.itemCard, checked && styles.textFaded]}>
            {cardNameFor(item)}
          </Text>

          {!checked && (
            <Text style={[styles.itemDesc, checked && styles.textFaded]}>
              {item.description}
            </Text>
          )}

          {checked && daysLeft !== null && (
            <Text style={styles.resetLabel}>
              ↻ Resets in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
            </Text>
          )}
          {checked && daysLeft === null && (
            <Text style={styles.resetLabelManual}>Tap to uncheck</Text>
          )}
        </View>

        {/* Category icon */}
        <Text style={styles.catIcon}>{BENEFIT_CATEGORY_ICONS[item.category]}</Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: { period: RefreshPeriod; data: Benefit[] } }) => {
    const total = section.data.length;
    const done = section.data.filter((b) => !!checks[b.id]).length;
    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionIcon}>{REFRESH_PERIOD_ICONS[section.period]}</Text>
          <Text style={styles.sectionTitle}>{REFRESH_PERIOD_LABELS[section.period]}</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{done}/{total}</Text>
          </View>
        </View>
        <Text style={styles.sectionDesc}>{SECTION_DESCRIPTIONS[section.period]}</Text>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${total ? (done / total) * 100 : 0}%` }]} />
        </View>
      </View>
    );
  };

  if (cards.length === 0) {
    return (
      <View style={styles.emptyFull}>
        <Text style={styles.emptyEmoji}>💳</Text>
        <Text style={styles.emptyTitle}>No cards in your wallet</Text>
        <Text style={styles.emptyBody}>Add cards in the My Cards tab to see your benefits here.</Text>
      </View>
    );
  }

  if (myBenefits.length === 0) {
    return (
      <View style={styles.emptyFull}>
        <Text style={styles.emptyEmoji}>🎁</Text>
        <Text style={styles.emptyTitle}>No tracked benefits</Text>
        <Text style={styles.emptyBody}>Benefits for your cards will appear here.</Text>
      </View>
    );
  }

  const totalBenefits = myBenefits.length;
  const totalDone = myBenefits.filter((b) => !!checks[b.id]).length;

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerEyebrow}>SMART WALLET</Text>
            <Text style={styles.headerTitle}>Benefits</Text>
            <View style={styles.headerSummary}>
              <Text style={styles.headerSummaryText}>
                {totalDone} of {totalBenefits} benefits tracked
              </Text>
              {totalDone === totalBenefits && totalBenefits > 0 && (
                <Text style={styles.allDoneBadge}>🎉 All done!</Text>
              )}
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  listContent: { paddingBottom: 40 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerEyebrow: { fontSize: 11, fontWeight: '700', color: '#4361EE', letterSpacing: 2.5, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 8 },
  headerSummary: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerSummaryText: { fontSize: 13, color: '#6B7A99' },
  allDoneBadge: { fontSize: 13, color: '#4CAF50', fontWeight: '700' },

  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  sectionBadge: {
    backgroundColor: '#1A2240',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#2E3F6E',
  },
  sectionBadgeText: { fontSize: 11, color: '#7B93FF', fontWeight: '700' },
  sectionDesc: { fontSize: 12, color: '#6B7A99', lineHeight: 17, marginBottom: 8 },
  progressBar: { height: 3, backgroundColor: '#1A2240', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4361EE', borderRadius: 2 },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#161B24',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#232B3A',
    gap: 12,
  },
  itemChecked: {
    backgroundColor: '#111618',
    borderColor: '#1A2A1A',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#2E3F6E',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  itemBody: { flex: 1 },
  itemTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 2 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  itemTitleChecked: { color: '#3A4A66', textDecorationLine: 'line-through' },
  itemValue: { fontSize: 12, fontWeight: '700', color: '#7B93FF', flexShrink: 0 },
  itemValueChecked: { color: '#2E3A50' },
  itemCard: { fontSize: 11, color: '#6B7A99', marginBottom: 4 },
  itemDesc: { fontSize: 13, color: '#8892A4', lineHeight: 18 },
  textFaded: { color: '#3A4A66' },
  resetLabel: { fontSize: 11, color: '#4361EE', fontWeight: '600', marginTop: 4 },
  resetLabelManual: { fontSize: 11, color: '#3A4A66', marginTop: 4 },

  catIcon: { fontSize: 18, marginTop: 2, flexShrink: 0 },

  emptyFull: { flex: 1, backgroundColor: '#0D1117', alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#6B7A99', textAlign: 'center', lineHeight: 21 },
});
