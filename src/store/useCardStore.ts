import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, CategoryKey } from '../types';
import { PRELOADED_CARDS } from '../data/cards';

const STORAGE_KEY = 'wallet_cards'; // stores IDs of selected preloaded + full custom cards

interface CardStore {
  cards: CreditCard[]; // only cards the user has added to their wallet
  loaded: boolean;
  loadCards: () => Promise<void>;
  addCard: (card: CreditCard) => void;
  removeCard: (id: string) => void;
  hasCard: (id: string) => boolean;
  getRankedCards: (category: CategoryKey) => { card: CreditCard; multiplier: number }[];
  getBestCard: (category: CategoryKey) => { card: CreditCard; multiplier: number } | null;
}

interface StoredWallet {
  selectedIds: string[];         // IDs of chosen preloaded cards
  customCards: CreditCard[];     // fully stored custom cards
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
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedIds, customCards }));
}
