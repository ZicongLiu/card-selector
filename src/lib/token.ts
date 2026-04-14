/**
 * Wallet token encoding / decoding
 *
 * The token is a self-contained base64 string that encodes the full wallet
 * state. No database required — paste the token on another device to restore.
 *
 * Payload schema (kept terse to minimise token length):
 *   v  : number          — version (1)
 *   i  : string[]        — selected preloaded card IDs
 *   p  : Record<id, { cc?: CategoryKey }>
 *                        — per-card user preferences (e.g. BofA chosen category)
 *   c  : CreditCard[]    — fully custom cards (complete definitions)
 *
 * Future: when Supabase is connected the token will just become an opaque
 * lookup key; encode/decode stays the same.
 */

import { CreditCard, CategoryKey } from '../types';

const CURRENT_VERSION = 1;

export interface WalletPayload {
  v: typeof CURRENT_VERSION;
  /** Selected preloaded card IDs */
  i: string[];
  /** Per-card user preferences keyed by card id */
  p: Record<string, { cc?: CategoryKey }>;
  /** Fully custom cards */
  c: CreditCard[];
}

export interface WalletData {
  selectedIds: string[];
  preferences: Record<string, { cc?: CategoryKey }>;
  customCards: CreditCard[];
}

/** Encode wallet state into a compact shareable token string */
export function encodeWallet(data: WalletData): string {
  const payload: WalletPayload = {
    v: CURRENT_VERSION,
    i: data.selectedIds,
    p: data.preferences,
    c: data.customCards,
  };
  const json = JSON.stringify(payload);
  // btoa works in both browser (Expo Web) and React Native (≥ 0.67)
  try {
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return btoa(json);
  }
}

/** Decode a token string back to wallet data */
export function decodeWallet(token: string): { ok: true; data: WalletData } | { ok: false; error: string } {
  try {
    const trimmed = token.trim();
    let json: string;
    try {
      json = decodeURIComponent(escape(atob(trimmed)));
    } catch {
      json = atob(trimmed);
    }

    const payload = JSON.parse(json) as WalletPayload;

    if (payload.v !== CURRENT_VERSION) {
      return { ok: false, error: `Token version ${payload.v} is not supported. Please re-generate on the latest app version.` };
    }
    if (!Array.isArray(payload.i)) {
      return { ok: false, error: 'Invalid token format.' };
    }

    return {
      ok: true,
      data: {
        selectedIds: payload.i ?? [],
        preferences: payload.p ?? {},
        customCards: payload.c ?? [],
      },
    };
  } catch {
    return { ok: false, error: 'Invalid token — could not be decoded. Make sure you copied the full token.' };
  }
}

/** Human-readable summary of a decoded wallet (shown in import confirmation) */
export function walletSummary(data: WalletData): string {
  const parts: string[] = [];
  if (data.selectedIds.length > 0) parts.push(`${data.selectedIds.length} card${data.selectedIds.length !== 1 ? 's' : ''}`);
  if (data.customCards.length > 0) parts.push(`${data.customCards.length} custom`);
  const prefCount = Object.keys(data.preferences).length;
  if (prefCount > 0) parts.push(`${prefCount} preference${prefCount !== 1 ? 's' : ''}`);
  return parts.join(' · ') || 'empty wallet';
}
