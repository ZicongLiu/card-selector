/**
 * Wallet token encoding / decoding
 *
 * The token is a self-contained base64 string that encodes the full wallet
 * state. No database required — paste the token on another device to restore.
 *
 * Payload schema (kept terse to minimise token length):
 *   v  : number                        — version (1)
 *   i  : string[]                      — selected preloaded card IDs
 *   p  : Record<id, { cc?: CategoryKey }>
 *                                      — per-card user preferences
 *   c  : CreditCard[]                  — fully custom cards
 *   b  : Record<benefitId, ISOstring>  — benefit check timestamps
 *
 * Benefit checks are included so importing restores your checklist state.
 * The existing auto-reset logic in BenefitsScreen discards any check whose
 * reset date has already passed, so importing an old token is always safe —
 * stale monthly/quarterly checks are thrown out automatically on load.
 *
 * Future: when Supabase is connected the token becomes an opaque lookup key;
 * encode/decode stays the same for offline fallback.
 */

import { CreditCard, CategoryKey } from '../types';

const CURRENT_VERSION = 1;

export interface WalletPayload {
  v: typeof CURRENT_VERSION;
  i: string[];
  p: Record<string, { cc?: CategoryKey }>;
  c: CreditCard[];
  /** Benefit check timestamps { benefitId: ISODateString } */
  b: Record<string, string>;
}

export interface WalletData {
  selectedIds: string[];
  preferences: Record<string, { cc?: CategoryKey }>;
  customCards: CreditCard[];
  /** Benefit check timestamps — may be empty {} */
  benefitChecks: Record<string, string>;
}

/** Encode full state into a compact shareable token string */
export function encodeWallet(data: WalletData): string {
  const payload: WalletPayload = {
    v: CURRENT_VERSION,
    i: data.selectedIds,
    p: data.preferences,
    c: data.customCards,
    b: data.benefitChecks,
  };
  const json = JSON.stringify(payload);
  try {
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return btoa(json);
  }
}

/** Decode a token string back to full wallet + benefit state */
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
        benefitChecks: payload.b ?? {},
      },
    };
  } catch {
    return { ok: false, error: 'Invalid token — could not be decoded. Make sure you copied the full token.' };
  }
}

/** Human-readable summary of a decoded wallet (shown in import preview) */
export function walletSummary(data: WalletData): string {
  const parts: string[] = [];
  const totalCards = data.selectedIds.length + data.customCards.length;
  if (totalCards > 0) parts.push(`${totalCards} card${totalCards !== 1 ? 's' : ''}`);
  const prefCount = Object.keys(data.preferences).length;
  if (prefCount > 0) parts.push(`${prefCount} preference${prefCount !== 1 ? 's' : ''}`);
  const checkCount = Object.keys(data.benefitChecks).length;
  if (checkCount > 0) parts.push(`${checkCount} benefit check${checkCount !== 1 ? 's' : ''}`);
  return parts.join(' · ') || 'empty wallet';
}
