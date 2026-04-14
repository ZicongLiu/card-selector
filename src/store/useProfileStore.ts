/**
 * Profile store
 *
 * Currently: token is a compact encoded string derived from wallet state.
 * No database involved — the token IS the data.
 *
 * Future: when Supabase is connected, pushWallet / pushBenefits will activate.
 */

import { create } from 'zustand';

interface ProfileStore {
  /**
   * Push wallet to Supabase — no-op until database is configured.
   * TODO (#6): connect Supabase and implement.
   */
  pushWallet: () => Promise<void>;

  /**
   * Push benefit checks to Supabase — no-op until database is configured.
   * TODO (#6): connect Supabase and implement.
   */
  pushBenefits: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>(() => ({
  pushWallet: async () => { /* TODO #6: Supabase sync */ },
  pushBenefits: async () => { /* TODO #6: Supabase sync */ },
}));
