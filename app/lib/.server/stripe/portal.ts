/**
 * Stripe Customer Portal Service
 * Handles creating customer portal sessions for subscription management
 */

import type Stripe from 'stripe';
import { getStripeClient } from './client';

/**
 * Create a Stripe Customer Portal session
 * Allows users to manage their subscription, payment methods, and invoices
 */
export async function createPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
  env: Env
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripeClient(env);

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

