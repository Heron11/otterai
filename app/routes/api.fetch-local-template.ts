import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

interface LocalTemplateFile {
  path: string;
  content: string;
  type: 'file' | 'dir';
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Import server-only modules inside the function
    const fs = await import('fs/promises');
    const path = await import('path');

    const body = await request.json();
    const templatePath = body?.templatePath;
    
    if (!templatePath || typeof templatePath !== 'string') {
      return json({ error: 'Template path is required' }, { status: 400 });
    }

    // Security: Only allow template directory access
    if (templatePath.includes('..') || !templatePath.match(/^[a-zA-Z0-9-_]+$/)) {
      return json({ error: 'Invalid template path' }, { status: 400 });
    }

    const fullTemplatePath = path.join(process.cwd(), 'templates', templatePath);
    
    console.log(`Loading local template from: ${fullTemplatePath}`);

    const files = await readTemplateDirectory(fullTemplatePath, '', fs, path);
    return json(files);

  } catch (error) {
    console.error('Error loading local template:', error);
    return json({ error: 'Failed to load template files' }, { status: 500 });
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
