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

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error: any) {
    console.error('Stripe billing portal error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw,
    });
    throw error;
  }
}

