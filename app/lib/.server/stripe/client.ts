/**
 * Stripe Client
 * Active Stripe integration for subscription management
 */

import Stripe from 'stripe';

export function getStripeClient(env: Env): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-10-28.acacia',
  });
}

