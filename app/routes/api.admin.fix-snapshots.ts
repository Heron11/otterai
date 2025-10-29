import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export async function action(args: ActionFunctionArgs) {
  const { context } = args;
  
  // Import server-only modules inside the function
  const { getOptionalUserId } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { ensurePublicProjectsHaveSnapshots } = await import('~/lib/.server/snapshots/snapshot-service');

  const userId = await getOptionalUserId(args);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // For now, allow any authenticated user to run this
  // In production, you might want to restrict this to admin users
  const db = getDatabase(context.cloudflare.env);
  const r2Bucket = context.cloudflare.env.R2_BUCKET;
  
  if (!r2Bucket) {
    throw new Response('Storage not configured', { status: 500 });
  }

  try {
    console.log(`User ${userId} is fixing missing snapshots for public projects`);
    
    const result = await ensurePublicProjectsHaveSnapshots(db, r2Bucket);
    
    return json({
      success: true,
      message: `Fixed ${result.fixed} projects, ${result.errors.length} errors`,
      fixed: result.fixed,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error fixing snapshots:', error);
    throw new Response('Internal Server Error', { status: 500 });
  }
}
