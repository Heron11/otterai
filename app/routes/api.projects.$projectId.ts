import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getOptionalUserId } from '~/lib/.server/auth/clerk.server';
import { getDatabase, queryFirst, execute } from '~/lib/.server/db/client';

export async function loader(args: LoaderFunctionArgs) {
  const { params, context } = args;
  const { projectId } = params;
  
  if (!projectId) {
    throw new Response('Project ID is required', { status: 400 });
  }

  const userId = await getOptionalUserId(args);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = getDatabase(context.cloudflare.env);
  
  try {
    const project = await queryFirst(
      db,
      'SELECT id, name, visibility, created_at, updated_at FROM projects WHERE id = ? AND user_id = ?',
      projectId,
      userId
    );

    if (!project) {
      throw new Response('Project not found', { status: 404 });
    }

    return json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Response('Internal Server Error', { status: 500 });
  }
}

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

  // PATCH - Update project visibility
  if (method === 'PATCH') {
    try {
      const body = await request.json();
      const { visibility } = body;

      if (!visibility || !['private', 'public', 'unlisted'].includes(visibility)) {
        throw new Response('Invalid visibility value', { status: 400 });
      }

      // Check if project exists and belongs to user
      const existingProject = await queryFirst(
        db,
        'SELECT id, visibility FROM projects WHERE id = ? AND user_id = ?',
        projectId,
        userId
      );

      if (!existingProject) {
        throw new Response('Project not found', { status: 404 });
      }

      // Update project visibility and clear snapshot data if making private
      if (visibility === 'private') {
        await execute(
          db,
          'UPDATE projects SET visibility = ?, snapshot_id = NULL, snapshot_version = 1, snapshot_created_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
          visibility,
          projectId,
          userId
        );
      } else {
        await execute(
          db,
          'UPDATE projects SET visibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
          visibility,
          projectId,
          userId
        );
      }

      // If making project public for the FIRST TIME, create initial snapshot
      if (visibility === 'public' && existingProject.visibility !== 'public') {
        try {
          // Generate a new snapshot ID and version
          const snapshotId = `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const snapshotVersion = Date.now();

          // Update the project with snapshot info
          await execute(
            db,
            'UPDATE projects SET snapshot_id = ?, snapshot_version = ?, snapshot_created_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            snapshotId,
            snapshotVersion,
            projectId,
            userId
          );
          
          return json({ 
            success: true, 
            visibility,
            snapshot: {
              id: snapshotId,
              version: snapshotVersion,
              createdAt: new Date().toISOString()
            }
          });
        } catch (error) {
          console.error('Failed to create snapshot:', error);
          // Still return success for visibility change, but log the error
          return json({ 
            success: true, 
            visibility,
            warning: 'Project made public but snapshot creation failed'
          });
        }
      }

      return json({ success: true, visibility });
    } catch (error) {
      console.error('Error updating project visibility:', error);
      
      // If it's already a Response, re-throw it
      if (error instanceof Response) {
        throw error;
      }
      
      throw new Response('Internal Server Error', { status: 500 });
    }
  }

  // DELETE - Delete project
  if (method === 'DELETE') {
    try {
      // Check if project exists and belongs to user
      const project = await queryFirst(
        db,
        'SELECT id FROM projects WHERE id = ? AND user_id = ?',
        projectId,
        userId
      );

      if (!project) {
        throw new Response('Project not found', { status: 404 });
      }

      // Soft delete by setting status to 'deleted'
      await execute(
        db,
        'UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        'deleted',
        projectId,
        userId
      );

      return json({ success: true });
    } catch (error) {
      console.error('Error deleting project:', error);
      
      // If it's already a Response, re-throw it
      if (error instanceof Response) {
        throw error;
      }
      
      throw new Response('Internal Server Error', { status: 500 });
    }
  }

  throw new Response('Method not allowed', { status: 405 });
}

