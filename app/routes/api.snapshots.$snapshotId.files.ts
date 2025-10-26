/**
 * API endpoint to serve snapshot files
 * GET /api/snapshots/{snapshotId}/files
 */

import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getDatabase, queryFirst, queryAll } from '~/lib/.server/db/client';
import { getSnapshotFiles } from '~/lib/.server/snapshots/snapshot-service';

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { snapshotId } = params;
  
  if (!snapshotId) {
    throw new Response('Snapshot ID is required', { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  
  try {
    // Verify snapshot exists
    const snapshot = await queryFirst(
      db,
      `SELECT ps.*, p.visibility 
       FROM project_snapshots ps
       JOIN projects p ON ps.project_id = p.id
       WHERE ps.id = ? AND p.visibility = 'public'`,
      snapshotId
    );

    if (!snapshot) {
      throw new Response('Snapshot not found', { status: 404 });
    }

    // Get snapshot files
    const files = await getSnapshotFiles(db, snapshotId);
    
    // Read file contents from R2
    const fileContents: Record<string, string> = {};
    
    for (const file of files) {
      try {
        const object = await context.cloudflare.env.R2_BUCKET.get(file.r2Key);
        if (object) {
          const content = await object.text();
          fileContents[file.filePath] = content;
        }
      } catch (error) {
        console.error('Failed to read snapshot file from R2:', error);
      }
    }

    return new Response(JSON.stringify({
      snapshot: {
        id: snapshot.id,
        projectId: snapshot.project_id,
        name: snapshot.name,
        description: snapshot.description,
        version: snapshot.version,
        createdAt: snapshot.created_at,
      },
      files: fileContents
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching snapshot files:', error);
    throw new Response('Failed to load template files. Please try again.', { status: 500 });
  }
}
