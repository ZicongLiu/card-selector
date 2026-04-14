import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { key: 'dining',          label: 'Dining',          icon: '🍽️' },
  { key: 'groceries',       label: 'Groceries',       icon: '🛒' },
  { key: 'travel',          label: 'Travel',          icon: '✈️' },
  { key: 'gas',             label: 'Gas',             icon: '⛽' },
  { key: 'online_shopping', label: 'Online Shopping', icon: '📦' },
  { key: 'entertainment',   label: 'Entertainment',   icon: '🎬' },
  { key: 'streaming',       label: 'Streaming',       icon: '📺' },
  { key: 'drugstore',       label: 'Drugstore',       icon: '💊' },
  { key: 'transit',         label: 'Transit',         icon: '🚇' },
  { key: 'rent',            label: 'Rent',            icon: '🏠' },
  // 'rotating' is derived dynamically from wallet cards in HomeScreen — not listed here
  { key: 'other',           label: 'Other',           icon: '🏷️' },
];
