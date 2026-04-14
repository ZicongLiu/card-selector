import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, CategoryKey } from '../types';
import { PRELOADED_CARDS } from '../data/cards';

const STORAGE_KEY = 'wallet_cards';

interface StoredWallet {
  selectedIds: string[];
  customCards: CreditCard[];
}

interface CardStore {
  cards: CreditCard[];
  loaded: boolean;
  loadCards: () => Promise<void>;
  loadFromProfile: (selectedIds: string[], customCards: CreditCard[]) => Promise<void>;
  addCard: (card: CreditCard) => void;
  removeCard: (id: string) => void;
  hasCard: (id: string) => boolean;
  getRankedCards: (category: CategoryKey) => { card: CreditCard; multiplier: number }[];
  getBestCard: (category: CategoryKey) => { card: CreditCard; multiplier: number } | null;
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  loaded: false,

  loadCards: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) {
        set({ cards: [], loaded: true });
        return;
      }
      const wallet: StoredWallet = JSON.parse(json);
      const selected = PRELOADED_CARDS.filter((c) => wallet.selectedIds.includes(c.id));
      set({ cards: [...selected, ...(wallet.customCards ?? [])], loaded: true });
    } catch {
      set({ cards: [], loaded: true });
    }
  },

  /** Apply a profile fetched from Supabase (overwrites local) */
  loadFromProfile: async (selectedIds, customCards) => {
    const selected = PRELOADED_CARDS.filter((c) => selectedIds.includes(c.id));
    const cards = [...selected, ...(customCards ?? [])];
    set({ cards, loaded: true });
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selectedIds, customCards: customCards ?? [] })
    );
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

  hasCard: (id) => get().cards.some((c) => c.id === id),

  getRankedCards: (category) =>
    get()
      .cards.map((card) => ({
        card,
        multiplier: card.rewards[category] ?? card.defaultReward,
      }))
      .sort((a, b) => b.multiplier - a.multiplier),

  getBestCard: (category) => {
    const ranked = get().getRankedCards(category);
    return ranked.length > 0 ? ranked[0] : null;
  },
}));

function _persist(cards: CreditCard[]) {
  const selectedIds = cards.filter((c) => c.isPreloaded).map((c) => c.id);
  const customCards = cards.filter((c) => !c.isPreloaded);
  const wallet = { selectedIds, customCards };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));

  // Sync to Supabase (lazy import to avoid circular deps)
  import('./useProfileStore').then(({ useProfileStore }) => {
    useProfileStore.getState().pushWallet(wallet);
  });
}
