/**
 * Stripe Billing Portal API
 * Creates portal sessions for subscription management
 */

import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

export async function action(args: ActionFunctionArgs) {
  try {
    // Import server-only modules inside the function
    const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
    const { getDatabase } = await import('~/lib/.server/db/client');
    const { getUserProfile } = await import('~/lib/.server/users/queries');
    const { createPortalSession } = await import('~/lib/.server/stripe/portal');

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
      return json({ error: 'No Stripe customer found. Please contact support.' }, { status: 400 });
    }

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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}

