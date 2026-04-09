import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, CategoryKey } from '../types';
import { PRELOADED_CARDS } from '../data/cards';

const STORAGE_KEY = 'user_cards';

interface CardStore {
  cards: CreditCard[];
  loaded: boolean;
  loadCards: () => Promise<void>;
  addCard: (card: CreditCard) => void;
  updateCard: (card: CreditCard) => void;
  removeCard: (id: string) => void;
  getBestCard: (category: CategoryKey) => { card: CreditCard; multiplier: number } | null;
  getRankedCards: (category: CategoryKey) => { card: CreditCard; multiplier: number }[];
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  loaded: false,

  loadCards: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const userCards: CreditCard[] = json ? JSON.parse(json) : [];
      const allCards = [
        ...PRELOADED_CARDS,
        ...userCards.filter((uc) => !PRELOADED_CARDS.find((pc) => pc.id === uc.id)),
      ];
      set({ cards: allCards, loaded: true });
    } catch {
      set({ cards: PRELOADED_CARDS, loaded: true });
    }
  },

  addCard: (card) => {
    const cards = [...get().cards, card];
    set({ cards });
    const userCards = cards.filter((c) => !c.isPreloaded);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userCards));
  },

  updateCard: (card) => {
    const cards = get().cards.map((c) => (c.id === card.id ? card : c));
    set({ cards });
    const userCards = cards.filter((c) => !c.isPreloaded);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userCards));
  },

  removeCard: (id) => {
    const cards = get().cards.filter((c) => c.id !== id);
    set({ cards });
    const userCards = cards.filter((c) => !c.isPreloaded);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userCards));
  },

  getRankedCards: (category) => {
    return get()
      .cards.map((card) => ({
        card,
        multiplier: card.rewards[category] ?? card.defaultReward,
      }))
      .sort((a, b) => b.multiplier - a.multiplier);
  },

  getBestCard: (category) => {
    const ranked = get().getRankedCards(category);
    return ranked.length > 0 ? ranked[0] : null;
  },
}));
