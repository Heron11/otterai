import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { nanoid } from 'nanoid';

// Simple ID generator
function generateId() {
  return `proj_${nanoid()}`;
}

export async function action(args: ActionFunctionArgs) {
  const { request, context } = args;
  // Import server-only modules inside the function
  const { getOptionalUserId } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, queryFirst, execute, queryAll } = await import('~/lib/.server/db/client');
  
  // Ensure Clerk can read the session by passing the original args
  const userId = await getOptionalUserId(args);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json() as { sourceProjectId: string; newProjectName: string };
  const { sourceProjectId, newProjectName } = body;

  if (!sourceProjectId || !newProjectName) {
    throw new Response('Source project ID and new project name are required', { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  const r2Bucket = context.cloudflare.env.R2_BUCKET;
  if (!r2Bucket) {
    throw new Response('Storage not configured', { status: 500 });
  }
  
  try {
    // Rate limiting: Check recent clones by this user
    const isDevelopment = process.env.NODE_ENV === 'development' || context.cloudflare.env.ENVIRONMENT === 'development';
    const disableRateLimit = context.cloudflare.env.DISABLE_RATE_LIMIT === 'true';
    
    if (!disableRateLimit) {
      const maxClones = isDevelopment ? 10 : 3; // 10 clones per 5 minutes in dev, 3 in production
      const timeWindow = isDevelopment ? 1 : 5; // 1 minute window in dev, 5 minutes in production
      
      const recentClones = await queryFirst<{ count: number }>(
        db,
        `SELECT COUNT(*) as count FROM projects 
         WHERE user_id = ? AND created_at > datetime('now', '-${timeWindow} minutes')`,
        userId
      );

      if (recentClones && recentClones.count >= maxClones) {
        const timeMessage = isDevelopment ? '1 minute' : '5 minutes';
        throw new Response(`Rate limit exceeded. Please wait ${timeMessage} before cloning more templates.`, { 
          status: 429 
        });
      }
    }

    // Get the source project
    const sourceProject = await queryFirst<any>(
      db,
      `SELECT * FROM projects WHERE id = ? AND visibility = 'public' AND status = 'active'`,
      sourceProjectId
    );

    if (!sourceProject) {
      throw new Response('Template not found or not available', { status: 404 });
    }

    // Get the latest snapshot for the public project
    const snapshot = await queryFirst<any>(
      db,
      `SELECT ps.*, p.name as project_name, p.description as project_description
       FROM project_snapshots ps
       JOIN projects p ON ps.project_id = p.id
       WHERE p.id = ? AND p.visibility = 'public' AND p.status = 'active'
       ORDER BY ps.version DESC
       LIMIT 1`,
      sourceProjectId
    );

    if (!snapshot) {
      throw new Response('Template snapshot not found', { status: 404 });
    }

    // Get snapshot files
    const snapshotFiles = await queryAll<any>(
      db,
      `SELECT * FROM snapshot_files WHERE snapshot_id = ?`,
      snapshot.id
    );

    if (snapshotFiles.length === 0) {
      throw new Response('Template has no files to copy', { status: 404 });
    }

    console.log(`Cloning template ${sourceProjectId} with ${snapshotFiles.length} files from snapshot ${snapshot.id}`);
    console.log('Snapshot files:', snapshotFiles.map(f => ({ path: f.file_path, r2_key: f.r2_key })));

    // Create new project
    const newProjectId = generateId();
    const newR2Path = `projects/${newProjectId}`;
    const now = new Date().toISOString();

    await execute(
      db,
      `INSERT INTO projects (id, user_id, name, description, visibility, r2_path, created_at, updated_at, view_count, clone_count, status, file_count, total_size, template_id, template_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      newProjectId,
      userId,
      newProjectName,
      `Cloned from ${sourceProject.name}`,
      'private', // Cloned projects start as private
      newR2Path,
      now,
      now,
      0, // view_count
      0, // clone_count
      'active', // status
      snapshotFiles.length,
      snapshotFiles.reduce((sum, file) => sum + file.file_size, 0),
      sourceProjectId, // template_id
      snapshot.project_name // template_name
    );

    // Copy files from snapshot to new project in R2
    let copiedFiles = 0;
    for (const file of snapshotFiles) {
      try {
        // Read file from source project location
        const sourceObject = await r2Bucket.get(file.r2_key);
        if (!sourceObject) {
          console.warn('Source file not found in R2:', file.r2_key);
          continue;
        }

        // Normalize path (remove any leading slash) to ensure consistent keys
        const normalizedFilePath = file.file_path?.startsWith('/')
          ? file.file_path.slice(1)
          : file.file_path;

        // Write to new project location
        const newR2Key = `${newR2Path}/${normalizedFilePath}`;

        // Read the file body as an ArrayBuffer to avoid stream re-use issues
        const body = await sourceObject.arrayBuffer();

        await r2Bucket.put(newR2Key, body, {
          httpMetadata: {
            contentType: file.content_type || 'text/plain',
          },
        });

        // Create file record
        await execute(
          db,
          `INSERT INTO project_files (project_id, user_id, file_path, r2_key, file_size, content_type)
           VALUES (?, ?, ?, ?, ?, ?)`,
          newProjectId,
          userId,
          normalizedFilePath,
          newR2Key,
          file.file_size,
          file.content_type
        );

        copiedFiles++;
      } catch (error) {
        console.error('Failed to copy template file:', error);
      }
    }

    // Increment clone count on source project
    await execute(
      db,
      'UPDATE projects SET clone_count = clone_count + 1, updated_at = ? WHERE id = ?',
      now,
      sourceProjectId
    );

    return json({ 
      success: true, 
      project: { id: newProjectId, name: newProjectName, created_at: now },
      message: `Successfully cloned "${sourceProject.name}" with ${copiedFiles} files`
    });
  } catch (error) {
    console.error('Error cloning template:', error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response('Failed to clone template. Please try again.', { status: 500 });
  }
}
