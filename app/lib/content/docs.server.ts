import fs from 'node:fs';
import path from 'node:path';

export interface DocMetadata {
  title: string;
  description: string;
  lastUpdated: string;
  icon: string;
}

export interface Doc {
  slug: string;
  metadata: DocMetadata;
  content: string;
}

// Try multiple path strategies to find the docs directory
function getDocsPath(): string {
  const possiblePaths = [
    // Development path (from project root)
    path.join(process.cwd(), 'app', 'content', 'docs'),
    // Build path
    path.join(process.cwd(), 'build', 'server', 'app', 'content', 'docs'),
    // Alternative build path
    path.join(__dirname, '..', '..', 'content', 'docs'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Fallback to first path
  return possiblePaths[0];
}

const DOCS_PATH = getDocsPath();

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { metadata: DocMetadata; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    console.error('[docs.server] Failed to parse frontmatter from content:', content.substring(0, 100));
    throw new Error('Invalid markdown file: missing frontmatter');
  }

  const [, frontmatterStr, markdownContent] = match;
  const metadata: Record<string, string> = {};

  // Parse YAML-like frontmatter
  frontmatterStr.split(/\r?\n/).forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key && value) {
        metadata[key] = value;
      }
    }
  });

  return {
    metadata: {
      title: metadata.title || 'Untitled',
      description: metadata.description || '',
      lastUpdated: metadata.lastUpdated || new Date().toISOString().split('T')[0],
      icon: metadata.icon || 'document',
    },
    content: markdownContent.trim(),
  };
}

/**
 * Get all available documentation files
 */
export async function getAllDocs(): Promise<Doc[]> {
  try {
    // Check if directory exists
    if (!fs.existsSync(DOCS_PATH)) {
      console.error('[docs.server] Docs directory does not exist:', DOCS_PATH);
      return [];
    }

    const files = fs.readdirSync(DOCS_PATH);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    const docs = markdownFiles.map((file) => {
      const filePath = path.join(DOCS_PATH, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { metadata, content: markdownContent } = parseFrontmatter(content);
      const slug = file.replace('.md', '');

      return {
        slug,
        metadata,
        content: markdownContent,
      };
    });

    return docs;
  } catch (error) {
    console.error('[docs.server] Error reading docs:', error);
    return [];
  }
}

/**
 * Get a single documentation file by slug
 */
export async function getDocBySlug(slug: string): Promise<Doc | null> {
  try {
    const filePath = path.join(DOCS_PATH, `${slug}.md`);
    
    if (!fs.existsSync(filePath)) {
      console.error('[docs.server] Doc file does not exist:', filePath);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const { metadata, content: markdownContent } = parseFrontmatter(content);
    return {
      slug,
      metadata,
      content: markdownContent,
    };
  } catch (error) {
    console.error(`[docs.server] Error reading doc ${slug}:`, error);
    return null;
  }
}
