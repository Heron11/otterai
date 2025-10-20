/**
 * Subscription Database Queries
 * Functions for managing subscription data in D1
 */

import type { Database } from '../db/client';
import { execute, queryFirst } from '../db/client';
import type { UserTier } from '~/lib/types/platform/user';

export interface SubscriptionRecord {
  id: string; // Stripe subscription ID
  user_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  tier: UserTier;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionData {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  tier: UserTier;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Create a new subscription record
 */
export async function createSubscription(
  db: Database,
  data: CreateSubscriptionData
): Promise<boolean> {
  const result = await execute(
    db,
    `INSERT INTO subscriptions 
     (id, user_id, stripe_customer_id, stripe_price_id, tier, status, current_period_start, current_period_end, cancel_at_period_end)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.id,
    data.userId,
    data.stripeCustomerId,
    data.stripePriceId,
    data.tier,
    data.status,
    data.currentPeriodStart.toISOString(),
    data.currentPeriodEnd.toISOString(),
    data.cancelAtPeriodEnd ? 1 : 0
  );

  return result.success;
}

/**
 * Get subscription by user ID
 */
export async function getSubscription(
  db: Database,
  userId: string
): Promise<SubscriptionRecord | null> {
  return queryFirst<SubscriptionRecord>(
    db,
    'SELECT * FROM subscriptions WHERE user_id = ?',
    userId
  );
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionById(
  db: Database,
  subscriptionId: string
): Promise<SubscriptionRecord | null> {
  return queryFirst<SubscriptionRecord>(
    db,
    'SELECT * FROM subscriptions WHERE id = ?',
    subscriptionId
  );
}

/**
 * Update subscription record
 */
export async function updateSubscription(
  db: Database,
  subscriptionId: string,
  updates: {
    status?: 'active' | 'canceled' | 'past_due' | 'incomplete';
    tier?: UserTier;
    stripePriceId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  }
): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.tier !== undefined) {
    fields.push('tier = ?');
    values.push(updates.tier);
  }
  if (updates.stripePriceId !== undefined) {
    fields.push('stripe_price_id = ?');
    values.push(updates.stripePriceId);
  }
  if (updates.currentPeriodStart !== undefined) {
    fields.push('current_period_start = ?');
    values.push(updates.currentPeriodStart.toISOString());
  }
  if (updates.currentPeriodEnd !== undefined) {
    fields.push('current_period_end = ?');
    values.push(updates.currentPeriodEnd.toISOString());
  }
  if (updates.cancelAtPeriodEnd !== undefined) {
    fields.push('cancel_at_period_end = ?');
    values.push(updates.cancelAtPeriodEnd ? 1 : 0);
  }

  if (fields.length === 0) {
    return false;
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(subscriptionId);

  const result = await execute(
    db,
    `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );

  return result.success;
}

/**
 * Delete subscription record
 */
export async function deleteSubscription(
  db: Database,
  subscriptionId: string
): Promise<boolean> {
  const result = await execute(
    db,
    'DELETE FROM subscriptions WHERE id = ?',
    subscriptionId
  );

  return result.success;
}

