/**
 * Clerk Server-Side Authentication Helpers
 * Provides utilities for authentication and authorization in server routes
 */

import { getAuth } from '@clerk/remix/ssr.server';
import { redirect } from '@remix-run/cloudflare';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';

/**
 * Get the current user's authentication state
 * Returns null if not authenticated
 */
export async function getCurrentUser(args: LoaderFunctionArgs | ActionFunctionArgs) {
  const auth = await getAuth(args);
  return auth;
}

/**
 * Require authentication - redirect to login if not authenticated
 * Use this in loaders/actions that require authentication
 */
export async function requireAuth(args: LoaderFunctionArgs | ActionFunctionArgs, redirectTo?: string) {
  const auth = await getAuth(args);
  
  if (!auth.userId) {
    const url = new URL(args.request.url);
    const loginUrl = new URL('/sign-in', url.origin);
    
    // Preserve the intended destination for post-login redirect
    if (redirectTo || url.pathname !== '/') {
      loginUrl.searchParams.set('redirectTo', redirectTo || url.pathname);
    }
    
    throw redirect(loginUrl.toString());
  }
  
  return auth;
}

/**
 * Get userId or null - use when auth is optional
 */
export async function getOptionalUserId(args: LoaderFunctionArgs | ActionFunctionArgs): Promise<string | null> {
  const auth = await getAuth(args);
  return auth.userId || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(args: LoaderFunctionArgs | ActionFunctionArgs): Promise<boolean> {
  const auth = await getAuth(args);
  return !!auth.userId;
}

/**
 * Helper type for auth-protected loaders
 */
export type AuthenticatedLoaderArgs = LoaderFunctionArgs & {
  userId: string;
};

/**
 * Helper type for auth-protected actions
 */
export type AuthenticatedActionArgs = ActionFunctionArgs & {
  userId: string;
};

