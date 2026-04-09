import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CreditCard } from '../types';

interface Props {
  card: CreditCard;
  multiplier?: number;
  size?: 'small' | 'large';
}

export function CardChip({ card, multiplier, size = 'small' }: Props) {
  const isLarge = size === 'large';
  return (
    <View style={[styles.card, { backgroundColor: card.color }, isLarge && styles.cardLarge]}>
      <Text style={[styles.issuer, { color: card.textColor }, isLarge && styles.issuerLarge]}>
        {card.issuer}
      </Text>
      <Text style={[styles.name, { color: card.textColor }, isLarge && styles.nameLarge]}>
        {card.name}
      </Text>
      {multiplier !== undefined && (
        <Text style={[styles.multiplier, { color: card.textColor }, isLarge && styles.multiplierLarge]}>
          {multiplier}x points
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
  },
  cardLarge: {
    padding: 20,
    borderRadius: 16,
  },
  issuer: {
    fontSize: 11,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  issuerLarge: {
    fontSize: 14,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  nameLarge: {
    fontSize: 20,
    marginTop: 4,
  },
  multiplier: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  multiplierLarge: {
    fontSize: 32,
    marginTop: 8,
  },
});
