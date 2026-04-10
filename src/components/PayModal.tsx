import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { CreditCard } from '../types';

interface Props {
  visible: boolean;
  card: CreditCard | null;
  multiplier?: number;
  onClose: () => void;
}

function openWallet() {
  // shoebox:// is the iOS Wallet deep link (works on real device, not web/simulator)
  Linking.canOpenURL('shoebox://').then((supported) => {
    if (supported) {
      Linking.openURL('shoebox://');
    } else {
      // Fallback: open Wallet in App Store
      Linking.openURL('https://apps.apple.com/us/app/wallet/id1160481993');
    }
  });
}

export function PayModal({ visible, card, multiplier, onClose }: Props) {
  if (!card) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Card visual */}
        <View style={[styles.cardPreview, { backgroundColor: card.color }]}>
          <View style={styles.cardShine} />
          <View style={styles.cardTop}>
            <View style={styles.chip}><View style={styles.chipLine} /></View>
            <Text style={[styles.cardIssuer, { color: card.textColor }]}>{card.issuer}</Text>
          </View>
          <Text style={[styles.cardName, { color: card.textColor }]}>{card.name}</Text>
          {multiplier !== undefined && (
            <View style={styles.rewardRow}>
              <Text style={[styles.rewardNum, { color: card.textColor }]}>{multiplier}</Text>
              <Text style={[styles.rewardX, { color: card.textColor }]}>× points</Text>
            </View>
          )}
          <View style={styles.cardBottom}>
            <View style={styles.dotRow}>
              {[0,1,2,3].map(g=>(
                <View key={g} style={styles.dotGroup}>
                  {[0,1,2,3].map(d=>(
                    <View key={d} style={[styles.dot, { backgroundColor: card.textColor + '50' }]} />
                  ))}
                </View>
              ))}
            </View>
            <View style={[styles.nfc, { borderColor: card.textColor + '55' }]}>
              <View style={[styles.nfcInner, { borderColor: card.textColor + '40' }]} />
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructTitle}>Ready to pay</Text>
          <Text style={styles.instructSub}>
            Use <Text style={styles.instructBold}>{card.name}</Text> in Apple Wallet for the most points.
          </Text>

          <View style={styles.steps}>
            {[
              { icon: '📱', text: 'Double-click the side button on your iPhone' },
              { icon: '👆', text: `Swipe to select "${card.name}"` },
              { icon: '💳', text: 'Hold near the reader to pay' },
            ].map((s, i) => (
              <View key={i} style={styles.step}>
                <Text style={styles.stepIcon}>{s.icon}</Text>
                <Text style={styles.stepText}>{s.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.openBtn} onPress={openWallet} activeOpacity={0.85}>
          <Text style={styles.openBtnIcon}>   </Text>
          <Text style={styles.openBtnText}>Open Apple Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#0D1117',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: '#232B3A',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A4A66',
    alignSelf: 'center',
    marginBottom: 20,
  },

  // Card visual
  cardPreview: {
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardShine: {
    position: 'absolute', top: -50, right: -30,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: {
    width: 34, height: 26, borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center', paddingHorizontal: 4,
  },
  chipLine: { height: 1.5, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 },
  cardIssuer: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '700', opacity: 0.8 },
  cardName: { fontSize: 18, fontWeight: '700', letterSpacing: 0.2, marginTop: 10 },
  rewardRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  rewardNum: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  rewardX: { fontSize: 14, opacity: 0.7, fontWeight: '500' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  dotRow: { flexDirection: 'row', gap: 6 },
  dotGroup: { flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  nfc: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nfcInner: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },

  // Instructions
  instructions: { marginBottom: 20 },
  instructTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  instructSub: { fontSize: 14, color: '#6B7A99', marginBottom: 16, lineHeight: 20 },
  instructBold: { color: '#FFFFFF', fontWeight: '700' },
  steps: { gap: 10 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepIcon: { fontSize: 20, width: 28 },
  stepText: { flex: 1, fontSize: 14, color: '#8892A4', lineHeight: 19 },

  // Buttons
  openBtn: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  openBtnIcon: { fontSize: 20 },
  openBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  dismissBtn: { alignItems: 'center', paddingVertical: 10 },
  dismissText: { color: '#3A4A66', fontSize: 14, fontWeight: '600' },
});
