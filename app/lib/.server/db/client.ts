/**
 * Cloudflare D1 Database Client
 * Provides type-safe database access for OtterAI
 */

import type { D1Database } from '@cloudflare/workers-types';

export type Database = D1Database;

/**
 * Get the database instance from Cloudflare context
 */
export function getDatabase(env: Env): Database {
  if (!env.DB) {
    throw new Error('Database not configured. Ensure D1 binding is set in wrangler.toml');
  }
  return env.DB;
}

/**
 * Execute a query and return the first result
 */
export async function queryFirst<T = any>(
  db: Database,
  query: string,
  ...params: any[]
): Promise<T | null> {
  const result = await db.prepare(query).bind(...params).first<T>();
  return result;
}

/**
 * Execute a query and return all results
 */
export async function queryAll<T = any>(
  db: Database,
  query: string,
  ...params: any[]
): Promise<T[]> {
  const result = await db.prepare(query).bind(...params).all<T>();
  return result.results || [];
}

/**
 * Execute a write query (INSERT, UPDATE, DELETE)
 */
export async function execute(
  db: Database,
  query: string,
  ...params: any[]
): Promise<D1Response> {
  const result = await db.prepare(query).bind(...params).run();
  return result;
}

/**
 * Execute multiple queries in a batch
 */
export async function batch(db: Database, statements: D1PreparedStatement[]): Promise<D1Response[]> {
  const results = await db.batch(statements);
  return results;
}

/**
 * Response type from D1 write operations
 */
export interface D1Response {
  success: boolean;
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
  };
  results?: any[];
}

