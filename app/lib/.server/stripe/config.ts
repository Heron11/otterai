/**
 * Stripe Configuration
 * Product and Price IDs for subscription tiers
 */

export const STRIPE_CONFIG = {
  products: {
    plus: 'prod_TGik2fbcYsJHX7',
    pro: 'prod_TGilWKrYFZ665h',
  },
  prices: {
    plus: 'price_1SKBJdRjvitucgh9mcap73NW',
    pro: 'price_1SKBJiRjvitucgh91lR8fadh',
  },
} as const;

export type StripeTier = keyof typeof STRIPE_CONFIG.prices;

