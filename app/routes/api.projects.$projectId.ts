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
      const body = await request.json() as { visibility?: string; name?: string; description?: string };
      const { visibility, name, description } = body;

      // Validate visibility if provided
      if (visibility && !['private', 'public', 'unlisted'].includes(visibility)) {
        throw new Response('Invalid visibility value', { status: 400 });
      }

      // Validate name if provided
      if (name && (typeof name !== 'string' || name.trim().length === 0)) {
        throw new Response('Invalid name value', { status: 400 });
      }

      // Validate description if provided
      if (description && typeof description !== 'string') {
        throw new Response('Invalid description value', { status: 400 });
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

      // Build dynamic update query based on provided fields
      const updateFields = [];
      const updateValues = [];

      if (visibility !== undefined) {
        updateFields.push('visibility = ?');
        updateValues.push(visibility);
      }

      if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name.trim());
      }

      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }

      // Add updated_at timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      // Add WHERE clause parameters
      updateValues.push(projectId, userId);

      // Handle special case: clear snapshot data if making private
      if (visibility === 'private') {
        updateFields.push('snapshot_id = NULL', 'snapshot_version = 1', 'snapshot_created_at = NULL');
      }

      // Execute the update
      await execute(
        db,
        `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
        ...updateValues
      );

      // If making project public for the FIRST TIME, create initial snapshot
      if (visibility === 'public' && existingProject.visibility !== 'public') {
        try {
          // Import snapshot service
          const { createProjectSnapshot } = await import('~/lib/.server/snapshots/snapshot-service');
          
          // Create the actual snapshot with all project files
          const snapshot = await createProjectSnapshot(
            db,
            projectId,
            userId,
            context.cloudflare.env.R2_BUCKET
          );
          
          return json({ 
            success: true, 
            visibility,
            snapshot: {
              id: snapshot.id,
              version: snapshot.version,
              createdAt: snapshot.createdAt.toISOString()
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

