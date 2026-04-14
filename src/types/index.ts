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
  | 'rotating'   // Quarterly rotating bonus categories (card-specific merchants)
  | 'other';

export interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
  quarterLabel?: string; // e.g. "Q2 2026" shown as badge on tile
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
  /** Merchants that qualify for the rotating bonus this quarter */
  rotatingMerchants?: string[];
  /** Human-readable note shown in results, e.g. "Q2 2026: Amazon & Whole Foods" */
  rotatingNote?: string;
}

export interface MerchantEntry {
  name: string;
  category: CategoryKey;
  /** Shown as a badge in the search dropdown, e.g. "⚡ Q2 bonus" */
  rotatingNote?: string;
}
