/**
 * Project Loader Service (Client-side)
 * Handles loading project files from R2 storage via API
 */

import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('ProjectLoader');

export interface ProjectFilesResponse {
  success: boolean;
  projectId: string;
  files: Record<string, string>;
  count: number;
}

/**
 * Load all files for a project from R2 storage
 */
export async function loadProjectFiles(projectId: string): Promise<Record<string, string>> {
  try {
    logger.debug('Loading project files...', { projectId });

    const response = await fetch(`/api/projects/${projectId}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Try to parse error as JSON, but handle cases where it's not JSON
      let errorMessage = `Server returned ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (parseError) {
        // Response wasn't JSON, try to get text
        try {
          const textError = await response.text();
          logger.error('Non-JSON error response:', textError.substring(0, 200));
        } catch {
          // Ignore
        }
      }
      throw new Error(errorMessage);
    }

    const result: ProjectFilesResponse = await response.json();
    
    logger.debug('Project files loaded successfully', {
      projectId: result.projectId,
      fileCount: result.count,
      fileKeys: Object.keys(result.files),
    });

    // Debug: Log first few files to see what we're getting
    const fileEntries = Object.entries(result.files);
    if (fileEntries.length > 0) {
      logger.debug('Sample files:', fileEntries.slice(0, 3).map(([path, content]) => ({
        path,
        contentLength: content.length,
        contentPreview: content.substring(0, 100)
      })));
    }

    return result.files;
  } catch (error) {
    logger.error('Failed to load project files:', error);
    throw error;
  }
}

