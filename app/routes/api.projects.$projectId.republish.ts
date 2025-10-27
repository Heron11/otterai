import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getOptionalUserId } from '~/lib/.server/auth/clerk.server';
import { getDatabase, queryFirst } from '~/lib/.server/db/client';

export async function action(args: ActionFunctionArgs) {
  const { params, request, context } = args;
  const { projectId } = params;
  
  if (!projectId) {
    throw new Response('Project ID is required', { status: 400 });
  }

  const userId = await getOptionalUserId(args);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const method = request.method;
  const db = getDatabase(context.cloudflare.env);

  // POST - Create new snapshot for republishing
  if (method === 'POST') {
    try {
      // Check if project exists and belongs to user
      const project = await queryFirst(
        db,
        'SELECT id, name, visibility FROM projects WHERE id = ? AND user_id = ?',
        projectId,
        userId
      );

      if (!project) {
        throw new Response('Project not found', { status: 404 });
      }

      if (project.visibility !== 'public') {
        throw new Response('Project must be public to republish', { status: 400 });
      }

      // Create a fresh snapshot (copies files into snapshots/ and records them)
      const { createProjectSnapshot } = await import('~/lib/.server/snapshots/snapshot-service');
      const r2 = context.cloudflare.env.R2_BUCKET;
      if (!r2) {
        throw new Response('Storage not configured', { status: 500 });
      }

      const snapshot = await createProjectSnapshot(db, projectId, userId, r2);

      return json({ 
        success: true, 
        snapshot: {
          id: snapshot.id,
          version: snapshot.version,
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

  throw new Response('Method not allowed', { status: 405 });
}
