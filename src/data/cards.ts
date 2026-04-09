import { CreditCard } from '../types';

// Last verified against official issuer sites + NerdWallet/TPG
export const REWARDS_LAST_VERIFIED = '2026-04-09';

export const PRELOADED_CARDS: CreditCard[] = [
  // ── American Express ──────────────────────────────────────────────────────
  {
    id: 'amex-gold',
    name: 'Gold Card',
    issuer: 'American Express',
    color: '#B8962E',
    textColor: '#FFFFFF',
    rewards: {
      dining: 4,
      groceries: 4,
      travel: 5, // via Amex Travel
    },
    defaultReward: 1,
    isPreloaded: true,
  },
  {
    id: 'amex-platinum',
    name: 'Platinum Card',
    issuer: 'American Express',
    color: '#8C9EAA',
    textColor: '#FFFFFF',
    rewards: {
      travel: 5, // flights direct or via Amex Travel
    },
    defaultReward: 1,
    isPreloaded: true,
  },
  {
    id: 'amex-blue-cash-preferred',
    name: 'Blue Cash Preferred',
    issuer: 'American Express',
    color: '#0070CC',
    textColor: '#FFFFFF',
    rewards: {
      groceries: 6, // U.S. supermarkets up to $6k/yr
      streaming: 6, // U.S. streaming subscriptions
      gas: 3,
      transit: 3,
    },
    defaultReward: 1,
    isPreloaded: true,
  },
  {
    id: 'amex-blue-cash-everyday',
    name: 'Blue Cash Everyday',
    issuer: 'American Express',
    color: '#1E88E5',
    textColor: '#FFFFFF',
    rewards: {
      groceries: 3, // U.S. supermarkets up to $6k/yr
      gas: 3,
      online_shopping: 3, // U.S. online retail up to $6k/yr
    },
    defaultReward: 1,
    isPreloaded: true,
  },

  // ── Chase ─────────────────────────────────────────────────────────────────
  {
    id: 'chase-sapphire-preferred',
    name: 'Sapphire Preferred',
    issuer: 'Chase',
    color: '#1A3A5C',
    textColor: '#FFFFFF',
    rewards: {
      travel: 5,   // via Chase Travel portal
      dining: 3,
      streaming: 3,
      groceries: 3, // online groceries (excl. Walmart/Target)
    },
    defaultReward: 1,
    isPreloaded: true,
  },
  {
    id: 'chase-sapphire-reserve',
    name: 'Sapphire Reserve',
    issuer: 'Chase',
    color: '#0D1B2A',
    textColor: '#C9A84C',
    rewards: {
      travel: 8,   // via Chase Travel
      dining: 3,
    },
    defaultReward: 1,
    isPreloaded: true,
  },
  {
    id: 'chase-freedom-unlimited',
    name: 'Freedom Unlimited',
    issuer: 'Chase',
    color: '#2166AC',
    textColor: '#FFFFFF',
    rewards: {
      dining: 3,
      drugstore: 3,
      travel: 5, // via Chase Travel
    },
    defaultReward: 1.5,
    isPreloaded: true,
  },
  {
    id: 'chase-freedom-flex',
    name: 'Freedom Flex',
    issuer: 'Chase',
    color: '#2C5F8A',
    textColor: '#FFFFFF',
    rewards: {
      dining: 3,
      drugstore: 3,
      travel: 5, // via Chase Travel
      // Rotating 5% categories not modeled (changes quarterly)
    },
    defaultReward: 1,
    isPreloaded: true,
  },

  // ── Citi ──────────────────────────────────────────────────────────────────
  {
    id: 'citi-double-cash',
    name: 'Double Cash',
    issuer: 'Citi',
    color: '#003087',
    textColor: '#FFFFFF',
    rewards: {},
    defaultReward: 2,
    isPreloaded: true,
  },
  {
    id: 'citi-custom-cash',
    name: 'Custom Cash',
    issuer: 'Citi',
    color: '#00408B',
    textColor: '#FFFFFF',
    rewards: {
      // 5% on your top spend category up to $500/cycle
      // We model it as 5x across common categories
      dining: 5,
      groceries: 5,
      gas: 5,
      travel: 5,
      online_shopping: 5,
      streaming: 5,
      drugstore: 5,
    },
    defaultReward: 1,
    isPreloaded: true,
  },

  // ── Capital One ───────────────────────────────────────────────────────────
  {
    id: 'capital-one-venture',
    name: 'Venture Rewards',
    issuer: 'Capital One',
    color: '#8B0000',
    textColor: '#FFFFFF',
    rewards: {
      travel: 5, // hotels/rentals via Capital One Travel
    },
    defaultReward: 2,
    isPreloaded: true,
  },
  {
    id: 'capital-one-venture-x',
    name: 'Venture X',
    issuer: 'Capital One',
    color: '#5C0000',
    textColor: '#FFFFFF',
    rewards: {
      travel: 10, // hotels & rental cars via Capital One Travel
    },
    defaultReward: 2,
    isPreloaded: true,
  },

  // ── Discover ──────────────────────────────────────────────────────────────
  {
    id: 'discover-it',
    name: 'Discover it Cash Back',
    issuer: 'Discover',
    color: '#E87722',
    textColor: '#FFFFFF',
    rewards: {
      // Rotating 5% - showing Q2 2026 categories
      dining: 5,
    },
    defaultReward: 1,
    isPreloaded: true,
  },

  // ── Wells Fargo ───────────────────────────────────────────────────────────
  {
    id: 'wells-fargo-active-cash',
    name: 'Active Cash',
    issuer: 'Wells Fargo',
    color: '#CC0000',
    textColor: '#FFFFFF',
    rewards: {},
    defaultReward: 2,
    isPreloaded: true,
  },

  // ── Bank of America ───────────────────────────────────────────────────────
  {
    id: 'bofa-customized-cash',
    name: 'Customized Cash Rewards',
    issuer: 'Bank of America',
    color: '#E31837',
    textColor: '#FFFFFF',
    rewards: {
      groceries: 2,
    },
    defaultReward: 1,
    isPreloaded: true,
  },
];
