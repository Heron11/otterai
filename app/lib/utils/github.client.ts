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
 * Fetch GitHub repository files from client-side
 * This calls our server API endpoint to avoid CORS issues
 * ONLY REAL FILES - No fallbacks to fake files!
 */
export async function fetchGithubRepoFiles(githubUrl: string): Promise<GitHubFile[]> {
  console.log('🔄 Fetching REAL files from GitHub:', githubUrl);
  
  const response = await fetch('/api/fetch-github-repo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ githubUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub fetch failed (${response.status}): ${errorText || response.statusText}`);
  }

  const files = await response.json();
  
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('No files found in GitHub repository');
  }

  console.log('✅ Successfully fetched', files.length, 'REAL files from GitHub');
  return files;
}

// generateFallbackFiles REMOVED - We only use real GitHub files, no fake fallbacks!