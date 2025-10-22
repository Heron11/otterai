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
export async function loader(loaderArgs: LoaderFunctionArgs) {
  const { params, context, request } = loaderArgs;
  // Import server-only modules inside the function
  const { getOptionalUserId } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { checkProjectAccess, logProjectAccess } = await import('~/lib/.server/projects/access-control');
  const { getProjectFiles } = await import('~/lib/.server/storage/r2');

  const userId = await getOptionalUserId(loaderArgs);
  const { projectId } = params;

  if (!projectId) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  const bucket = context.cloudflare.env.R2_BUCKET;

  // Check access permissions
  const access = await checkProjectAccess(db, projectId, userId || undefined);

  if (!access.canView) {
    return json({ error: 'Access denied' }, { status: 403 });
  }

  // Load files from R2
  const files = await getProjectFiles(bucket, projectId);

  // Log the view action
  await logProjectAccess(
    db,
    projectId,
    userId,
    'view',
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  return json({
    success: true,
    projectId,
    files,
    count: Object.keys(files).length,
    access: {
      canEdit: access.canEdit,
      canClone: access.canClone,
      isOwner: access.isOwner,
      isCloned: access.isCloned,
      clonedProjectId: access.clonedProjectId,
      accessType: access.accessType
    }
  });
}

/**
 * POST /api/projects/:projectId/files
 * Save/update files for a project
 */
export async function action(actionArgs: ActionFunctionArgs) {
  const { request, params, context } = actionArgs;
  // Import server-only modules inside the function
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, queryFirst, execute } = await import('~/lib/.server/db/client');
  const { checkProjectAccess, logProjectAccess } = await import('~/lib/.server/projects/access-control');
  const { saveFiles, copyProjectFiles } = await import('~/lib/.server/storage/r2');

  const auth = await requireAuth(actionArgs);
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

  // Check edit permissions
  const access = await checkProjectAccess(db, projectId, auth.userId);

  if (!access.canEdit) {
    return json({ 
      error: 'Edit access denied. Clone the project to make changes.',
      code: 'EDIT_ACCESS_DENIED',
      canClone: access.canClone
    }, { status: 403 });
  }

  // Save files to R2
  const result = await saveFiles(bucket, projectId, auth.userId!, files);

  if (!result.success) {
    return json(
      { error: 'Failed to save some files', ...result },
      { status: 500 }
    );
  }

  // Log the edit action
  await logProjectAccess(
    db,
    projectId,
    auth.userId,
    'edit',
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  // ===== AUTO-SYNC TO PUBLISHED SNAPSHOT =====
  // If this project is published, sync changes to the public snapshot
  const projectInfo = await queryFirst<{ 
    is_published: boolean; 
    published_snapshot_id: string | null;
    r2_path: string;
  }>(
    db,
    'SELECT is_published, published_snapshot_id, r2_path FROM projects WHERE id = ?',
    projectId
  );

  if (projectInfo?.is_published && projectInfo.published_snapshot_id) {
    try {
      // Copy updated files to snapshot
      const sourceR2Path = projectInfo.r2_path || `projects/${projectId}/`;
      const snapshotR2Path = `projects/${projectInfo.published_snapshot_id}/`;
      
      await copyProjectFiles(bucket, sourceR2Path, snapshotR2Path);
      
      // Update snapshot's updated_at timestamp
      await execute(
        db,
        'UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        projectInfo.published_snapshot_id
      );
      
      console.log(`✅ Auto-synced to published snapshot: ${projectInfo.published_snapshot_id}`);
    } catch (syncError) {
      console.error('Failed to sync to published snapshot:', syncError);
      // Don't fail the save if sync fails, just log it
    }
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

  // Index each file in D1 (if project_files table exists)
  try {
    for (const [filePath, content] of Object.entries(files)) {
      const fileSize = new Blob([content]).size;
      const r2Key = `projects/${projectId}/${filePath.startsWith('/') ? filePath.slice(1) : filePath}`;

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
  } catch (fileIndexError) {
    // Table might not exist yet, ignore
    console.log('File indexing skipped:', fileIndexError);
  }

  return json({
    success: true,
    projectId,
    saved: result.saved,
    failed: result.failed,
    totalSize,
    synced: projectInfo?.is_published ? true : false,
  });
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


