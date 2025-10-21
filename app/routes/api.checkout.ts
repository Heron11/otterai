/**
 * Stripe Checkout API
 * Creates checkout sessions for subscription upgrades
 */

import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

export async function action(args: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { getUserProfile } = await import('~/lib/.server/users/queries');
  const { createCheckoutSession } = await import('~/lib/.server/stripe/checkout');
  const { getOrCreateCustomer } = await import('~/lib/.server/stripe/subscriptions');
  const { updateUserStripeCustomer } = await import('~/lib/.server/users/sync');

  const { request, context } = args;
  
  // Require authentication
  const auth = await requireAuth(args);
  const db = getDatabase(context.cloudflare.env);

  // Get request body
  const body = await request.json();
  const { tier } = body;

  if (!tier || (tier !== 'plus' && tier !== 'pro')) {
    return json({ error: 'Invalid tier' }, { status: 400 });
  }

  // Get user profile
  const userProfile = await getUserProfile(db, auth.userId!);
  if (!userProfile) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  // Check if user already has this tier or higher
  if (userProfile.tier === tier || (tier === 'plus' && userProfile.tier === 'pro')) {
    return json({ error: 'Already subscribed to this tier or higher' }, { status: 400 });
  }

  try {
    // Get or create Stripe customer
    let stripeCustomerId = userProfile.stripe_customer_id;
    
    if (!stripeCustomerId) {
      const customer = await getOrCreateCustomer(
        userProfile.email,
        userProfile.id,
        userProfile.name,
        context.cloudflare.env
      );
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await updateUserStripeCustomer(db, userProfile.id, stripeCustomerId);
    }

    // Get base URL for redirect URLs
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Create checkout session
    // Success URL redirects to our API handler which syncs data from Stripe
    const session = await createCheckoutSession(
      {
        userId: userProfile.id,
        userEmail: userProfile.email,
        tier: tier,
        stripeCustomerId: stripeCustomerId,
        successUrl: `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/pricing?checkout=cancelled`,
      },
      context.cloudflare.env
    );

    return json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

