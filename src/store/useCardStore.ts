import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, CategoryKey } from '../types';
import { PRELOADED_CARDS } from '../data/cards';

const STORAGE_KEY = 'wallet_cards';

interface StoredWallet {
  selectedIds: string[];
  customCards: CreditCard[];
  /** Per-card user overrides (e.g. choiceCategory for BofA) */
  preferences: Record<string, Partial<CreditCard>>;
}

interface CardStore {
  cards: CreditCard[];
  loaded: boolean;
  loadCards: () => Promise<void>;
  loadFromProfile: (selectedIds: string[], customCards: CreditCard[]) => Promise<void>;
  addCard: (card: CreditCard) => void;
  removeCard: (id: string) => void;
  hasCard: (id: string) => boolean;
  /** Update a user-selectable field on any card (e.g. choiceCategory) */
  updateCardChoice: (id: string, patch: Partial<CreditCard>) => void;
  getRankedCards: (category: CategoryKey) => { card: CreditCard; multiplier: number }[];
  getBestCard: (category: CategoryKey) => { card: CreditCard; multiplier: number } | null;
}

/** Compute the effective multiplier for a card in a given category */
function effectiveRate(card: CreditCard, category: CategoryKey): number {
  // 1. Choice category (user-selected, e.g. BofA Customized Cash)
  if (card.choiceCategory === category && card.choiceRate !== undefined) {
    return card.choiceRate;
  }
  // 2. Rotating categories (e.g. Discover: dining / drugstore this quarter)
  if (card.rotatingCategories?.includes(category)) {
    return card.rewards.rotating ?? card.defaultReward;
  }
  // 3. Rotating merchants tile — handled separately in HomeScreen via rotatingMerchants
  // 4. Regular reward
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
        .map((c) => ({ ...c, ...prefs[c.id] }));
      set({ cards: [...selected, ...(wallet.customCards ?? [])], loaded: true });
    } catch {
      set({ cards: [], loaded: true });
    }
  },

  loadFromProfile: async (selectedIds, customCards) => {
    const selected = PRELOADED_CARDS.filter((c) => selectedIds.includes(c.id));
    const cards = [...selected, ...(customCards ?? [])];
    set({ cards, loaded: true });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedIds, customCards: customCards ?? [], preferences: {} }));
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

  getRankedCards: (category) =>
    get()
      .cards
      .map((card) => ({ card, multiplier: effectiveRate(card, category) }))
      .sort((a, b) => b.multiplier - a.multiplier),

  getBestCard: (category) => {
    const ranked = get().getRankedCards(category);
    return ranked.length > 0 ? ranked[0] : null;
  },
}));

function _persist(cards: CreditCard[]) {
  const selectedIds = cards.filter((c) => c.isPreloaded).map((c) => c.id);
  const customCards = cards.filter((c) => !c.isPreloaded);
  // Store user preferences (choiceCategory etc.) separately so preloaded card
  // base data is always sourced from cards.ts (stays up-to-date on sync)
  const preferences: Record<string, Partial<CreditCard>> = {};
  for (const card of cards) {
    if (card.isPreloaded && card.choiceCategory !== undefined) {
      preferences[card.id] = { choiceCategory: card.choiceCategory };
    }
  }
  const wallet = { selectedIds, customCards, preferences };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  import('./useProfileStore').then(({ useProfileStore }) => {
    useProfileStore.getState().pushWallet({ selectedIds, customCards });
  });
}
