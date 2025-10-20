/**
 * Project Sync Service (Client-side)
 * Handles syncing workbench state to server (D1 + R2)
 */

import type { FileMap } from '~/lib/stores/files';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('ProjectSync');

interface SyncProjectData {
  chatId: string;
  projectName: string;
  files: FileMap;
}

/**
 * Sync current project state to server
 * Called after AI completes generating code
 */
export async function syncProjectToServer(data: SyncProjectData): Promise<void> {
  try {
    logger.debug('Syncing project to server...', {
      chatId: data.chatId,
      name: data.projectName,
      fileCount: Object.keys(data.files).length,
    });

    // Convert FileMap to simple string record (only include actual files)
    const fileContents: Record<string, string> = {};
    
    for (const [path, dirent] of Object.entries(data.files)) {
      if (dirent?.type === 'file' && !dirent.isBinary) {
        fileContents[path] = dirent.content;
      }
    }

    // Call sync API
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

    const result = await response.json();
    
    logger.debug('Project synced successfully', {
      projectId: result.projectId,
      fileCount: result.fileCount,
    });
  } catch (error) {
    logger.error('Failed to sync project to server:', error);
    throw error;
  }
}


