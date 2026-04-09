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
  | 'other';

export interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
}

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  color: string;
  textColor: string;
  rewards: Partial<Record<CategoryKey, number>>; // multiplier e.g. 3 = 3x points
  defaultReward: number; // fallback multiplier for unlisted categories
  isPreloaded?: boolean;
}

export interface MerchantEntry {
  name: string;
  category: CategoryKey;
}
