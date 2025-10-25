/**
 * API Route: Project Management
 * DELETE: Delete a project and all its files
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export async function action(args: ActionFunctionArgs) {
  const { request, params, context } = args;
  
  if (request.method !== 'DELETE') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  // Import server-only modules inside the function
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, queryFirst, execute } = await import('~/lib/.server/db/client');
  const { deleteProjectFiles } = await import('~/lib/.server/storage/r2');

  const auth = await requireAuth(args);
  const { projectId } = params;

  if (!projectId) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  const bucket = context.cloudflare.env.R2_BUCKET;

  try {
    // 1. Verify user owns this project
    const project = await queryFirst<{ user_id: string }>(
      db,
      'SELECT user_id FROM projects WHERE id = ? AND user_id = ?',
      projectId,
      auth.userId
    );

    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    // 2. Delete all files from R2
    console.log(`Deleting files from R2 for project: ${projectId}`);
    await deleteProjectFiles(bucket, projectId);

    // 3. Delete project files metadata from D1
    console.log(`Deleting project files metadata for project: ${projectId}`);
    await execute(
      db,
      'DELETE FROM project_files WHERE project_id = ?',
      projectId
    );

    // 4. Mark project as deleted in D1
    console.log(`Marking project as deleted: ${projectId}`);
    const result = await execute(
      db,
      `UPDATE projects 
       SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND user_id = ?`,
      projectId,
      auth.userId
    );

    console.log(`Project deletion result:`, result);

    return json({
      success: true,
      projectId,
    });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return json(
      { error: 'Failed to delete project', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

