/**
 * GitHub API utilities for fetching repository files (server-side only)
 * Since WebContainer cannot use Git, we fetch files via GitHub API
 */

export interface GitHubFile {
  path: string;
  content: string;
  type: 'file' | 'dir';
}

export interface GitHubRepo {
  owner: string;
  name: string;
  branch?: string;
}

/**
 * Parse GitHub URL to extract owner, repo name, and branch
 */
function parseGithubUrl(url: string): GitHubRepo | null {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/);
    if (!match) return null;

    return {
      owner: match[1],
      name: match[2].replace(/\.git$/, ''), // Remove .git suffix if present
      branch: match[3] || 'main' // Default to main if no branch specified
    };
  } catch {
    return null;
  }
}

/**
 * Fetch repository contents recursively from GitHub API
 */
async function fetchRepoContents(
  owner: string, 
  repo: string, 
  path: string = '', 
  branch: string = 'main'
): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'OtterAI-Template-Fetcher',
      // Add GitHub token if available (for higher rate limits)
      ...(process.env.GITHUB_TOKEN && {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      })
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const contents = await response.json();
  
  if (!Array.isArray(contents)) {
    // Single file response
    if (contents.type === 'file' && contents.content) {
      return [{
        path: contents.path,
        content: Buffer.from(contents.content, 'base64').toString('utf-8'),
        type: 'file'
      }];
    }
    return [];
  }

  const files: GitHubFile[] = [];
  
  // Process all items in the directory
  for (const item of contents) {
    if (item.type === 'file') {
      // Fetch file content
      try {
        const fileResponse = await fetch(item.download_url);
        if (fileResponse.ok) {
          const content = await fileResponse.text();
          files.push({
            path: item.path,
            content,
            type: 'file'
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch file ${item.path}:`, error);
      }
    } else if (item.type === 'dir') {
      // Skip node_modules and common build directories
      if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item.name)) {
        try {
          const subFiles = await fetchRepoContents(owner, repo, item.path, branch);
          files.push(...subFiles);
        } catch (error) {
          console.warn(`Failed to fetch directory ${item.path}:`, error);
        }
      }
    }
  }

  return files;
}

/**
 * Main function to fetch all files from a GitHub repository
 */
export async function fetchGithubRepoFiles(githubUrl: string): Promise<GitHubFile[]> {
  const repoInfo = parseGithubUrl(githubUrl);
  if (!repoInfo) {
    throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  }

  try {
    const files = await fetchRepoContents(
      repoInfo.owner, 
      repoInfo.name, 
      '', 
      repoInfo.branch
    );

    // Filter out binary files and very large files
    return files.filter(file => {
      // Skip binary file extensions
      const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
      const hasBinaryExt = binaryExtensions.some(ext => file.path.toLowerCase().endsWith(ext));
      
      // Skip very large files (> 1MB)
      const isLarge = file.content.length > 1024 * 1024;
      
      return !hasBinaryExt && !isLarge;
    });
    
  } catch (error) {
    console.error('Error fetching GitHub repository:', error);
    throw new Error(`Failed to fetch repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert GitHub files to WebContainer format
 */
export function convertToWebContainerFormat(files: GitHubFile[]): Record<string, any> {
  const fileTree: Record<string, any> = {};
  
  for (const file of files) {
    const parts = file.path.split('/');
    let current = fileTree;
    
    // Build nested structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      current = current[part].directory;
    }
    
    // Add file content
    const fileName = parts[parts.length - 1];
    current[fileName] = {
      file: {
        contents: file.content
      }
    };
  }
  
  return fileTree;
}
