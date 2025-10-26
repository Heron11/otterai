import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { nanoid } from 'nanoid';

// Simple ID generator
function generateId() {
  return `proj_${nanoid()}`;
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { getOptionalUserId } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, queryFirst, execute, queryAll } = await import('~/lib/.server/db/client');
  const { getSnapshotFiles } = await import('~/lib/.server/snapshots/snapshot-service');
  
  const userId = await getOptionalUserId({ context });
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { sourceProjectId, newProjectName } = body;

  if (!sourceProjectId || !newProjectName) {
    throw new Response('Source project ID and new project name are required', { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  const r2Bucket = context.cloudflare.env.R2_BUCKET;
  
  try {
    // Rate limiting: Check recent clones by this user
    const recentClones = await queryFirst<{ count: number }>(
      db,
      `SELECT COUNT(*) as count FROM projects 
       WHERE user_id = ? AND created_at > datetime('now', '-5 minutes')`,
      userId
    );

    if (recentClones && recentClones.count >= 3) {
      throw new Response('Rate limit exceeded. Please wait a few minutes before cloning more templates.', { 
        status: 429 
      });
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
      throw new Response('Template not found or not available', { status: 404 });
    }

    // Get snapshot files
    const snapshotFiles = await getSnapshotFiles(db, snapshot.id);

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
      `Cloned from ${snapshot.project_name}`,
      'private', // Cloned projects start as private
      newR2Path,
      now,
      now,
      0, // view_count
      0, // clone_count
      'active', // status
      snapshotFiles.length,
      snapshot.total_size,
      sourceProjectId, // template_id
      snapshot.project_name // template_name
    );

    // Copy files from snapshot to new project in R2
    let copiedFiles = 0;
    for (const file of snapshotFiles) {
      try {
        // Read file from snapshot location
        const snapshotObject = await r2Bucket.get(file.r2Key);
        if (!snapshotObject) {
          console.warn('Snapshot file not found in R2');
          continue;
        }

        // Write to new project location
        const newR2Key = `${newR2Path}/${file.filePath}`;
        await r2Bucket.put(newR2Key, snapshotObject.body, {
          httpMetadata: {
            contentType: file.contentType || 'text/plain',
          },
        });

        // Create file record
        await execute(
          db,
          `INSERT INTO project_files (project_id, user_id, file_path, r2_key, file_size, content_type)
           VALUES (?, ?, ?, ?, ?, ?)`,
          newProjectId,
          userId,
          file.filePath,
          newR2Key,
          file.fileSize,
          file.contentType
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
      message: `Successfully cloned "${snapshot.project_name}" with ${copiedFiles} files`
    });
  } catch (error) {
    console.error('Error cloning template:', error);
    throw new Response('Failed to clone template. Please try again.', { status: 500 });
  }
}
