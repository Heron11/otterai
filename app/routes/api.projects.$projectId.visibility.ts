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

  const { visibility } = await request.json<{ visibility: 'private' | 'public' | 'unlisted' }>();

  if (!visibility || !['private', 'public', 'unlisted'].includes(visibility)) {
    return json({ error: 'Invalid visibility value' }, { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);

  // Verify user owns this project
  const project = await queryFirst<{ user_id: string }>(
    db,
    'SELECT user_id FROM projects WHERE id = ? AND user_id = ?',
    projectId,
    auth.userId
  );

  if (!project) {
    return json({ error: 'Project not found or access denied' }, { status: 404 });
  }

  // Update visibility
  const result = await execute(
    db,
    'UPDATE projects SET visibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    visibility,
    projectId
  );

  if (!result.success) {
    return json({ error: 'Failed to update visibility' }, { status: 500 });
  }

  return json({ 
    success: true, 
    visibility,
    message: `Project is now ${visibility}`
  });
}
