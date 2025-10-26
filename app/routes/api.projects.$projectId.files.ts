/**
 * API Route: Project Files Management
 * GET: Load all files for a project
 * POST: Save/update files for a project
 * DELETE: Delete specific files
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

/**
 * GET /api/projects/:projectId/files
 * Load all files for a project from R2
 */
export async function loader({ params, context, ...args }: LoaderFunctionArgs) {
  try {
    // Import server-only modules inside the function
    const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
    const { getDatabase, queryFirst } = await import('~/lib/.server/db/client');
    const { getProjectFiles } = await import('~/lib/.server/storage/r2');

    const auth = await requireAuth({ ...args, params, context });
    const { projectId } = params;

    if (!projectId) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }

    const db = getDatabase(context.cloudflare.env);
    const bucket = context.cloudflare.env.R2_BUCKET;

    if (!bucket) {
      console.error('R2_BUCKET is not configured');
      return json({ error: 'Storage not configured' }, { status: 500 });
    }

    // Verify user owns this project
    const project = await queryFirst<{ user_id: string }>(
      db,
      'SELECT user_id FROM projects WHERE id = ? AND user_id = ?',
      projectId,
      auth.userId
    );

    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    // Load files from R2
    const files = await getProjectFiles(bucket, projectId);

    return json({
      success: true,
      projectId,
      files,
      count: Object.keys(files).length,
    });
  } catch (error) {
    console.error('Error loading project files:', error);
    return json({ 
      error: 'Failed to load project files'
    }, { status: 500 });
  }
}

/**
 * POST /api/projects/:projectId/files
 * Save/update files for a project
 */
export async function action({ request, params, context, ...args }: ActionFunctionArgs) {
  try {
    // Import server-only modules inside the function
    const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
    const { getDatabase, queryFirst, execute } = await import('~/lib/.server/db/client');
    const { saveFiles, getFileKey } = await import('~/lib/.server/storage/r2');

    const auth = await requireAuth({ ...args, request, params, context });
  const { projectId } = params;

  if (!projectId) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  const { files } = await request.json<{ files: Record<string, string> }>();

  if (!files || typeof files !== 'object') {
    return json({ error: 'Files object is required' }, { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  const bucket = context.cloudflare.env.R2_BUCKET;

  // Verify user owns this project
  const project = await queryFirst<{ user_id: string; id: string }>(
    db,
    'SELECT id, user_id FROM projects WHERE id = ? AND user_id = ?',
    projectId,
    auth.userId
  );

  if (!project) {
    return json({ error: 'Project not found' }, { status: 404 });
  }

  // Save files to R2
  const result = await saveFiles(bucket, projectId, auth.userId!, files);

  if (!result.success) {
    return json(
      { error: 'Failed to save some files', ...result },
      { status: 500 }
    );
  }

  // Update file index in D1
  const totalSize = Object.values(files).reduce(
    (sum, content) => sum + new Blob([content]).size,
    0
  );

  // Update project metadata
  await execute(
    db,
    `UPDATE projects 
     SET file_count = ?, 
         total_size = ?, 
         r2_path = ?,
         updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    Object.keys(files).length,
    totalSize,
    `projects/${projectId}/`,
    projectId
  );

  // Index each file in D1
  for (const [filePath, content] of Object.entries(files)) {
    const fileSize = new Blob([content]).size;
    const r2Key = getFileKey(projectId, filePath);

    await execute(
      db,
      `INSERT INTO project_files (project_id, user_id, file_path, r2_key, file_size, content_type, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(project_id, file_path) DO UPDATE SET
         file_size = excluded.file_size,
         r2_key = excluded.r2_key,
         updated_at = CURRENT_TIMESTAMP`,
      projectId,
      auth.userId,
      filePath,
      r2Key,
      fileSize,
      getContentType(filePath)
    );
  }

  return json({
    success: true,
    projectId,
    saved: result.saved,
    failed: result.failed,
    totalSize,
  });
  } catch (error) {
    console.error('Error saving project files:', error);
    return json({ 
      error: 'Failed to save project files'
    }, { status: 500 });
  }
}

/**
 * Get content type from file extension
 */
function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    ts: 'text/typescript',
    tsx: 'text/typescript',
    jsx: 'text/jsx',
    md: 'text/markdown',
  };
  return contentTypes[ext || ''] || 'text/plain';
}


