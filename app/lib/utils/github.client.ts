/**
 * GitHub utilities for client-side use
 */

export interface GitHubFile {
  path: string;
  content: string;
  type: 'file' | 'dir';
}

// convertToWebContainerFormat removed - no longer needed
// Files are now written directly to working directory via WebContainer.fs.writeFile()

/**
 * Fetch local template files from server filesystem
 * This reads templates from the local /templates directory
 */
export async function fetchLocalTemplateFiles(templatePath: string): Promise<GitHubFile[]> {
  console.log('🔄 Fetching LOCAL template files from:', templatePath);
  
  const response = await fetch('/api/fetch-local-template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ templatePath }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Local template fetch failed (${response.status}): ${errorText || response.statusText}`);
  }

  const files = await response.json();
  
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('No files found in local template directory');
  }

  console.log('✅ Successfully fetched', files.length, 'LOCAL template files');
  return files;
}

// generateFallbackFiles REMOVED - We only use real GitHub files, no fake fallbacks!