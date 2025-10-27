import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

/**
 * POST /api/projects/increment-view
 * Increment view count for a public template
 */
export async function action({ request, context }: ActionFunctionArgs) {
  // Import server-only modules inside the function
  const { getOptionalUserId } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase, execute, queryFirst } = await import('~/lib/.server/db/client');

  const { projectId } = await request.json();

  if (!projectId) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  const userId = await getOptionalUserId({ context, request });

  try {
    // Verify the project exists and is public
    const project = await queryFirst<any>(
      db,
      `SELECT id, visibility, status FROM projects 
       WHERE id = ? AND visibility = 'public' AND status = 'active'`,
      projectId
    );

    if (!project) {
      return json({ error: 'Template not found or not public' }, { status: 404 });
    }

    // Rate limiting: Check recent views by this user (if authenticated) or IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 'anonymous';
    const rateLimitKey = userId ? `user:${userId}` : `ip:${clientIP}`;
    
    const recentViews = await queryFirst<{ count: number }>(
      db,
      `SELECT COUNT(*) as count FROM project_views 
       WHERE (user_id = ? OR ip_address = ?) 
         AND project_id = ? 
         AND viewed_at > datetime('now', '-1 hour')`,
      userId || null,
      clientIP,
      projectId
    );

    // Allow max 10 views per hour per user/IP
    if (recentViews && recentViews.count >= 10) {
      return json({ success: true, message: 'View count rate limited' });
    }

    // Record this view
    await execute(
      db,
      `INSERT INTO project_views (project_id, user_id, ip_address, viewed_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      projectId,
      userId,
      clientIP
    );

    // Increment view count
    await execute(
      db,
      'UPDATE projects SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      projectId
    );

    return json({ 
      success: true, 
      message: 'View count incremented',
      projectId 
    });

  } catch (error) {
    console.error('Error incrementing view count:', error);
    return json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}

