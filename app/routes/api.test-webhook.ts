/**
 * Test webhook endpoint to verify Stripe configuration
 * This is a temporary route for debugging
 */

import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

export async function action(args: ActionFunctionArgs) {
  const { request, context } = args;
  
  const webhookSecret = context.cloudflare.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = context.cloudflare.env.STRIPE_SECRET_KEY;
  
  return json({
    hasWebhookSecret: !!webhookSecret,
    hasStripeSecret: !!stripeSecretKey,
    webhookSecretPrefix: webhookSecret ? webhookSecret.substring(0, 10) + '...' : 'undefined',
    stripeSecretPrefix: stripeSecretKey ? stripeSecretKey.substring(0, 10) + '...' : 'undefined',
    environment: process.env.NODE_ENV,
  });
}
