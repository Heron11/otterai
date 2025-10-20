/**
 * Authentication Middleware
 * Route protection utilities that preserve Bolt.new functionality
 */

import { requireAuth } from './clerk.server';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

/**
 * Routes that require authentication
 * Editor routes (/, /chat/:id) are intentionally NOT in this list
 * to preserve the original Bolt.new experience for anonymous users
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/projects',
  '/templates',
  '/settings',
] as const;

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Protect a loader function - only allow authenticated users
 * Use this wrapper in loaders that require auth
 * 
 * Example:
 * export const loader = protectLoader(async ({ request, context }) => {
 *   // This code only runs for authenticated users
 *   const userId = await requireAuth(request);
 *   // ... your loader logic
 * });
 */
export function protectLoader<T>(
  loaderFn: (args: LoaderFunctionArgs & { userId: string }) => Promise<T>
) {
  return async (args: LoaderFunctionArgs): Promise<T> => {
    const auth = await requireAuth(args.request);
    return loaderFn({ ...args, userId: auth.userId! });
  };
}

/**
 * Protect an action function - only allow authenticated users
 */
export function protectAction<T>(
  actionFn: (args: LoaderFunctionArgs & { userId: string }) => Promise<T>
) {
  return async (args: LoaderFunctionArgs): Promise<T> => {
    const auth = await requireAuth(args.request);
    return actionFn({ ...args, userId: auth.userId! });
  };
}

