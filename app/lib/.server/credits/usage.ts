/**
 * Usage Logging System
 * Tracks user message usage for analytics and billing
 */

import type { Database } from '../db/client';
import { execute, queryAll } from '../db/client';

interface UsageLog {
  id: number;
  user_id: string;
  message_count: number;
  credits_used: number;
  model: string;
  session_id: string | null;
  created_at: string;
}

/**
 * Log a usage event for a user
 */
export async function logUsage(
  db: Database,
  userId: string,
  options: {
    messageCount?: number;
    creditsUsed?: number;
    model?: string;
    sessionId?: string;
  } = {}
): Promise<boolean> {
  const {
    messageCount = 1,
    creditsUsed = 1,
    model = 'claude-haiku-4-5',
    sessionId = null,
  } = options;

  const result = await execute(
    db,
    `INSERT INTO usage_logs (user_id, message_count, credits_used, model, session_id)
     VALUES (?, ?, ?, ?, ?)`,
    userId,
    messageCount,
    creditsUsed,
    model,
    sessionId
  );

  return result.success;
}

/**
 * Get usage history for a user
 */
export async function getUserUsageHistory(
  db: Database,
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    days?: number;
  } = {}
): Promise<UsageLog[]> {
  const { limit = 100, offset = 0, days } = options;

  let query = `
    SELECT * FROM usage_logs 
    WHERE user_id = ?
  `;

  const params: any[] = [userId];

  if (days) {
    query += ` AND created_at >= datetime('now', '-${days} days')`;
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  return queryAll<UsageLog>(db, query, ...params);
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(
  db: Database,
  userId: string,
  days: number = 30
): Promise<{
  totalMessages: number;
  totalCredits: number;
  averageMessagesPerDay: number;
  byModel: Record<string, number>;
}> {
  const usage = await getUserUsageHistory(db, userId, { limit: 10000, days });

  const stats = usage.reduce(
    (acc, log) => {
      acc.totalMessages += log.message_count;
      acc.totalCredits += log.credits_used;
      acc.byModel[log.model] = (acc.byModel[log.model] || 0) + log.message_count;
      return acc;
    },
    {
      totalMessages: 0,
      totalCredits: 0,
      byModel: {} as Record<string, number>,
    }
  );

  return {
    ...stats,
    averageMessagesPerDay: Math.round((stats.totalMessages / days) * 100) / 100,
  };
}

/**
 * Get current month usage for a user
 */
export async function getCurrentMonthUsage(
  db: Database,
  userId: string
): Promise<{
  messagesThisMonth: number;
  creditsUsedThisMonth: number;
}> {
  const stats = await getUserUsageStats(db, userId, 30);
  
  return {
    messagesThisMonth: stats.totalMessages,
    creditsUsedThisMonth: stats.totalCredits,
  };
}

