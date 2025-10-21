/**
 * Stripe Webhook Handler
 * Handles Stripe webhook events for subscription management
 * 
 * Events handled:
 * - checkout.session.completed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */

import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import type Stripe from 'stripe';
import type { UserTier } from '~/lib/types/platform/user';

export async function action({ request, context }: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { 
    getDatabase, 
    getStripeClient, 
    updateUserTier, 
    updateUserStripeCustomer, 
    createSubscription, 
    updateSubscription, 
    getSubscriptionById,
    STRIPE_CONFIG 
  } = await import('~/lib/.server');

  const webhookSecret = context.cloudflare.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature in webhook request');
    return new Response('No signature', { status: 400 });
  }

  const stripe = getStripeClient(context.cloudflare.env);
  const db = getDatabase(context.cloudflare.env);

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  console.log(`Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session, db, stripe);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription, db);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancel(subscription, db);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSuccess(invoice, db);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, db);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  db: any,
  stripe: Stripe
) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as UserTier;

  if (!userId || !tier) {
    console.error('Missing userId or tier in checkout session metadata');
    return;
  }

  // Get the subscription
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error('No subscription ID in checkout session');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = subscription.customer as string;

  // Update user with Stripe customer ID and subscription ID
  await updateUserStripeCustomer(db, userId, customerId, subscriptionId);

  // Update user tier
  await updateUserTier(db, userId, tier);

  // Create subscription record in D1
  await createSubscription(db, {
    id: subscriptionId,
    userId: userId,
    stripeCustomerId: customerId,
    stripePriceId: subscription.items.data[0].price.id,
    tier: tier,
    status: subscription.status as any,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  console.log(`Checkout completed for user ${userId}, tier: ${tier}`);
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  db: any
) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Determine tier from price ID
  const priceId = subscription.items.data[0].price.id;
  let tier: UserTier = 'free';
  
  if (priceId === STRIPE_CONFIG.prices.plus) {
    tier = 'plus';
  } else if (priceId === STRIPE_CONFIG.prices.pro) {
    tier = 'pro';
  }

  // Update subscription in D1
  await updateSubscription(db, subscription.id, {
    status: subscription.status as any,
    tier: tier,
    stripePriceId: priceId,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  // Update user tier if subscription is active
  if (subscription.status === 'active') {
    await updateUserTier(db, userId, tier);
  }

  console.log(`Subscription updated for user ${userId}, status: ${subscription.status}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancel(
  subscription: Stripe.Subscription,
  db: any
) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Update subscription status
  await updateSubscription(db, subscription.id, {
    status: 'canceled',
  });

  // Downgrade user to free tier
  await updateUserTier(db, userId, 'free');

  console.log(`Subscription canceled for user ${userId}`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(
  invoice: Stripe.Invoice,
  db: any
) {
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    return;
  }

  // Update subscription status to active
  await updateSubscription(db, subscriptionId, {
    status: 'active',
  });

  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  db: any
) {
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    return;
  }

  // Update subscription status to past_due
  await updateSubscription(db, subscriptionId, {
    status: 'past_due',
  });

  console.log(`Payment failed for subscription ${subscriptionId}`);
}

