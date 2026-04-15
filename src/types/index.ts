export type CategoryKey =
  | 'dining'
  | 'groceries'
  | 'travel'
  | 'gas'
  | 'online_shopping'
  | 'entertainment'
  | 'streaming'
  | 'drugstore'
  | 'transit'
  | 'rent'
  | 'rotating'   // Quarterly rotating bonus (rate stored under this key)
  | 'other';

export interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
  quarterLabel?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  color: string;
  textColor: string;
  rewards: Partial<Record<CategoryKey, number>>;
  defaultReward: number;
  isPreloaded?: boolean;

  // ── Rotating bonus (quarterly, card-specific) ──────────────────────────────
  /** Specific merchant names that earn the rotating rate (e.g. Freedom Flex) */
  rotatingMerchants?: string[];
  /** Entire CategoryKeys that earn the rotating rate (e.g. Discover: dining, drugstore) */
  rotatingCategories?: CategoryKey[];
  /** Human-readable note, e.g. "Q2 2026 (Apr–Jun): Restaurants & Drug Stores" */
  rotatingNote?: string;

  // ── User-selectable bonus category (e.g. BofA Customized Cash) ────────────
  /** The categories the user can pick from for their bonus rate */
  choiceCategories?: CategoryKey[];
  /** The rate earned on the chosen category */
  choiceRate?: number;
  /** The category the user has currently selected */
  choiceCategory?: CategoryKey;
}

export interface MerchantEntry {
  name: string;
  category: CategoryKey;
  /** Badge shown in search dropdown, e.g. "⚡ Q2 bonus" */
  rotatingNote?: string;
}
