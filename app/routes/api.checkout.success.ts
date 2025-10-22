/**
 * Checkout Success Handler
 * Called after Stripe Checkout completes
 * 
 * NOTE: This handler does NOT sync subscription data.
 * The webhook handler (api.webhooks.stripe.ts) is the source of truth
 * and handles all database writes via the checkout.session.completed event.
 * 
 * This handler only validates the session and redirects to billing.
 */

import { type LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Import server-only modules inside the function
  const { getStripeClient } = await import('~/lib/.server/stripe/client');

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    console.error('No session_id provided');
    return redirect('/pricing?error=no_session');
  }

  const stripe = getStripeClient(context.cloudflare.env);

  try {
    // Just verify the session is valid - webhook handles the actual sync
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== 'complete') {
      console.error('Session not complete:', session.status);
      return redirect('/pricing?error=incomplete');
    }

    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    if (!userId || !tier) {
      console.error('Missing userId or tier in session metadata');
      return redirect('/pricing?error=invalid_metadata');
    }

    // Redirect to billing page - webhook will have synced the data
    return redirect('/settings/billing?upgrade=success');
  } catch (error) {
    console.error('Failed to validate checkout session:', error);
    return redirect('/pricing?error=processing_failed');
  }
}

