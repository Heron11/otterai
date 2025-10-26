import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getOptionalUserId } from '~/lib/.server/auth/clerk.server';
import { getDatabase, queryFirst, execute } from '~/lib/.server/db/client';

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

      // Generate a new snapshot ID and version
      const snapshotId = `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const snapshotVersion = Date.now();

      // Update the project with new snapshot info
      await execute(
        db,
        'UPDATE projects SET snapshot_id = ?, snapshot_version = ?, snapshot_created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        snapshotId,
        snapshotVersion,
        projectId,
        userId
      );

      return json({ 
        success: true, 
        snapshot: {
          id: snapshotId,
          version: snapshotVersion,
          createdAt: new Date().toISOString()
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