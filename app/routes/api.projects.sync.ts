/**
 * API Route: Project Sync
 * Auto-sync project after AI completes generation
 * Creates or updates project + saves files to R2
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { requireAuth } from '~/lib/.server/auth/clerk.server';
import { getDatabase, queryFirst, execute } from '~/lib/.server/db/client';
import { createProject } from '~/lib/.server/projects/queries';
import { saveFiles, getFileKey } from '~/lib/.server/storage/r2';

interface SyncRequest {
  chatId: string;
  projectName: string;
  files: Record<string, string>;
}

/**
 * POST /api/projects/sync
 * Create or update project and save files
 */
export async function action(args: ActionFunctionArgs) {
  const { request, context } = args;
  const auth = await requireAuth(args);
  const db = getDatabase(context.cloudflare.env);
  const bucket = context.cloudflare.env.R2_BUCKET;

  const { chatId, projectName, files } = await request.json<SyncRequest>();

  if (!chatId || !projectName) {
    return json({ error: 'chatId and projectName are required' }, { status: 400 });
  }

  try {
    // 1. Find existing project by chatId
    let project = await queryFirst<{ id: string }>(
      db,
      'SELECT id FROM projects WHERE chat_id = ? AND user_id = ?',
      chatId,
      auth.userId
    );

    let projectId: string;

    if (!project) {
      // 2. Create new project
      projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const created = await createProject(db, auth.userId!, {
        id: projectId,
        name: projectName,
        chatId: chatId,
        description: `Created from chat session`,
      });

      if (!created) {
        return json({ error: 'Failed to create project' }, { status: 500 });
      }
    } else {
      projectId = project.id;
    }

    // 3. Save files to R2 (if any)
    if (files && Object.keys(files).length > 0) {
      const result = await saveFiles(bucket, projectId, auth.userId!, files);

      if (!result.success) {
        console.error('Failed to save some files:', result);
      }

      // 4. Update project metadata
      const totalSize = Object.values(files).reduce(
        (sum, content) => sum + new Blob([content]).size,
        0
      );

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

      // 5. Index each file in D1
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
    }

    return json({
      success: true,
      projectId,
      fileCount: Object.keys(files || {}).length,
    });
  } catch (error) {
    console.error('Project sync error:', error);
    return json(
      { error: 'Failed to sync project', details: String(error) },
      { status: 500 }
    );
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


