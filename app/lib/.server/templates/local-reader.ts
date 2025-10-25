/**
 * Local Template Reader
 * Server-side utility for reading template files from local filesystem
 * Compatible with both Node.js development and Cloudflare Workers production
 */

export interface LocalTemplateFile {
  path: string;
  content: string;  
  type: 'file' | 'dir';
}

/**
 * Read template files from local directory
 * Only works in development environment with Node.js filesystem access
 */
export async function readLocalTemplateFiles(templatePath: string): Promise<LocalTemplateFile[]> {
  // Check if we're in a Node.js environment with filesystem access
  if (typeof process === 'undefined' || !process.versions?.node) {
    throw new Error('Local template reading only available in Node.js environment');
  }

  try {
    // Dynamic import of Node.js modules - this should work in server context
    const { promises: fs } = await import('fs');
    const path = await import('path');
    
    // Security: Only allow template directory access
    if (templatePath.includes('..') || !templatePath.match(/^[a-zA-Z0-9-_]+$/)) {
      throw new Error('Invalid template path');
    }

    const fullTemplatePath = path.join(process.cwd(), 'templates', templatePath);
    
    console.log(`🗂️ Reading local template from: ${fullTemplatePath}`);
    
    // Check if directory exists
    const stats = await fs.stat(fullTemplatePath);
    if (!stats.isDirectory()) {
      throw new Error(`Template path is not a directory: ${templatePath}`);
    }

    const files = await readTemplateDirectory(fullTemplatePath, '', fs, path);
    console.log(`🗂️ Successfully loaded ${files.length} template files`);
    
    return files;
    
  } catch (error) {
    console.error('🗂️ Error reading local template:', error);
    throw error;
  }
}

async function readTemplateDirectory(
  templatePath: string,
  relativePath: string = '',
  fs: any,
  path: any
): Promise<LocalTemplateFile[]> {
  const files: LocalTemplateFile[] = [];

  try {
    const entries = await fs.readdir(templatePath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(templatePath, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name);

      // Skip common directories and files we don't want
      const skipPatterns = [
        'node_modules', '.git', '.vscode', '.idea', 'dist', 'build', '.next',
        '.DS_Store', 'Thumbs.db', '.env', '.env.local', '.env.production'
      ];
      
      if (skipPatterns.includes(entry.name)) {
        continue;
      }

      if (entry.isFile()) {
        // Skip binary files and files that are too large
        const stats = await fs.stat(fullPath);
        if (stats.size > 100000) { // 100KB limit
          continue;
        }

        // Skip common binary file extensions
        const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip', '.tar', '.gz'];
        if (binaryExtensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
          continue;
        }

        try {
          const content = await fs.readFile(fullPath, 'utf8');
          files.push({
            path: relativeFilePath.replace(/\\/g, '/'), // Normalize path separators
            content,
            type: 'file'
          });
        } catch (error) {
          console.warn(`Failed to read file ${fullPath}:`, error);
          continue;
        }
      } else if (entry.isDirectory()) {
        // Skip common directories we don't want to recurse into
        const skipDirs = ['node_modules', '.git', '.vscode', '.idea', 'dist', 'build', '.next'];
        if (skipDirs.includes(entry.name)) {
          continue;
        }

        // Recursively read directory contents (limited depth)
        const depth = relativeFilePath.split('/').length;
        if (depth <= 3) { // Limit recursion depth
          try {
            const subFiles = await readTemplateDirectory(fullPath, relativeFilePath, fs, path);
            files.push(...subFiles);
          } catch (error) {
            console.warn(`Failed to read directory ${fullPath}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error reading template directory ${templatePath}:`, error);
    throw new Error(`Failed to read template directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return files;
}
