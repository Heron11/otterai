/**
 * Path utilities for consistent path handling
 */

import { WORK_DIR } from '~/utils/constants';

/**
 * Normalize a file path to be relative to the working directory
 * This ensures consistent path handling between file watcher and manual additions
 */
export function normalizeToRelativePath(path: string): string {
  if (!path) return '';
  
  // Remove trailing slashes
  let normalized = path.replace(/\/+$/g, '');
  
  // Remove WORK_DIR prefix if present
  if (normalized.startsWith(WORK_DIR + '/')) {
    normalized = normalized.substring(WORK_DIR.length + 1);
  } else if (normalized === WORK_DIR) {
    normalized = '';
  }
  
  return normalized;
}

/**
 * Convert a relative path to absolute path within the working directory
 */
export function toAbsolutePath(relativePath: string): string {
  if (!relativePath) return WORK_DIR;
  
  // Remove leading slash if present
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  return `${WORK_DIR}/${cleanPath}`;
}

/**
 * Check if a path is within the working directory
 */
export function isWithinWorkDir(path: string): boolean {
  return path.startsWith(WORK_DIR + '/') || path === WORK_DIR;
}
