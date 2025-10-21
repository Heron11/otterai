interface Env {
  ANTHROPIC_API_KEY: string;
  
  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SECRET: string;
  
  // Stripe Payment
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  
  // Cloudflare D1 Database
  DB: D1Database;
  
  // Cloudflare R2 Object Storage
  R2_BUCKET: R2Bucket;
}

// Import Cloudflare Workers types
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
