import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export async function action(args: ActionFunctionArgs) {
  const { params, context } = args;
  const { projectId } = params;
  
  if (!projectId) {
    throw new Response('Project ID is required', { status: 400 });
  }

  // Import server-only modules inside the function
  const { getOptionalUserId } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, queryFirst } = await import('~/lib/.server/db/client');

  const userId = await getOptionalUserId(args);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = getDatabase(context.cloudflare.env);
  const r2Bucket = context.cloudflare.env.R2_BUCKET;
  if (!r2Bucket) {
    console.error('R2_BUCKET not configured in environment');
    throw new Response('Storage not configured', { status: 500 });
  }
  
  try {
    // Check if project exists, belongs to user, and is public
    const project = await queryFirst(
      db,
      'SELECT id, visibility FROM projects WHERE id = ? AND user_id = ?',
      projectId,
      userId
    );

    if (!project) {
      throw new Response('Project not found', { status: 404 });
    }

    if (project.visibility !== 'public') {
      throw new Response('Project must be public to republish', { status: 400 });
    }

    // Import snapshot service
    const { createProjectSnapshot } = await import('~/lib/.server/snapshots/snapshot-service');
    
    console.log(`Creating snapshot for project ${projectId} by user ${userId}`);
    
    // Create a new snapshot (this will increment the version)
    const snapshot = await createProjectSnapshot(
      db,
      projectId,
      userId,
      r2Bucket
    );
    
    console.log(`Successfully created snapshot ${snapshot.id} for project ${projectId}`);
    
    return json({ 
      success: true, 
      snapshot: {
        id: snapshot.id,
        version: snapshot.version,
        fileCount: snapshot.fileCount,
        totalSize: snapshot.totalSize,
        createdAt: snapshot.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error republishing project:', error);
    
    // If it's already a Response, re-throw it
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response('Internal Server Error', { status: 500 });
  }
}