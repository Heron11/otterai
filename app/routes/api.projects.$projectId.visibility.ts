/**
 * Update Project Visibility
 * PATCH /api/projects/:projectId/visibility
 */

import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

export async function action({ request, params, context, ...args }: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, execute, queryFirst } = await import('~/lib/.server/db/client');

  const auth = await requireAuth(args);
  const { projectId } = params;

  if (!projectId) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  const { visibility } = await request.json<{ visibility: 'private' | 'public' }>();

  if (!visibility || !['private', 'public'].includes(visibility)) {
    return json({ error: 'Invalid visibility value. Must be "private" or "public"' }, { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);

  // Look up project by ID or chat ID (for backward compatibility)
  let project = await queryFirst<{ id: string; user_id: string }>(
    db,
    'SELECT id, user_id FROM projects WHERE id = ? AND user_id = ?',
    projectId,
    auth.userId
  );

  // If not found by ID, try by chat ID
  if (!project) {
    project = await queryFirst<{ id: string; user_id: string }>(
      db,
      'SELECT id, user_id FROM projects WHERE chat_id = ? AND user_id = ?',
      projectId,
      auth.userId
    );
  }

  if (!project) {
    return json({ error: 'Project not found or access denied' }, { status: 404 });
  }

  const actualProjectId = project.id;

  // Update visibility
  try {
    const result = await execute(
      db,
      'UPDATE projects SET visibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      visibility,
      actualProjectId
    );

    if (!result.success) {
      console.error('Database update failed:', result);
      return json({ error: 'Failed to update visibility in database' }, { status: 500 });
    }
  } catch (error) {
    console.error('Visibility update error:', error);
    return json({ 
      error: 'Database error while updating visibility',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }

  return json({ 
    success: true, 
    visibility,
    message: `Project is now ${visibility}`
  });
}
