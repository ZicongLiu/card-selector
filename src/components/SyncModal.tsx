import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { REWARDS_LAST_VERIFIED } from '../data/cards';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CARD_LINKS = [
  { name: 'Amex Gold', url: 'https://www.americanexpress.com/us/credit-cards/card/gold-card/' },
  { name: 'Amex Platinum', url: 'https://www.americanexpress.com/us/credit-cards/card/platinum/' },
  { name: 'Amex Blue Cash Preferred', url: 'https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred/' },
  { name: 'Amex Blue Cash Everyday', url: 'https://www.americanexpress.com/us/credit-cards/card/blue-cash-everyday/' },
  { name: 'Chase Sapphire Preferred', url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred' },
  { name: 'Chase Sapphire Reserve', url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve' },
  { name: 'Chase Freedom Unlimited', url: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited' },
  { name: 'Chase Freedom Flex', url: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/flex' },
  { name: 'Citi Double Cash', url: 'https://www.citi.com/credit-cards/citi-double-cash-credit-card' },
  { name: 'Citi Custom Cash', url: 'https://www.citi.com/credit-cards/citi-custom-cash-credit-card' },
  { name: 'Capital One Venture', url: 'https://www.capitalone.com/credit-cards/venture/' },
  { name: 'Capital One Venture X', url: 'https://www.capitalone.com/credit-cards/venture-x/' },
  { name: 'Discover it Cash Back', url: 'https://www.discover.com/credit-cards/cash-back/it-card.html' },
  { name: 'Wells Fargo Active Cash', url: 'https://www.wellsfargo.com/credit-cards/active-cash/' },
  { name: 'BofA Customized Cash', url: 'https://www.bankofamerica.com/credit-cards/products/cash-back-credit-card/' },
];

function getDaysOld(): number {
  const verified = new Date(REWARDS_LAST_VERIFIED);
  const now = new Date();
  return Math.floor((now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24));
}

export function SyncModal({ visible, onClose }: Props) {
  const daysOld = getDaysOld();
  const isStale = daysOld > 90;
  const isWarning = daysOld > 60;

  const statusColor = isStale ? '#EF4444' : isWarning ? '#F59E0B' : '#22C55E';
  const statusLabel = isStale ? 'Overdue — please verify' : isWarning ? 'Getting old — check soon' : 'Up to date';
  const statusIcon = isStale ? '⚠️' : isWarning ? '⏳' : '✓';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>SMART WALLET</Text>
            <Text style={styles.headerTitle}>Sync Rates</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Status card */}
          <View style={[styles.statusCard, { borderColor: statusColor + '55' }]}>
            <View style={styles.statusTop}>
              <Text style={styles.statusIcon}>{statusIcon}</Text>
              <View>
                <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
                <Text style={styles.statusDate}>Last verified: {REWARDS_LAST_VERIFIED}</Text>
              </View>
            </View>
            <View style={styles.statusBar}>
              <View style={[styles.statusBarFill, {
                width: `${Math.min((daysOld / 90) * 100, 100)}%`,
                backgroundColor: statusColor,
              }]} />
            </View>
            <Text style={styles.statusDays}>{daysOld} day{daysOld !== 1 ? 's' : ''} since last update · Quarterly check recommended</Text>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HOW TO UPDATE</Text>
            {[
              { n: '1', t: 'Open each card link below to check the latest rates' },
              { n: '2', t: 'Note any changed multipliers' },
              { n: '3', t: 'Go to My Cards → Add Custom Card to override a card with new rates' },
            ].map((s) => (
              <View key={s.n} style={styles.step}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.n}</Text></View>
                <Text style={styles.stepText}>{s.t}</Text>
              </View>
            ))}
          </View>

          {/* Card links */}
          <Text style={styles.sectionLabel}>OFFICIAL CARD PAGES</Text>
          {CARD_LINKS.map((card) => (
            <TouchableOpacity
              key={card.name}
              style={styles.linkRow}
              onPress={() => Linking.openURL(card.url)}
              activeOpacity={0.7}
            >
              <Text style={styles.linkName}>{card.name}</Text>
              <Text style={styles.linkArrow}>↗</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Rates are also cross-checked at</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.nerdwallet.com/best/credit-cards/rewards')}>
                <Text style={styles.footerLink}>NerdWallet</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>·</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://thepointsguy.com/credit-cards/best/')}>
                <Text style={styles.footerLink}>The Points Guy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#161B24',
  },
  headerEyebrow: { fontSize: 10, fontWeight: '700', color: '#4361EE', letterSpacing: 2.5, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#161B24', alignItems: 'center', justifyContent: 'center',
  },
  closeText: { color: '#6B7A99', fontSize: 14, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 16 },

  statusCard: {
    backgroundColor: '#161B24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  statusIcon: { fontSize: 24 },
  statusLabel: { fontSize: 15, fontWeight: '700' },
  statusDate: { fontSize: 12, color: '#6B7A99', marginTop: 2 },
  statusBar: { height: 6, backgroundColor: '#232B3A', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  statusBarFill: { height: '100%', borderRadius: 3 },
  statusDays: { fontSize: 11, color: '#6B7A99' },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#4361EE',
    letterSpacing: 2, marginBottom: 12,
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#1A2240', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2E3F6E',
  },
  stepNumText: { fontSize: 12, fontWeight: '700', color: '#7B93FF' },
  stepText: { flex: 1, fontSize: 14, color: '#8892A4', lineHeight: 20 },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161B24',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#232B3A',
  },
  linkName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  linkArrow: { fontSize: 16, color: '#4361EE' },

  footer: { marginTop: 20, alignItems: 'center', paddingBottom: 4 },
  footerText: { fontSize: 12, color: '#3A4A66', marginBottom: 6 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLink: { fontSize: 12, color: '#4361EE', fontWeight: '600' },
  footerDot: { fontSize: 12, color: '#3A4A66' },

  doneBtn: {
    margin: 20,
    backgroundColor: '#4361EE',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4361EE',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  doneBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
