/**
 * Reactivate Subscription API
 * Directly calls Stripe API to reactivate, then updates D1
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
      return json({ error: 'No subscription found' }, { status: 404 });
    }

    if (!subscription.cancelAtPeriodEnd) {
      return json({ error: 'Subscription is not scheduled for cancellation' }, { status: 400 });
    }

    // Reactivate subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });

    // Update D1 to reflect reactivation
    await updateSubscription(db, subscription.id, {
      cancelAtPeriodEnd: false,
      status: stripeSubscription.status as any,
    });

    console.log(`Subscription ${subscription.id} reactivated`);

    return json({ success: true });
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);
    return json({ error: 'Failed to reactivate subscription' }, { status: 500 });
  }
}

