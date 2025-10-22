import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';

/**
 * API Route: Publish/Unpublish Project
 * 
 * POST /api/projects/:projectId/publish
 * 
 * Publishes a project by creating a public snapshot that auto-syncs on save.
 * Or unpublishes by setting the snapshot to private.
 */
export async function action({ request, params, context, ...args }: ActionFunctionArgs) {
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, execute, queryFirst } = await import('~/lib/.server/db/client');
  const { generateProjectId } = await import('~/lib/.server/projects/utils');
  const { copyProjectFiles } = await import('~/lib/.server/storage/r2');

  const auth = await requireAuth(args);
  const { projectId } = params;

  if (!projectId) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  const { action: publishAction } = await request.json<{ action: 'publish' | 'unpublish' }>();

  if (!publishAction || !['publish', 'unpublish'].includes(publishAction)) {
    return json({ error: 'Invalid action. Must be "publish" or "unpublish"' }, { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  const bucket = context.cloudflare.env.R2_BUCKET;

  // Look up source project by ID or chat ID
  let sourceProject = await queryFirst<{ 
    id: string; 
    user_id: string; 
    name: string;
    description: string;
    template_id: string;
    template_name: string;
    r2_path: string;
    chat_id: string;
    is_published: boolean;
    published_snapshot_id: string | null;
    is_snapshot: boolean;
  }>(
    db,
    'SELECT * FROM projects WHERE id = ? AND user_id = ?',
    projectId,
    auth.userId
  );

  // If not found by ID, try by chat ID
  if (!sourceProject) {
    sourceProject = await queryFirst<{ 
      id: string; 
      user_id: string; 
      name: string;
      description: string;
      template_id: string;
      template_name: string;
      r2_path: string;
      chat_id: string;
      is_published: boolean;
      published_snapshot_id: string | null;
      is_snapshot: boolean;
    }>(
      db,
      'SELECT * FROM projects WHERE chat_id = ? AND user_id = ?',
      projectId,
      auth.userId
    );
  }

  if (!sourceProject) {
    return json({ error: 'Project not found or access denied' }, { status: 404 });
  }

  // Prevent publishing snapshots
  if (sourceProject.is_snapshot) {
    return json({ error: 'Cannot publish a snapshot project' }, { status: 400 });
  }

  const actualProjectId = sourceProject.id;

  try {
    if (publishAction === 'publish') {
      // ===== PUBLISH FLOW =====
      let snapshotId = sourceProject.published_snapshot_id;

      if (!snapshotId) {
        // Create new snapshot
        snapshotId = generateProjectId();
        
        await execute(
          db,
          `INSERT INTO projects (
            id, user_id, name, description, template_id, template_name, 
            chat_id, status, visibility, is_snapshot, source_project_id,
            created_at, updated_at, view_count, clone_count, is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'public', true, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 0, false)`,
          snapshotId,
          auth.userId,
          `${sourceProject.name} (Public)`,
          sourceProject.description || `Public version of ${sourceProject.name}`,
          sourceProject.template_id,
          sourceProject.template_name,
          snapshotId, // Use snapshot ID as chat ID
          actualProjectId // Link back to source
        );

        // Copy files from source to snapshot
        const sourceR2Path = sourceProject.r2_path || `projects/${actualProjectId}/`;
        const snapshotR2Path = `projects/${snapshotId}/`;
        
        await copyProjectFiles(bucket, sourceR2Path, snapshotR2Path);

        // Update source project with snapshot reference
        await execute(
          db,
          'UPDATE projects SET is_published = true, published_snapshot_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          snapshotId,
          actualProjectId
        );
      } else {
        // Snapshot already exists, just update visibility and sync files
        await execute(
          db,
          'UPDATE projects SET visibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          'public',
          snapshotId
        );

        // Re-sync files to ensure snapshot is up-to-date
        const sourceR2Path = sourceProject.r2_path || `projects/${actualProjectId}/`;
        const snapshotR2Path = `projects/${snapshotId}/`;
        
        await copyProjectFiles(bucket, sourceR2Path, snapshotR2Path);

        // Update source project
        await execute(
          db,
          'UPDATE projects SET is_published = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          actualProjectId
        );
      }

      return json({ 
        success: true, 
        action: 'publish',
        isPublished: true,
        snapshotId,
        message: 'Project published successfully. Updates will sync automatically when you save.'
      });

    } else {
      // ===== UNPUBLISH FLOW =====
      if (!sourceProject.published_snapshot_id) {
        return json({ 
          success: true, 
          action: 'unpublish',
          isPublished: false,
          message: 'Project is already unpublished'
        });
      }

      // Set snapshot to private (keep it for re-publishing)
      await execute(
        db,
        'UPDATE projects SET visibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        'private',
        sourceProject.published_snapshot_id
      );

      // Update source project
      await execute(
        db,
        'UPDATE projects SET is_published = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        actualProjectId
      );

      return json({ 
        success: true, 
        action: 'unpublish',
        isPublished: false,
        message: 'Project unpublished successfully'
      });
    }
  } catch (error) {
    console.error('Publish/unpublish error:', error);
    return json({ 
      error: 'Failed to update publish status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

