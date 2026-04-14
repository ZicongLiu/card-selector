import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, CategoryKey } from '../types';
import { PRELOADED_CARDS } from '../data/cards';

const STORAGE_KEY = 'wallet_cards';

interface StoredWallet {
  selectedIds: string[];
  customCards: CreditCard[];
  preferences: Record<string, { cc?: CategoryKey }>;
}

export interface WalletSnapshot {
  selectedIds: string[];
  preferences: Record<string, { cc?: CategoryKey }>;
  customCards: CreditCard[];
}

interface CardStore {
  cards: CreditCard[];
  loaded: boolean;
  loadCards: () => Promise<void>;
  loadFromProfile: (selectedIds: string[], customCards: CreditCard[], preferences?: Record<string, { cc?: CategoryKey }>) => Promise<void>;
  addCard: (card: CreditCard) => void;
  removeCard: (id: string) => void;
  hasCard: (id: string) => boolean;
  updateCardChoice: (id: string, patch: Partial<CreditCard>) => void;
  /** Returns current wallet state for token encoding */
  getWalletSnapshot: () => WalletSnapshot;
  getRankedCards: (category: CategoryKey) => { card: CreditCard; multiplier: number }[];
  getBestCard: (category: CategoryKey) => { card: CreditCard; multiplier: number } | null;
}

/** Compute the effective multiplier for a card in a given category */
function effectiveRate(card: CreditCard, category: CategoryKey): number {
  if (card.choiceCategory === category && card.choiceRate !== undefined) return card.choiceRate;
  if (card.rotatingCategories?.includes(category)) return card.rewards.rotating ?? card.defaultReward;
  return card.rewards[category] ?? card.defaultReward;
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  loaded: false,

  loadCards: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) { set({ cards: [], loaded: true }); return; }
      const wallet: StoredWallet = JSON.parse(json);
      const prefs = wallet.preferences ?? {};
      const selected = PRELOADED_CARDS
        .filter((c) => wallet.selectedIds.includes(c.id))
        .map((c) => applyPrefs(c, prefs[c.id]));
      set({ cards: [...selected, ...(wallet.customCards ?? [])], loaded: true });
    } catch {
      set({ cards: [], loaded: true });
    }
  },

  loadFromProfile: async (selectedIds, customCards, preferences = {}) => {
    const selected = PRELOADED_CARDS
      .filter((c) => selectedIds.includes(c.id))
      .map((c) => applyPrefs(c, preferences[c.id]));
    const cards = [...selected, ...(customCards ?? [])];
    set({ cards, loaded: true });
    const wallet: StoredWallet = { selectedIds, customCards: customCards ?? [], preferences };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  },

  addCard: (card) => {
    const cards = [...get().cards, card];
    set({ cards });
    _persist(cards);
  },

  removeCard: (id) => {
    const cards = get().cards.filter((c) => c.id !== id);
    set({ cards });
    _persist(cards);
  },

  updateCardChoice: (id, patch) => {
    const cards = get().cards.map((c) => c.id === id ? { ...c, ...patch } : c);
    set({ cards });
    _persist(cards);
  },

  hasCard: (id) => get().cards.some((c) => c.id === id),

  getWalletSnapshot: (): WalletSnapshot => {
    const cards = get().cards;
    const selectedIds = cards.filter((c) => c.isPreloaded).map((c) => c.id);
    const customCards = cards.filter((c) => !c.isPreloaded);
    const preferences: Record<string, { cc?: CategoryKey }> = {};
    for (const card of cards) {
      if (card.isPreloaded && card.choiceCategory !== undefined) {
        preferences[card.id] = { cc: card.choiceCategory };
      }
    }
    return { selectedIds, preferences, customCards };
  },

  getRankedCards: (category) =>
    get().cards
      .map((card) => ({ card, multiplier: effectiveRate(card, category) }))
      .sort((a, b) => b.multiplier - a.multiplier),

  getBestCard: (category) => {
    const ranked = get().getRankedCards(category);
    return ranked.length > 0 ? ranked[0] : null;
  },
}));

function applyPrefs(card: CreditCard, prefs?: { cc?: CategoryKey }): CreditCard {
  if (!prefs) return card;
  return { ...card, ...(prefs.cc !== undefined ? { choiceCategory: prefs.cc } : {}) };
}

function _persist(cards: CreditCard[]) {
  const selectedIds = cards.filter((c) => c.isPreloaded).map((c) => c.id);
  const customCards = cards.filter((c) => !c.isPreloaded);
  const preferences: Record<string, { cc?: CategoryKey }> = {};
  for (const card of cards) {
    if (card.isPreloaded && card.choiceCategory !== undefined) {
      preferences[card.id] = { cc: card.choiceCategory };
    }
  }
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedIds, customCards, preferences }));
  // TODO: when Supabase is connected, push wallet here
}
