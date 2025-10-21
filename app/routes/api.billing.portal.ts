/**
 * Stripe Billing Portal API
 * Creates portal sessions for subscription management
 */

import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import { requireAuth } from '~/lib/.server/auth/clerk.server';
import { getDatabase } from '~/lib/.server/db/client';
import { getUserProfile } from '~/lib/.server/users/queries';
import { createPortalSession } from '~/lib/.server/stripe/portal';

export async function action(args: ActionFunctionArgs) {
  const { request, context } = args;
  
  // Require authentication
  const auth = await requireAuth(args);
  const db = getDatabase(context.cloudflare.env);

  // Get user profile
  const userProfile = await getUserProfile(db, auth.userId!);
  if (!userProfile) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  // Check if user has a Stripe customer ID
  if (!userProfile.stripe_customer_id) {
    return json({ error: 'No Stripe customer found' }, { status: 400 });
  }

  try {
    // Get base URL for return URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Create portal session
    const session = await createPortalSession(
      userProfile.stripe_customer_id,
      `${baseUrl}/settings/billing`,
      context.cloudflare.env
    );

    return json({ url: session.url });
  } catch (error) {
    console.error('Portal session creation failed:', error);
    return json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}

