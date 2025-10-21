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
      console.error('User not found:', auth.userId);
      return json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User profile:', {
      userId: userProfile.id,
      email: userProfile.email,
      tier: userProfile.tier,
      hasStripeCustomerId: !!userProfile.stripe_customer_id,
      stripeCustomerId: userProfile.stripe_customer_id ? userProfile.stripe_customer_id.substring(0, 10) + '...' : 'undefined'
    });

    // Check if user has a Stripe customer ID
    if (!userProfile.stripe_customer_id) {
      console.error('No Stripe customer ID for user:', auth.userId);
      return json({ error: 'No Stripe customer found. Please contact support.' }, { status: 400 });
    }

    // Get base URL for return URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    console.log('Creating portal session for customer:', userProfile.stripe_customer_id);
    console.log('Return URL:', `${baseUrl}/settings/billing`);

    // Create portal session
    const session = await createPortalSession(
      userProfile.stripe_customer_id,
      `${baseUrl}/settings/billing`,
      context.cloudflare.env
    );

    console.log('Portal session created successfully:', session.url);
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

