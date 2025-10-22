/**
 * Project Utilities
 * Server-side utilities for project management
 */

/**
 * Generate a unique project ID
 * Uses timestamp + random string for uniqueness
 */
export function generateProjectId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`;
}

/**
 * Validate project ID format
 */
export function isValidProjectId(id: string): boolean {
  return /^[a-z0-9-]+$/i.test(id);
}

