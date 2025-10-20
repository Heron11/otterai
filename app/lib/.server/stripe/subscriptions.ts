/**
 * Stripe Subscription Helpers
 * Functions for managing subscriptions via Stripe API
 */

import type Stripe from 'stripe';
import { getStripeClient } from './client';

/**
 * Get a subscription from Stripe
 */
export async function getSubscription(
  subscriptionId: string,
  env: Env
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient(env);
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string,
  env: Env
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient(env);
  
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string,
  env: Env
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient(env);
  
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Update subscription to a new price (tier change)
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newPriceId: string,
  env: Env
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient(env);
  
  // Get current subscription to find the subscription item
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  if (!subscription.items.data[0]) {
    throw new Error('Subscription has no items');
  }

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

/**
 * Get or create a Stripe customer
 */
export async function getOrCreateCustomer(
  email: string,
  userId: string,
  name: string | null,
  env: Env
): Promise<Stripe.Customer> {
  const stripe = getStripeClient(env);

  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email: email,
    name: name || undefined,
    metadata: {
      userId: userId,
    },
  });
}

