/**
 * User Database Queries
 * Provides functions to fetch user data from D1
 */

import type { Database } from '../db/client';
import { queryFirst, queryAll } from '../db/client';
import type { UserTier } from '~/lib/types/platform/user';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  tier: UserTier;
  credits: number;
  credits_reset_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(
  db: Database,
  userId: string
): Promise<UserProfile | null> {
  return queryFirst<UserProfile>(
    db,
    'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
    userId
  );
}

/**
 * Get user profile by email
 */
export async function getUserByEmail(
  db: Database,
  email: string
): Promise<UserProfile | null> {
  return queryFirst<UserProfile>(
    db,
    'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
    email
  );
}

/**
 * Get multiple user profiles by IDs
 */
export async function getUserProfiles(
  db: Database,
  userIds: string[]
): Promise<UserProfile[]> {
  if (userIds.length === 0) {
    return [];
  }

  const placeholders = userIds.map(() => '?').join(',');
  return queryAll<UserProfile>(
    db,
    `SELECT * FROM users WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    ...userIds
  );
}

/**
 * Get user's credit information
 */
export async function getUserCredits(
  db: Database,
  userId: string
): Promise<{ credits: number; tier: UserTier; resetDate: string } | null> {
  const user = await queryFirst<{ credits: number; tier: UserTier; credits_reset_at: string }>(
    db,
    'SELECT credits, tier, credits_reset_at FROM users WHERE id = ? AND deleted_at IS NULL',
    userId
  );

  if (!user) {
    return null;
  }

  return {
    credits: user.credits,
    tier: user.tier,
    resetDate: user.credits_reset_at,
  };
}

