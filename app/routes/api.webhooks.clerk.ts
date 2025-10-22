/**
 * Clerk Webhook Handler
 * Syncs user events from Clerk to our D1 database
 * 
 * Security: Verifies webhook signatures using Svix to prevent unauthorized requests
 */

import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { Webhook } from 'svix';

export async function action({ request, context }: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { createUser, updateUser, deleteUser } = await import('~/lib/.server/users/sync');

  // Verify webhook signature (critical for security)
  const webhookSecret = context.cloudflare.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get Svix headers for signature verification
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing Svix headers in webhook request');
    return new Response('Missing webhook signature headers', { status: 400 });
  }

  // Get the raw body for signature verification
  const payloadString = await request.text();

  // Verify the webhook signature
  const wh = new Webhook(webhookSecret);
  let evt: any;

  try {
    evt = wh.verify(payloadString, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid webhook signature', { status: 400 });
  }

  // Extract event type and data from verified payload
  const { type, data } = evt;

  const db = getDatabase(context.cloudflare.env);

  try {
    switch (type) {
      case 'user.created': {
        await createUser(db, data);
        break;
      }

      case 'user.updated': {
        await updateUser(db, data);
        break;
      }

      case 'user.deleted': {
        await deleteUser(db, data.id);
        break;
      }

      default:
        // Unhandled webhook event
        break;
    }

    return new Response(JSON.stringify({ success: true }), {
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

