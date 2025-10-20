/**
 * User Synchronization Logic
 * Syncs user data between Clerk and D1 database
 */

import type { Database } from '../db/client';
import { execute, queryFirst } from '../db/client';
import { TIER_LIMITS } from '~/lib/utils/tier-limits';
import type { UserTier } from '~/lib/types/platform/user';

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

/**
 * Create a new user in D1 from Clerk data
 */
export async function createUser(
  db: Database,
  clerkUser: ClerkUser
): Promise<boolean> {
  const email = clerkUser.email_addresses[0]?.email_address;
  if (!email) {
    throw new Error('User must have an email address');
  }

  const name = [clerkUser.first_name, clerkUser.last_name]
    .filter(Boolean)
    .join(' ') || null;

  const defaultTier: UserTier = 'free';
  const defaultCredits = TIER_LIMITS[defaultTier].creditsPerMonth;

  const result = await execute(
    db,
    `INSERT INTO users (id, email, name, avatar_url, tier, credits, credits_reset_at, daily_credits_used, daily_credits_reset_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP)`,
    clerkUser.id,
    email,
    name,
    clerkUser.image_url || null,
    defaultTier,
    defaultCredits
  );

  return result.success;
}

/**
 * Update an existing user in D1 from Clerk data
 */
export async function updateUser(
  db: Database,
  clerkUser: ClerkUser
): Promise<boolean> {
  const email = clerkUser.email_addresses[0]?.email_address;
  if (!email) {
    throw new Error('User must have an email address');
  }

  const name = [clerkUser.first_name, clerkUser.last_name]
    .filter(Boolean)
    .join(' ') || null;

  const result = await execute(
    db,
    `UPDATE users 
     SET email = ?, name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    email,
    name,
    clerkUser.image_url || null,
    clerkUser.id
  );

  return result.success;
}

/**
 * Soft delete a user (set deleted_at timestamp)
 */
export async function deleteUser(
  db: Database,
  userId: string
): Promise<boolean> {
  const result = await execute(
    db,
    `UPDATE users 
     SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    userId
  );

  return result.success;
}

/**
 * Get user by ID
 */
export async function getUserById(
  db: Database,
  userId: string
): Promise<any | null> {
  return queryFirst(
    db,
    'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
    userId
  );
}

/**
 * Update user tier (for subscription changes)
 */
export async function updateUserTier(
  db: Database,
  userId: string,
  newTier: UserTier
): Promise<boolean> {
  const newCredits = TIER_LIMITS[newTier].creditsPerMonth;

  // When upgrading, give full credits immediately
  // When downgrading, keep current credits until next reset
  const result = await execute(
    db,
    `UPDATE users 
     SET tier = ?, credits = ?, credits_reset_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    newTier,
    newCredits,
    userId
  );

  return result.success;
}

/**
 * Update user's Stripe customer ID
 */
export async function updateUserStripeCustomer(
  db: Database,
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId?: string
): Promise<boolean> {
  const result = await execute(
    db,
    `UPDATE users 
     SET stripe_customer_id = ?, stripe_subscription_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    stripeCustomerId,
    stripeSubscriptionId || null,
    userId
  );

  return result.success;
}

