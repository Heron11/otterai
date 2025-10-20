/**
 * Stripe Checkout Service
 * Handles creating checkout sessions for subscription upgrades
 */

import type Stripe from 'stripe';
import { getStripeClient } from './client';
import { STRIPE_CONFIG } from './config';
import type { UserTier } from '~/lib/types/platform/user';

interface CheckoutSessionParams {
  userId: string;
  userEmail: string;
  tier: 'plus' | 'pro';
  stripeCustomerId?: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe Checkout session for subscription upgrade
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams,
  env: Env
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient(env);
  const priceId = STRIPE_CONFIG.prices[params.tier];

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
      tier: params.tier,
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
        tier: params.tier,
      },
    },
  };

  // If customer already exists, use it; otherwise create new
  if (params.stripeCustomerId) {
    sessionParams.customer = params.stripeCustomerId;
  } else {
    sessionParams.customer_email = params.userEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session;
}

