/**
 * Project Sync Service V2 (Client-side)
 * Handles syncing workbench state to server with project context support
 */

import type { FileMap } from '~/lib/stores/files';
import { createScopedLogger } from '~/utils/logger';
import { getCurrentProject } from '~/lib/stores/project-context';

/**
 * Security: Validate and normalize file path to prevent directory traversal attacks
 */
function validateFilePath(filePath: string): string | null {
  if (!filePath || typeof filePath !== 'string') {
    return null;
  }

  const WORK_DIR_PREFIX = '/home/project/';
  
  // Remove leading slash and /home/project prefix if present
  let normalizedPath = filePath.replace(/^\//, '');
  if (normalizedPath.startsWith('home/project/')) {
    normalizedPath = normalizedPath.substring('home/project/'.length);
  }

  // Security: Prevent directory traversal attacks
  if (normalizedPath.includes('..') || normalizedPath.includes('~')) {
    return null;
  }

  // Security: Prevent absolute paths
  if (normalizedPath.startsWith('/')) {
    return null;
  }

  // Security: Prevent control characters and dangerous patterns
  if (/[\x00-\x1f\x7f-\x9f]/.test(normalizedPath)) {
    return null;
  }

  // Security: Limit path length to prevent DoS
  if (normalizedPath.length > 1000) {
    return null;
  }

  // Normalize path separators and remove redundant parts
  normalizedPath = normalizedPath.replace(/\/+/g, '/').replace(/\/$/, '');
  
  return normalizedPath;
}

const logger = createScopedLogger('ProjectSyncV2');

interface SyncProjectData {
  chatId?: string;
  projectName: string;
  files: FileMap;
}

/**
 * Sync current project state to server
 * Uses project context if available, falls back to chat-based sync
 */
export async function syncProjectToServer(data: SyncProjectData): Promise<void> {
  try {
    const projectContext = getCurrentProject();
    
    // Convert FileMap to simple string record (only include actual files)
    // Also normalize paths to remove /home/project prefix
    const fileContents: Record<string, string> = {};
    const WORK_DIR_PREFIX = '/home/project/';
    
    for (const [path, dirent] of Object.entries(data.files)) {
      if (dirent?.type === 'file' && !dirent.isBinary) {
        // Security: Validate and normalize path
        const normalizedPath = validateFilePath(path);
        if (normalizedPath) {
          fileContents[normalizedPath] = dirent.content;
        }
      }
    }

    // If we have project context, use direct project sync
    if (projectContext) {
      logger.debug('Syncing to project...', {
        projectId: projectContext.projectId,
        fileCount: Object.keys(fileContents).length,
      });

      const response = await fetch(`/api/projects/${projectContext.projectId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: fileContents,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      logger.debug('Project synced successfully', {
        projectId: projectContext.projectId,
      });
    } else {
      // Fall back to chat-based sync (legacy behavior)
      logger.debug('Syncing via chat (no project context)...', {
        chatId: data.chatId,
        fileCount: Object.keys(fileContents).length,
      });

      if (!data.chatId) {
        logger.warn('No project context or chat ID available for sync');
        return;
      }

      const response = await fetch('/api/projects/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: data.chatId,
          projectName: data.projectName,
          files: fileContents,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      logger.debug('Project synced successfully via chat');
    }
  } catch (error) {
    logger.error('Failed to sync project to server:', error);
    throw error;
  }
}

