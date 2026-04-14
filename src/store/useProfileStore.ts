import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CreditCard } from '../types';

const TOKEN_KEY = 'profile_token';
const LAST_SYNCED_KEY = 'last_synced';

export interface StoredWallet {
  selectedIds: string[];
  customCards: CreditCard[];
}

export interface RemoteProfile {
  token: string;
  selected_ids: string[];
  custom_cards: CreditCard[];
  benefit_checks: Record<string, string>;
  updated_at: string;
}

function generateToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface ProfileStore {
  token: string | null;
  syncing: boolean;
  lastSynced: string | null;
  configured: boolean;

  /** Called on app start — loads or creates the local token */
  init: () => Promise<void>;

  /** Push wallet state up to Supabase */
  pushWallet: (wallet: StoredWallet) => Promise<void>;

  /** Push benefit check state up to Supabase */
  pushBenefits: (checks: Record<string, string>) => Promise<void>;

  /**
   * Import a profile from a different token.
   * Returns the fetched profile so the caller can apply it locally,
   * or an error string if it failed.
   */
  importToken: (token: string) => Promise<{ ok: true; profile: RemoteProfile } | { ok: false; error: string }>;

  /** Fetch the current token's profile from Supabase */
  fetchProfile: () => Promise<RemoteProfile | null>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  token: null,
  syncing: false,
  lastSynced: null,
  configured: isSupabaseConfigured(),

  init: async () => {
    let token = await AsyncStorage.getItem(TOKEN_KEY);
    const lastSynced = await AsyncStorage.getItem(LAST_SYNCED_KEY);
    if (!token) {
      token = generateToken();
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
    set({ token, lastSynced, configured: isSupabaseConfigured() });
  },

  pushWallet: async (wallet) => {
    const { token } = get();
    if (!token || !isSupabaseConfigured()) return;
    set({ syncing: true });
    try {
      await supabase.from('profiles').upsert(
        {
          token,
          selected_ids: wallet.selectedIds,
          custom_cards: wallet.customCards,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      );
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNCED_KEY, now);
      set({ lastSynced: now });
    } finally {
      set({ syncing: false });
    }
  },

  pushBenefits: async (checks) => {
    const { token } = get();
    if (!token || !isSupabaseConfigured()) return;
    set({ syncing: true });
    try {
      await supabase.from('profiles').upsert(
        {
          token,
          benefit_checks: checks,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      );
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNCED_KEY, now);
      set({ lastSynced: now });
    } finally {
      set({ syncing: false });
    }
  },

  importToken: async (token) => {
    if (!isSupabaseConfigured()) {
      return { ok: false, error: 'Sync is not configured yet.' };
    }
    set({ syncing: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('token', token.trim().toLowerCase())
        .single();

      if (error || !data) {
        return { ok: false, error: 'Token not found. Double-check and try again.' };
      }

      // Switch to the new token locally
      await AsyncStorage.setItem(TOKEN_KEY, token.trim().toLowerCase());
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNCED_KEY, now);
      set({ token: token.trim().toLowerCase(), lastSynced: now });

      return { ok: true, profile: data as RemoteProfile };
    } catch {
      return { ok: false, error: 'Network error. Check your connection and try again.' };
    } finally {
      set({ syncing: false });
    }
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token || !isSupabaseConfigured()) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('token', token)
      .single();
    return (data as RemoteProfile) ?? null;
  },
}));
