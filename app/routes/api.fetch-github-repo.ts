import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

interface GitHubApiFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
  size: number;
}

interface GitHubFile {
  path: string;
  content: string;
  type: 'file' | 'dir';
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const githubUrl = body?.githubUrl;
    
    if (!githubUrl || typeof githubUrl !== 'string') {
      return json({ error: 'GitHub URL is required' }, { status: 400 });
    }

    // Parse GitHub URL to extract owner, repo, and path
    const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/[^\/]+\/(.*))?/);
    if (!urlMatch) {
      throw new Error('Invalid GitHub URL format');
    }

    const [, owner, repo, subPath = ''] = urlMatch;
    
    console.log(`Fetching files from GitHub: ${owner}/${repo}${subPath ? `/${subPath}` : ''}`);

    const files = await fetchRepositoryFiles(owner, repo, subPath);
    return json(files);

  } catch (error) {
    console.error('Error fetching GitHub repository:', error);
    return json({ error: 'Failed to fetch repository files' }, { status: 500 });
  }
}

async function fetchRepositoryFiles(owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'OtterAI-Template-Fetcher'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }

  const contents: GitHubApiFile[] = await response.json();
  const files: GitHubFile[] = [];

  // Filter and process files
  for (const item of contents) {
    if (item.type === 'file') {
      // Skip binary files and files that are too large
      if (item.size > 100000) { // 100KB limit
        continue;
      }

      // Skip common binary file extensions
      const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip', '.tar', '.gz'];
      if (binaryExtensions.some(ext => item.name.toLowerCase().endsWith(ext))) {
        continue;
      }

      // Skip common directories/files we don't want
      const skipPatterns = [
        'node_modules', '.git', '.vscode', '.idea', 'dist', 'build', '.next', 
        '.DS_Store', 'Thumbs.db', '.env', '.env.local', '.env.production'
      ];
      if (skipPatterns.some(pattern => item.path.includes(pattern))) {
        continue;
      }

      try {
        // Fetch file content
        if (item.download_url) {
          const fileResponse = await fetch(item.download_url);
          if (fileResponse.ok) {
            const content = await fileResponse.text();
            files.push({
              path: item.path,
              content,
              type: 'file'
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch file ${item.path}:`, error);
        continue;
      }
    } else if (item.type === 'dir') {
      // Skip common directories we don't want to recurse into
      const skipDirs = ['node_modules', '.git', '.vscode', '.idea', 'dist', 'build', '.next'];
      if (skipDirs.includes(item.name)) {
        continue;
      }

      // Recursively fetch directory contents (limited depth)
      const depth = item.path.split('/').length;
      if (depth <= 3) { // Limit recursion depth
        try {
          const subFiles = await fetchRepositoryFiles(owner, repo, item.path);
          files.push(...subFiles);
        } catch (error) {
          console.warn(`Failed to fetch directory ${item.path}:`, error);
        }
      }
    }
  }

  return files;
}