/**
 * Clone a public project
 * POST /api/projects/:projectId/clone
 */

import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';

export async function action({ request, params, context, ...args }: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, execute, queryFirst } = await import('~/lib/.server/db/client');
  const { checkProjectAccess, logProjectAccess } = await import('~/lib/.server/projects/access-control');
  const { copyProjectFiles } = await import('~/lib/.server/storage/r2');

  const auth = await requireAuth(args);
  const { projectId } = params;

  if (!projectId) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  const bucket = context.cloudflare.env.R2_BUCKET;

  // Check clone permissions
  const access = await checkProjectAccess(db, projectId, auth.userId);

  if (!access.canClone) {
    return json({ error: 'Cannot clone this project' }, { status: 403 });
  }

  // Check if user already has a clone
  if (access.isCloned) {
    const existingClone = await queryFirst<{ id: string }>(db,
      'SELECT id FROM projects WHERE user_id = ? AND cloned_from = ?',
      auth.userId,
      projectId
    );

    return json({ 
      success: true, 
      projectId: existingClone!.id,
      message: 'You already have a copy of this project',
      redirectUrl: `/chat/${existingClone!.id}`
    });
  }

  // Get source project
  const sourceProject = await queryFirst<{
    id: string;
    name: string;
    description: string;
    template_id: string;
    template_name: string;
    r2_path: string;
  }>(db,
    'SELECT id, name, description, template_id, template_name, r2_path FROM projects WHERE id = ?',
    projectId
  );

  if (!sourceProject) {
    return json({ error: 'Source project not found' }, { status: 404 });
  }

  // Generate new project ID
  const newProjectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create new project
  const result = await execute(db,
    `INSERT INTO projects (
      id, user_id, name, description, template_id, template_name, 
      chat_id, status, visibility, cloned_from, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'private', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    newProjectId,
    auth.userId,
    `${sourceProject.name} (Copy)`,
    `Cloned from ${sourceProject.name}`,
    sourceProject.template_id,
    sourceProject.template_name,
    newProjectId, // Use project ID as chat ID for cloned projects
    projectId // Track original project
  );

  if (!result.success) {
    return json({ error: 'Failed to create cloned project' }, { status: 500 });
  }

  try {
    // Copy files from R2
    await copyProjectFiles(
      bucket,
      sourceProject.r2_path,
      `projects/${newProjectId}/`
    );
  } catch (error) {
    console.error('Failed to copy project files:', error);
    // Clean up the project record if file copy fails
    await execute(db, 'DELETE FROM projects WHERE id = ?', newProjectId);
    return json({ error: 'Failed to copy project files' }, { status: 500 });
  }

  // Update clone count
  await execute(db,
    'UPDATE projects SET clone_count = clone_count + 1 WHERE id = ?',
    projectId
  );

  // Log the clone action
  await logProjectAccess(
    db,
    projectId,
    auth.userId,
    'clone',
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  return json({ 
    success: true, 
    projectId: newProjectId,
    redirectUrl: `/chat/${newProjectId}`
  });
}
