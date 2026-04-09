import { MerchantEntry, CategoryKey } from '../types';

export const MERCHANTS: MerchantEntry[] = [
  // Dining
  { name: "McDonald's", category: 'dining' },
  { name: 'Starbucks', category: 'dining' },
  { name: 'Chipotle', category: 'dining' },
  { name: 'Chick-fil-A', category: 'dining' },
  { name: "Domino's", category: 'dining' },
  { name: 'DoorDash', category: 'dining' },
  { name: 'Uber Eats', category: 'dining' },
  { name: 'GrubHub', category: 'dining' },
  { name: 'Taco Bell', category: 'dining' },
  { name: 'Subway', category: 'dining' },
  { name: "Wendy's", category: 'dining' },
  { name: 'Burger King', category: 'dining' },
  { name: 'Olive Garden', category: 'dining' },
  { name: 'Applebee\'s', category: 'dining' },
  { name: "Denny's", category: 'dining' },

  // Groceries
  { name: 'Whole Foods', category: 'groceries' },
  { name: 'Trader Joe\'s', category: 'groceries' },
  { name: 'Kroger', category: 'groceries' },
  { name: 'Safeway', category: 'groceries' },
  { name: 'Publix', category: 'groceries' },
  { name: 'Aldi', category: 'groceries' },
  { name: 'Wegmans', category: 'groceries' },
  { name: 'Costco', category: 'groceries' },
  { name: 'Sam\'s Club', category: 'groceries' },
  { name: 'Target', category: 'groceries' },
  { name: 'Walmart', category: 'groceries' },
  { name: 'H-E-B', category: 'groceries' },

  // Travel
  { name: 'Delta', category: 'travel' },
  { name: 'United Airlines', category: 'travel' },
  { name: 'American Airlines', category: 'travel' },
  { name: 'Southwest', category: 'travel' },
  { name: 'Marriott', category: 'travel' },
  { name: 'Hilton', category: 'travel' },
  { name: 'Hyatt', category: 'travel' },
  { name: 'Airbnb', category: 'travel' },
  { name: 'Expedia', category: 'travel' },
  { name: 'Booking.com', category: 'travel' },
  { name: 'Kayak', category: 'travel' },
  { name: 'Uber', category: 'travel' },
  { name: 'Lyft', category: 'travel' },

  // Gas
  { name: 'Shell', category: 'gas' },
  { name: 'BP', category: 'gas' },
  { name: 'ExxonMobil', category: 'gas' },
  { name: 'Chevron', category: 'gas' },
  { name: 'Sunoco', category: 'gas' },
  { name: 'Circle K', category: 'gas' },
  { name: 'Speedway', category: 'gas' },

  // Online Shopping
  { name: 'Amazon', category: 'online_shopping' },
  { name: 'eBay', category: 'online_shopping' },
  { name: 'Etsy', category: 'online_shopping' },
  { name: 'Best Buy', category: 'online_shopping' },
  { name: 'Wayfair', category: 'online_shopping' },
  { name: 'Chewy', category: 'online_shopping' },
  { name: 'Shopify', category: 'online_shopping' },
  { name: 'AliExpress', category: 'online_shopping' },

  // Entertainment
  { name: 'AMC Theaters', category: 'entertainment' },
  { name: 'Regal', category: 'entertainment' },
  { name: 'Ticketmaster', category: 'entertainment' },
  { name: 'StubHub', category: 'entertainment' },
  { name: 'Eventbrite', category: 'entertainment' },

  // Streaming
  { name: 'Netflix', category: 'streaming' },
  { name: 'Hulu', category: 'streaming' },
  { name: 'Disney+', category: 'streaming' },
  { name: 'HBO Max', category: 'streaming' },
  { name: 'Apple TV+', category: 'streaming' },
  { name: 'Spotify', category: 'streaming' },
  { name: 'Apple Music', category: 'streaming' },
  { name: 'Peacock', category: 'streaming' },
  { name: 'Paramount+', category: 'streaming' },
  { name: 'YouTube Premium', category: 'streaming' },
  { name: 'Amazon Prime Video', category: 'streaming' },

  // Drugstore
  { name: 'CVS', category: 'drugstore' },
  { name: 'Walgreens', category: 'drugstore' },
  { name: 'Rite Aid', category: 'drugstore' },

  // Transit
  { name: 'MTA', category: 'transit' },
  { name: 'CTA', category: 'transit' },
  { name: 'Caltrain', category: 'transit' },
  { name: 'BART', category: 'transit' },
  { name: 'Metro', category: 'transit' },
  { name: 'Amtrak', category: 'transit' },
];

export function searchMerchants(query: string): MerchantEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return MERCHANTS.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
}

export function getCategoryForMerchant(name: string): CategoryKey | null {
  const match = MERCHANTS.find(
    (m) => m.name.toLowerCase() === name.toLowerCase()
  );
  return match ? match.category : null;
}
