/**
 * Cancel Subscription API
 * Directly calls Stripe API to cancel, then updates D1
 */

import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

export async function action(args: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { getSubscription, updateSubscription } = await import('~/lib/.server/subscriptions/queries');
  const { getStripeClient } = await import('~/lib/.server/stripe/client');

  const { context } = args;
  const auth = await requireAuth(args);
  const db = getDatabase(context.cloudflare.env);
  const stripe = getStripeClient(context.cloudflare.env);

  try {
    // Get user's subscription from D1
    const subscription = await getSubscription(db, auth.userId!);

    if (!subscription) {
      return json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel subscription in Stripe (cancel at period end)
    const stripeSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Update D1 to reflect cancellation
    await updateSubscription(db, subscription.id, {
      cancelAtPeriodEnd: true,
    });

    return json({
      success: true,
      cancelAt: new Date(stripeSubscription.current_period_end * 1000),
    });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}

