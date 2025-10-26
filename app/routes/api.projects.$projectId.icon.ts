import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getOptionalUserId } from '~/lib/.server/auth/clerk.server';
import { getDatabase, queryFirst, execute } from '~/lib/.server/db/client';

export async function action(args: ActionFunctionArgs) {
  const { params, request, context } = args;
  const { projectId } = params;
  
  if (!projectId) {
    throw new Response('Project ID is required', { status: 400 });
  }

  const userId = await getOptionalUserId(args);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const method = request.method;
  const db = getDatabase(context.cloudflare.env);

  // POST - Upload project icon
  if (method === 'POST') {
    try {
      // Basic rate limiting: Check recent uploads
      const recentUploads = await queryFirst(
        db,
        'SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND updated_at > datetime("now", "-1 minute") AND icon_url IS NOT NULL',
        userId
      );

      if (recentUploads && recentUploads.count > 5) {
        throw new Response('Rate limit exceeded. Please wait before uploading another icon', { status: 429 });
      }

      // Check if project exists and belongs to user
      const project = await queryFirst(
        db,
        'SELECT id FROM projects WHERE id = ? AND user_id = ?',
        projectId,
        userId
      );

      if (!project) {
        throw new Response('Project not found', { status: 404 });
      }

      const formData = await request.formData();
      const iconFile = formData.get('icon') as File;

      if (!iconFile) {
        throw new Response('No icon file provided', { status: 400 });
      }

      // Validate file type with allowed types
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!ALLOWED_TYPES.includes(iconFile.type)) {
        throw new Response('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed', { status: 400 });
      }

      // Validate file size (max 2MB)
      if (iconFile.size > 2 * 1024 * 1024) {
        throw new Response('Image must be smaller than 2MB', { status: 400 });
      }

      // Basic file signature validation
      const arrayBuffer = await iconFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Check for common image file signatures
      const isValidImage = (
        // JPEG: FF D8 FF
        (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) ||
        // PNG: 89 50 4E 47
        (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) ||
        // GIF: 47 49 46 38
        (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) ||
        // WebP: 52 49 46 46
        (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46)
      );

      if (!isValidImage) {
        throw new Response('Invalid image file format', { status: 400 });
      }

      // Convert to base64 for storage (simple approach for now)
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const iconUrl = `data:${iconFile.type};base64,${base64}`;

      // Update project with icon URL
      await execute(
        db,
        'UPDATE projects SET icon_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        iconUrl,
        projectId,
        userId
      );

      return json({ 
        success: true, 
        iconUrl 
      });
    } catch (error) {
      console.error('Error uploading icon:', error);
      
      // If it's already a Response, re-throw it
      if (error instanceof Response) {
        throw error;
      }
      
      throw new Response('Internal Server Error', { status: 500 });
    }
  }

  throw new Response('Method not allowed', { status: 405 });
}
