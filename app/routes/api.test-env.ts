/**
 * Test Environment Variables
 * Simple endpoint to test if environment variables are accessible
 */

import { type LoaderFunctionArgs, json } from '@remix-run/cloudflare';

export async function loader({ context }: LoaderFunctionArgs) {
  console.log('🔍 TEST ENV ENDPOINT CALLED');
  
  try {
    const env = context.cloudflare.env;
    
    const envStatus = {
      hasStripeSecretKey: !!env.STRIPE_SECRET_KEY,
      stripeSecretKeyPrefix: env.STRIPE_SECRET_KEY ? env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'undefined',
      hasStripeWebhookSecret: !!env.STRIPE_WEBHOOK_SECRET,
      stripeWebhookSecretPrefix: env.STRIPE_WEBHOOK_SECRET ? env.STRIPE_WEBHOOK_SECRET.substring(0, 10) + '...' : 'undefined',
      hasClerkPublishableKey: !!env.CLERK_PUBLISHABLE_KEY,
      hasClerkSecretKey: !!env.CLERK_SECRET_KEY,
      hasClerkWebhookSecret: !!env.CLERK_WEBHOOK_SECRET,
      hasAnthropicApiKey: !!env.ANTHROPIC_API_KEY,
      hasDatabase: !!env.DB,
      hasR2Bucket: !!env.R2_BUCKET,
    };
    
    console.log('🔍 Environment Status:', envStatus);
    
    return json({
      success: true,
      environment: envStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ TEST ENV ERROR:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
