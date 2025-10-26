import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export async function loader({ context }: LoaderFunctionArgs) {
  // Import server-only modules inside the function
  const { getDatabase, queryAll } = await import('~/lib/.server/db/client');
  
  const db = getDatabase(context.cloudflare.env);
  
  try {
    // Get public project snapshots for template browsing
    const publicSnapshots = await queryAll(
      db,
      `SELECT 
        ps.id as snapshot_id,
        ps.project_id,
        ps.name,
        ps.description,
        ps.template_id,
        ps.template_name,
        ps.file_count,
        ps.total_size,
        ps.version,
        ps.created_at,
        p.view_count,
        p.clone_count
       FROM project_snapshots ps
       JOIN projects p ON ps.project_id = p.id
       WHERE p.visibility = 'public' AND p.status = 'active'
       ORDER BY ps.created_at DESC 
       LIMIT 50`
    );

    // Get featured snapshots (most cloned)
    const featuredSnapshots = await queryAll(
      db,
      `SELECT 
        ps.id as snapshot_id,
        ps.project_id,
        ps.name,
        ps.description,
        ps.template_id,
        ps.template_name,
        ps.file_count,
        ps.total_size,
        ps.version,
        ps.created_at,
        p.view_count,
        p.clone_count
       FROM project_snapshots ps
       JOIN projects p ON ps.project_id = p.id
       WHERE p.visibility = 'public' AND p.status = 'active'
       ORDER BY p.clone_count DESC 
       LIMIT 6`
    );

    return json({
      publicProjects: publicSnapshots,
      featuredProjects: featuredSnapshots,
      total: publicSnapshots.length
    });
  } catch (error) {
    console.error('Error fetching public templates:', error);
    throw new Response('Internal Server Error', { status: 500 });
  }
}
