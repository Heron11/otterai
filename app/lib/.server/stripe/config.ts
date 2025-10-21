/**
 * Stripe Configuration
 * Product and Price IDs for subscription tiers
 */

export const STRIPE_CONFIG = {
  products: {
    plus: 'prod_TH3cpdaQ21YOj0',
    pro: 'prod_TH3cGxXRL6RTWn',
  },
  prices: {
    plus: 'price_1SKVVNDsyGVnOZHcUmL2cQ61',
    pro: 'price_1SKVVUDsyGVnOZHcLGE4dNwz',
  },
} as const;

export type StripeTier = keyof typeof STRIPE_CONFIG.prices;

