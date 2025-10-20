/**
 * Stripe Client (Placeholder)
 * Prepared for future Stripe integration
 * 
 * To activate:
 * 1. Install: pnpm add stripe
 * 2. Add STRIPE_SECRET_KEY to environment
 * 3. Uncomment the code below
 */

// import Stripe from 'stripe';

// export function getStripeClient(env: Env): Stripe {
//   if (!env.STRIPE_SECRET_KEY) {
//     throw new Error('STRIPE_SECRET_KEY not configured');
//   }
  
//   return new Stripe(env.STRIPE_SECRET_KEY, {
//     apiVersion: '2024-06-20',
//   });
// }

/**
 * Placeholder: Create Stripe checkout session
 */
export async function createCheckoutSession(
  userId: string,
  tier: 'plus' | 'pro',
  env: Env
): Promise<{ url: string } | null> {
  // TODO: Implement when Stripe is activated
  console.log('Stripe checkout not yet implemented', { userId, tier });
  return null;
}

/**
 * Placeholder: Create Stripe portal session
 */
export async function createPortalSession(
  customerId: string,
  env: Env
): Promise<{ url: string } | null> {
  // TODO: Implement when Stripe is activated
  console.log('Stripe portal not yet implemented', { customerId });
  return null;
}

/**
 * Placeholder: Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  env: Env
): Promise<boolean> {
  // TODO: Implement when Stripe is activated
  console.log('Stripe cancellation not yet implemented', { subscriptionId });
  return false;
}

