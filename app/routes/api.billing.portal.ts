/**
 * Stripe Billing Portal API
 * Creates portal sessions for subscription management
 */

import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

export async function action(args: ActionFunctionArgs) {
  console.log('🔍 BILLING PORTAL API CALLED');
  
  try {
    // Import server-only modules inside the function
    const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
    const { getDatabase } = await import('~/lib/.server/db/client');
    const { getUserProfile } = await import('~/lib/.server/users/queries');
    const { createPortalSession } = await import('~/lib/.server/stripe/portal');

    const { request, context } = args;
    
    console.log('🔍 BILLING PORTAL DEBUG:');
    console.log('Has STRIPE_SECRET_KEY:', !!context.cloudflare.env.STRIPE_SECRET_KEY);
    console.log('Stripe key prefix:', context.cloudflare.env.STRIPE_SECRET_KEY ? context.cloudflare.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'undefined');
    
    // Require authentication
    console.log('🔍 Requiring authentication...');
    const auth = await requireAuth(args);
    console.log('🔍 Auth successful, userId:', auth.userId);
    
    const db = getDatabase(context.cloudflare.env);
    console.log('🔍 Database connection established');

    // Get user profile
    console.log('🔍 Fetching user profile...');
    const userProfile = await getUserProfile(db, auth.userId!);
    if (!userProfile) {
      console.error('❌ User not found:', auth.userId);
      return json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔍 User profile found:', {
      userId: userProfile.id,
      email: userProfile.email,
      hasStripeCustomerId: !!userProfile.stripe_customer_id,
      stripeCustomerId: userProfile.stripe_customer_id ? userProfile.stripe_customer_id.substring(0, 10) + '...' : 'undefined'
    });

    // Check if user has a Stripe customer ID
    if (!userProfile.stripe_customer_id) {
      console.error('❌ No Stripe customer ID for user:', auth.userId);
      return json({ error: 'No Stripe customer found' }, { status: 400 });
    }

    try {
      // Get base URL for return URL
      const url = new URL(request.url);
      const baseUrl = `${url.protocol}//${url.host}`;

      console.log('🔍 Creating portal session for customer:', userProfile.stripe_customer_id);
      console.log('🔍 Return URL:', `${baseUrl}/settings/billing`);

      // Create portal session
      const session = await createPortalSession(
        userProfile.stripe_customer_id,
        `${baseUrl}/settings/billing`,
        context.cloudflare.env
      );

      console.log('✅ Portal session created successfully');
      return json({ url: session.url });
    } catch (error) {
      console.error('❌ Portal session creation failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return json({ error: 'Failed to create portal session' }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ BILLING PORTAL API ERROR:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

