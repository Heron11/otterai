/**
 * Credit Management System
 * Handles credit checking, deduction, and reset logic
 */

import type { Database } from '../db/client';
import { queryFirst, execute } from '../db/client';
import { TIER_LIMITS } from '~/lib/utils/tier-limits';
import type { UserTier } from '~/lib/types/platform/user';

interface UserCredits {
  credits: number;
  tier: UserTier;
  credits_reset_at: string;
  daily_credits_used: number;
  daily_credits_reset_at: string | null;
}

/**
 * Check if user has enough credits
 * Returns the user's current credits or null if user not found
 * For free tier, also checks daily limit
 */
export async function checkUserCredits(
  db: Database,
  userId: string
): Promise<number | null> {
  const user = await queryFirst<UserCredits>(
    db,
    'SELECT credits, tier, credits_reset_at, daily_credits_used, daily_credits_reset_at FROM users WHERE id = ? AND deleted_at IS NULL',
    userId
  );

  if (!user) {
    return null;
  }

  const now = new Date();

  // Check if monthly credits need to be reset
  const monthlyResetDate = new Date(user.credits_reset_at);
  const daysSinceMonthlyReset = (now.getTime() - monthlyResetDate.getTime()) / (1000 * 60 * 60 * 24);

  // Reset credits if more than 30 days have passed
  if (daysSinceMonthlyReset >= 30) {
    await resetUserCredits(db, userId, user.tier);
    return TIER_LIMITS[user.tier].creditsPerMonth;
  }

  // For free tier, check daily limit
  const tierLimits = TIER_LIMITS[user.tier];
  if (tierLimits.creditsPerDay && user.tier === 'free') {
    // Check if daily credits need to be reset
    const dailyResetDate = user.daily_credits_reset_at ? new Date(user.daily_credits_reset_at) : new Date(0);
    const hoursSinceDailyReset = (now.getTime() - dailyResetDate.getTime()) / (1000 * 60 * 60);

    // Reset daily credits if more than 24 hours have passed
    if (hoursSinceDailyReset >= 24) {
      await execute(
        db,
        'UPDATE users SET daily_credits_used = 0, daily_credits_reset_at = CURRENT_TIMESTAMP WHERE id = ?',
        userId
      );
      // Return credits if user hasn't exceeded monthly limit
      return user.credits;
    }

    // Check if daily limit is exceeded
    if (user.daily_credits_used >= tierLimits.creditsPerDay) {
      return 0; // Daily limit exceeded
    }
  }

  return user.credits;
}

/**
 * Deduct credits from a user's account
 * Returns the new credit balance or null if insufficient credits
 * For free tier, also increments daily usage counter
 */
export async function deductCredit(
  db: Database,
  userId: string,
  amount: number = 1
): Promise<number | null> {
  const currentCredits = await checkUserCredits(db, userId);

  if (currentCredits === null || currentCredits < amount) {
    return null;
  }

  // Get user tier to determine if we need to update daily counter
  const user = await queryFirst<{ tier: UserTier }>(
    db,
    'SELECT tier FROM users WHERE id = ?',
    userId
  );

  if (!user) {
    return null;
  }

  // For free tier, also increment daily credits used
  if (user.tier === 'free' && TIER_LIMITS.free.creditsPerDay) {
    const result = await execute(
      db,
      'UPDATE users SET credits = credits - ?, daily_credits_used = daily_credits_used + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND credits >= ?',
      amount,
      amount,
      userId,
      amount
    );

    if (!result.success) {
      return null;
    }
  } else {
    // For paid tiers, only deduct from monthly credits
    const result = await execute(
      db,
      'UPDATE users SET credits = credits - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND credits >= ?',
      amount,
      userId,
      amount
    );

    if (!result.success) {
      return null;
    }
  }

  return currentCredits - amount;
}

/**
 * Reset user credits to their tier limit
 */
export async function resetUserCredits(
  db: Database,
  userId: string,
  tier?: UserTier
): Promise<boolean> {
  // If tier not provided, fetch it
  if (!tier) {
    const user = await queryFirst<{ tier: UserTier }>(
      db,
      'SELECT tier FROM users WHERE id = ?',
      userId
    );
    
    if (!user) {
      return false;
    }
    
    tier = user.tier;
  }

  const creditLimit = TIER_LIMITS[tier].creditsPerMonth;

  const result = await execute(
    db,
    'UPDATE users SET credits = ?, credits_reset_at = CURRENT_TIMESTAMP, daily_credits_used = 0, daily_credits_reset_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    creditLimit,
    userId
  );

  return result.success;
}

/**
 * Add credits to a user's account (for upgrades or bonuses)
 */
export async function addCredits(
  db: Database,
  userId: string,
  amount: number
): Promise<number | null> {
  const result = await execute(
    db,
    'UPDATE users SET credits = credits + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    amount,
    userId
  );

  if (!result.success) {
    return null;
  }

  const user = await queryFirst<UserCredits>(
    db,
    'SELECT credits FROM users WHERE id = ?',
    userId
  );

  return user?.credits || null;
}

/**
 * Get user's credit balance and tier info
 */
export async function getUserCreditInfo(
  db: Database,
  userId: string
): Promise<{
  credits: number;
  tier: UserTier;
  limit: number;
  resetDate: string;
} | null> {
  const user = await queryFirst<UserCredits>(
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
    limit: TIER_LIMITS[user.tier].creditsPerMonth,
    resetDate: user.credits_reset_at,
  };
}

