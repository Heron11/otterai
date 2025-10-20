/**
 * Cancel Subscription API
 * Directly calls Stripe API to cancel, then updates D1
 */

import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import { requireAuth } from '~/lib/.server/auth/clerk.server';
import { getDatabase } from '~/lib/.server/db/client';
import { getSubscription, updateSubscription } from '~/lib/.server/subscriptions/queries';
import { getStripeClient } from '~/lib/.server/stripe/client';

export async function action(args: ActionFunctionArgs) {
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

    console.log(`Subscription ${subscription.id} set to cancel at period end`);

    return json({
      success: true,
      cancelAt: new Date(stripeSubscription.current_period_end * 1000),
    });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}

