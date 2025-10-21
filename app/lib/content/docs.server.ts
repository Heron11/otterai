import { promises as fs } from 'fs';
import path from 'path';

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

const DOCS_PATH = path.join(process.cwd(), 'app/content/docs');

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { metadata: DocMetadata; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid markdown file: missing frontmatter');
  }

  const [, frontmatterStr, markdownContent] = match;
  const metadata: Record<string, string> = {};

  // Parse YAML-like frontmatter
  frontmatterStr.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      metadata[key.trim()] = valueParts.join(':').trim();
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
    const files = await fs.readdir(DOCS_PATH);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    const docs = await Promise.all(
      markdownFiles.map(async (file) => {
        const filePath = path.join(DOCS_PATH, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { metadata, content: markdownContent } = parseFrontmatter(content);
        const slug = file.replace('.md', '');

        return {
          slug,
          metadata,
          content: markdownContent,
        };
      })
    );

    return docs;
  } catch (error) {
    console.error('Error reading docs:', error);
    return [];
  }
}

/**
 * Get a single documentation file by slug
 */
export async function getDocBySlug(slug: string): Promise<Doc | null> {
  try {
    const filePath = path.join(DOCS_PATH, `${slug}.md`);
    const content = await fs.readFile(filePath, 'utf-8');
    const { metadata, content: markdownContent } = parseFrontmatter(content);

    return {
      slug,
      metadata,
      content: markdownContent,
    };
  } catch (error) {
    console.error(`Error reading doc ${slug}:`, error);
    return null;
  }
}

/**
 * Get icon SVG for a doc based on icon name
 */
export function getIconForDoc(iconName: string): string {
  const icons: Record<string, string> = {
    document: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`,
    lock: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>`,
    shield: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>`,
  };

  return icons[iconName] || icons.document;
}

