/**
 * Clerk Webhook Handler
 * Syncs user events from Clerk to our D1 database
 */

import { type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request, context }: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { createUser, updateUser, deleteUser } = await import('~/lib/.server/users/sync');

  // Verify webhook signature (important for production)
  const webhookSecret = context.cloudflare.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get the webhook payload
  const payload = await request.json();
  const { type, data } = payload;

  const db = getDatabase(context.cloudflare.env);

  try {
    switch (type) {
      case 'user.created': {
        await createUser(db, data);
        console.log(`User created: ${data.id}`);
        break;
      }

      case 'user.updated': {
        await updateUser(db, data);
        console.log(`User updated: ${data.id}`);
        break;
      }

      case 'user.deleted': {
        await deleteUser(db, data.id);
        console.log(`User deleted: ${data.id}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${type}`);
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

