/**
 * API Route: Project Files by Chat ID
 * GET: Load all files for a project using chatId
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

/**
 * GET /api/project-files?chatId=xxx
 * Load all files for a project from R2 using chatId
 */
export async function loader(args: LoaderFunctionArgs) {
  // Import server-only modules inside the function
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { getProjectFiles } = await import('~/lib/.server/storage/r2');
  const { getProjectByChatId } = await import('~/lib/.server/projects/queries');

  const { request, context } = args;

  // Get chatId from URL params
  const url = new URL(request.url);
  const chatId = url.searchParams.get('chatId');

  if (!chatId) {
    return json({ error: 'Chat ID is required' }, { status: 400 });
  }

  try {
    const auth = await requireAuth(args);
    const db = getDatabase(context.cloudflare.env);
    const bucket = context.cloudflare.env.R2_BUCKET;

    // Find project by chatId
    const project = await getProjectByChatId(db, chatId, auth.userId!);

    if (!project) {
      return json({ error: 'Project not found for this chat' }, { status: 404 });
    }

    // Load files from R2
    const files = await getProjectFiles(bucket, project.id);

    console.log(`📁 Loaded ${Object.keys(files).length} files for project: ${project.name}`);

    return json({
      success: true,
      projectId: project.id,
      projectName: project.name,
      files,
      count: Object.keys(files).length,
    });
  } catch (error) {
    console.error('Failed to load project files:', error);
    return json(
      { 
        error: 'Failed to load project files', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
