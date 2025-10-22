/**
 * R2 Object Storage Service
 * Handles file storage and retrieval from Cloudflare R2
 */

import type { R2Bucket } from '@cloudflare/workers-types';

export interface FileMetadata {
  projectId: string;
  userId: string;
  filePath: string;
  contentType?: string;
  size?: number;
  lastModified?: string;
}

/**
 * Generate R2 key for a project file
 */
export function getFileKey(projectId: string, filePath: string): string {
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `projects/${projectId}/${cleanPath}`;
}

/**
 * Save a file to R2
 */
export async function saveFile(
  bucket: R2Bucket,
  projectId: string,
  userId: string,
  filePath: string,
  content: string | ArrayBuffer,
  contentType?: string
): Promise<boolean> {
  try {
    const key = getFileKey(projectId, filePath);
    
    await bucket.put(key, content, {
      httpMetadata: {
        contentType: contentType || getContentType(filePath),
      },
      customMetadata: {
        projectId,
        userId,
        filePath,
        uploadedAt: new Date().toISOString(),
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error saving file to R2:', error);
    return false;
  }
}

/**
 * Save multiple files to R2 in batch
 */
export async function saveFiles(
  bucket: R2Bucket,
  projectId: string,
  userId: string,
  files: Record<string, string>
): Promise<{ success: boolean; saved: number; failed: number }> {
  const results = await Promise.allSettled(
    Object.entries(files).map(([filePath, content]) =>
      saveFile(bucket, projectId, userId, filePath, content)
    )
  );
  
  const saved = results.filter((r) => r.status === 'fulfilled' && r.value).length;
  const failed = results.length - saved;
  
  return {
    success: failed === 0,
    saved,
    failed,
  };
}

/**
 * Get a file from R2
 */
export async function getFile(
  bucket: R2Bucket,
  projectId: string,
  filePath: string
): Promise<string | null> {
  try {
    const key = getFileKey(projectId, filePath);
    const object = await bucket.get(key);
    
    if (!object) {
      return null;
    }
    
    return await object.text();
  } catch (error) {
    console.error('Error getting file from R2:', error);
    return null;
  }
}

/**
 * Get all files for a project
 */
export async function getProjectFiles(
  bucket: R2Bucket,
  projectId: string
): Promise<Record<string, string>> {
  try {
    const prefix = `projects/${projectId}/`;
    const listed = await bucket.list({ prefix });
    
    const files: Record<string, string> = {};
    
    // Fetch all files in parallel
    await Promise.all(
      listed.objects.map(async (obj) => {
        const content = await bucket.get(obj.key);
        if (content) {
          // Extract file path by removing the prefix
          const filePath = obj.key.substring(prefix.length);
          files[filePath] = await content.text();
        }
      })
    );
    
    return files;
  } catch (error) {
    console.error('Error getting project files from R2:', error);
    return {};
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFile(
  bucket: R2Bucket,
  projectId: string,
  filePath: string
): Promise<boolean> {
  try {
    const key = getFileKey(projectId, filePath);
    await bucket.delete(key);
    return true;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    return false;
  }
}

/**
 * Delete all files for a project
 */
export async function deleteProjectFiles(
  bucket: R2Bucket,
  projectId: string
): Promise<{ success: boolean; deleted: number }> {
  try {
    const prefix = `projects/${projectId}/`;
    const listed = await bucket.list({ prefix });
    
    // Delete all files in parallel
    await Promise.all(
      listed.objects.map((obj) => bucket.delete(obj.key))
    );
    
    return {
      success: true,
      deleted: listed.objects.length,
    };
  } catch (error) {
    console.error('Error deleting project files from R2:', error);
    return {
      success: false,
      deleted: 0,
    };
  }
}

/**
 * List all files in a project
 */
export async function listProjectFiles(
  bucket: R2Bucket,
  projectId: string
): Promise<FileMetadata[]> {
  try {
    const prefix = `projects/${projectId}/`;
    const listed = await bucket.list({ prefix });
    
    return listed.objects.map((obj) => {
      const filePath = obj.key.substring(prefix.length);
      return {
        projectId,
        userId: obj.customMetadata?.userId || '',
        filePath,
        contentType: obj.httpMetadata?.contentType,
        size: obj.size,
        lastModified: obj.uploaded.toISOString(),
      };
    });
  } catch (error) {
    console.error('Error listing project files from R2:', error);
    return [];
  }
}

/**
 * Get content type from file extension
 */
function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  const contentTypes: Record<string, string> = {
    // Web files
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    
    // TypeScript/JSX
    ts: 'text/typescript',
    tsx: 'text/typescript',
    jsx: 'text/jsx',
    
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    
    // Fonts
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    
    // Other
    txt: 'text/plain',
    md: 'text/markdown',
    xml: 'application/xml',
  };
  
  return contentTypes[ext || ''] || 'application/octet-stream';
}


