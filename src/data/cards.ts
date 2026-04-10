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

  {
    id: 'amex-marriott-brilliant',
    name: 'Marriott Bonvoy Brilliant',
    issuer: 'American Express',
    color: '#8B1A1A',
    textColor: '#FFFFFF',
    rewards: {
      travel: 6,    // Marriott Bonvoy hotels
      dining: 3,
    },
    defaultReward: 2,
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
      online_shopping: 5, // Q2 2026 rotating 5%: Amazon, Whole Foods
      groceries: 5,       // Q2 2026 rotating 5%: Whole Foods
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
    rewards: { groceries: 2 },
    defaultReward: 1,
    isPreloaded: true,
  },

  // ── Hilton (Amex) ─────────────────────────────────────────────────────────
  {
    id: 'amex-hilton-aspire',
    name: 'Hilton Honors Aspire',
    issuer: 'American Express',
    color: '#002B5C',
    textColor: '#FFFFFF',
    rewards: { travel: 14, dining: 7 },
    defaultReward: 3,
    isPreloaded: true,
  },
  {
    id: 'amex-hilton-surpass',
    name: 'Hilton Honors Surpass',
    issuer: 'American Express',
    color: '#1A4B8C',
    textColor: '#FFFFFF',
    rewards: { travel: 12, dining: 6, groceries: 6, gas: 6, online_shopping: 4 },
    defaultReward: 3,
    isPreloaded: true,
  },

  // ── Marriott (Chase) ──────────────────────────────────────────────────────
  {
    id: 'chase-marriott-boundless',
    name: 'Marriott Bonvoy Boundless',
    issuer: 'Chase',
    color: '#6B1A2A',
    textColor: '#FFFFFF',
    rewards: { travel: 6, dining: 3, groceries: 3, gas: 3 },
    defaultReward: 2,
    isPreloaded: true,
  },
  {
    id: 'chase-marriott-bold',
    name: 'Marriott Bonvoy Bold',
    issuer: 'Chase',
    color: '#005F73',
    textColor: '#FFFFFF',
    rewards: { travel: 3 },
    defaultReward: 1,
    isPreloaded: true,
  },

  // ── Hyatt (Chase) ─────────────────────────────────────────────────────────
  {
    id: 'chase-hyatt',
    name: 'World of Hyatt',
    issuer: 'Chase',
    color: '#1B3A4B',
    textColor: '#FFFFFF',
    rewards: { travel: 4, dining: 2, transit: 2 },
    defaultReward: 1,
    isPreloaded: true,
  },

  // ── IHG (Chase) ───────────────────────────────────────────────────────────
  {
    id: 'chase-ihg-premier',
    name: 'IHG One Rewards Premier',
    issuer: 'Chase',
    color: '#005596',
    textColor: '#FFFFFF',
    rewards: { travel: 10, dining: 5, gas: 5 },
    defaultReward: 3,
    isPreloaded: true,
  },

  // ── Airline cards ─────────────────────────────────────────────────────────
  {
    id: 'amex-delta-platinum',
    name: 'Delta SkyMiles Platinum',
    issuer: 'American Express',
    color: '#003366',
    textColor: '#FFFFFF',
    rewards: { travel: 3, dining: 2, gas: 2 },
    defaultReward: 1,
    isPreloaded: true,
  },
  {
    id: 'chase-united-explorer',
    name: 'United Explorer',
    issuer: 'Chase',
    color: '#005DAA',
    textColor: '#FFFFFF',
    rewards: { travel: 2, dining: 2, gas: 2, groceries: 2, drugstore: 2 },
    defaultReward: 1,
    isPreloaded: true,
  },
  {
    id: 'chase-southwest-priority',
    name: 'Southwest Rapid Rewards Priority',
    issuer: 'Chase',
    color: '#304CB2',
    textColor: '#FFFFFF',
    rewards: { travel: 3, dining: 2, groceries: 2 },
    defaultReward: 1,
    isPreloaded: true,
  },
  {
    id: 'citi-aa-platinum',
    name: 'AAdvantage Platinum Select',
    issuer: 'Citi',
    color: '#0078D7',
    textColor: '#FFFFFF',
    rewards: { travel: 2, dining: 2, gas: 2 },
    defaultReward: 1,
    isPreloaded: true,
  },

  // ── Alaska Airlines ───────────────────────────────────────────────────────
  {
    id: 'bofa-alaska-airlines',
    name: 'Alaska Airlines Visa Signature',
    issuer: 'Bank of America',
    color: '#01426A',
    textColor: '#FFFFFF',
    rewards: { travel: 3, transit: 2, gas: 2 },
    defaultReward: 1,
    isPreloaded: true,
  },

  // ── Wyndham ───────────────────────────────────────────────────────────────
  {
    id: 'barclays-wyndham-earner',
    name: 'Wyndham Rewards Earner',
    issuer: 'Barclays',
    color: '#003F72',
    textColor: '#FFFFFF',
    rewards: { travel: 5, gas: 2, dining: 2 },
    defaultReward: 1,
    isPreloaded: true,
  },
];
