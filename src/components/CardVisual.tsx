import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CreditCard } from '../types';

interface Props {
  card: CreditCard;
  multiplier?: number;
  rank?: number;
  compact?: boolean;
}

export function CardVisual({ card, multiplier, rank, compact }: Props) {
  const isTopPick = rank === 0;

  return (
    <View style={[styles.card, { backgroundColor: card.color }, compact && styles.cardCompact]}>
      {/* Shine overlay */}
      <View style={styles.shine} />

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.chip}>
          <View style={styles.chipLine} />
        </View>
        <Text style={[styles.issuer, { color: card.textColor }]} numberOfLines={1}>
          {card.issuer}
        </Text>
      </View>

      {/* Card name */}
      <Text style={[styles.name, { color: card.textColor }]} numberOfLines={1}>
        {card.name}
      </Text>

      {/* Multiplier */}
      {multiplier !== undefined && (
        <View style={styles.rewardRow}>
          <Text style={[styles.multiplierBig, { color: card.textColor }]}>
            {multiplier}
          </Text>
          <View style={styles.rewardMeta}>
            <Text style={[styles.xLabel, { color: card.textColor }]}>×</Text>
            <Text style={[styles.pointsLabel, { color: card.textColor }]}>points</Text>
          </View>
          {isTopPick && (
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>BEST</Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <View style={styles.cardNumber}>
          {[0, 1, 2, 3].map((g) => (
            <View key={g} style={styles.dotGroup}>
              {[0, 1, 2, 3].map((d) => (
                <View key={d} style={[styles.dot, { backgroundColor: card.textColor + '60' }]} />
              ))}
            </View>
          ))}
        </View>
        <View style={[styles.nfc, { borderColor: card.textColor + '55' }]}>
          <View style={[styles.nfcInner, { borderColor: card.textColor + '40' }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    minHeight: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardCompact: {
    minHeight: 110,
    padding: 16,
  },
  shine: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  topRow: {
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
  chipLine: {
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 1,
  },
  issuer: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
    opacity: 0.8,
    maxWidth: '65%',
    textAlign: 'right',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 8,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  multiplierBig: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 40,
  },
  rewardMeta: { justifyContent: 'center' },
  xLabel: { fontSize: 16, fontWeight: '700', opacity: 0.7, lineHeight: 18 },
  pointsLabel: { fontSize: 12, opacity: 0.65, fontWeight: '500' },
  bestBadge: {
    marginLeft: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bestBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardNumber: { flexDirection: 'row', gap: 6 },
  dotGroup: { flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  nfc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
});
