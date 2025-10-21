import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare?.env || {};
  
  return json({
    environment: process.env.NODE_ENV,
    hasCloudflareEnv: !!context.cloudflare?.env,
    envKeys: Object.keys(env),
    clerkPublishableKey: env.CLERK_PUBLISHABLE_KEY ? `${env.CLERK_PUBLISHABLE_KEY.substring(0, 10)}...` : 'MISSING',
    clerkSecretKey: env.CLERK_SECRET_KEY ? `${env.CLERK_SECRET_KEY.substring(0, 10)}...` : 'MISSING',
    clerkWebhookSecret: env.CLERK_WEBHOOK_SECRET ? `${env.CLERK_WEBHOOK_SECRET.substring(0, 10)}...` : 'MISSING',
    stripeSecretKey: env.STRIPE_SECRET_KEY ? `${env.STRIPE_SECRET_KEY.substring(0, 10)}...` : 'MISSING',
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET ? `${env.STRIPE_WEBHOOK_SECRET.substring(0, 10)}...` : 'MISSING',
    anthropicApiKey: env.ANTHROPIC_API_KEY ? `${env.ANTHROPIC_API_KEY.substring(0, 10)}...` : 'MISSING',
  });
}

export default function DebugEnv() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Debug</h1>
      <p>Check the network tab for the JSON response</p>
    </div>
  );
}
