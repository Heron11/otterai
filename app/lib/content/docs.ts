// This file imports markdown files at build time using Vite's glob import
// This works in both dev and production

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

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { metadata: DocMetadata; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    console.error('[docs] Failed to parse frontmatter from content:', content.substring(0, 100));
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

  // Remove the first H1 from content since we display title in the header
  let processedContent = markdownContent.trim();
  
  // Remove first H1 if it matches the title (case-insensitive)
  const firstH1Regex = /^#\s+(.+?)$/m;
  const h1Match = processedContent.match(firstH1Regex);
  if (h1Match) {
    processedContent = processedContent.replace(firstH1Regex, '').trim();
  }
  
  // Also remove "Last Updated:" line if present
  processedContent = processedContent.replace(/^\*\*Last Updated:.*?\*\*$/m, '').trim();

  return {
    metadata: {
      title: metadata.title || 'Untitled',
      description: metadata.description || '',
      lastUpdated: metadata.lastUpdated || new Date().toISOString().split('T')[0],
      icon: metadata.icon || 'document',
    },
    content: processedContent,
  };
}

// Import all markdown files using Vite's glob import
// This is a static import that happens at build time
const docsModules = import.meta.glob('../../content/docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

console.log('[docs] Loaded docs modules:', Object.keys(docsModules));

// Parse all docs at module load time
const allDocs: Doc[] = Object.entries(docsModules).map(([filepath, content]) => {
  console.log('[docs] Processing file:', filepath);
  
  // Extract slug from filepath (e.g., "../../content/docs/privacy-policy.md" -> "privacy-policy")
  const filename = filepath.split('/').pop() || '';
  const slug = filename.replace('.md', '');
  
  const { metadata, content: markdownContent } = parseFrontmatter(content as string);
  
  return {
    slug,
    metadata,
    content: markdownContent,
  };
});

console.log('[docs] Parsed docs:', allDocs.map(d => d.slug));

/**
 * Get all available documentation files
 */
export function getAllDocs(): Doc[] {
  return allDocs;
}

/**
 * Get a single documentation file by slug
 */
export function getDocBySlug(slug: string): Doc | null {
  const doc = allDocs.find(d => d.slug === slug);
  if (!doc) {
    console.log('[docs] Doc not found for slug:', slug);
    return null;
  }
  return doc;
}

