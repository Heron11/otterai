/**
 * GitHub utilities for client-side use
 */

export interface GitHubFile {
  path: string;
  content: string;
  type: 'file' | 'dir';
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
