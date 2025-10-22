// This file imports blog markdown files at build time using Vite's glob import
// This works in both dev and production

export interface BlogMetadata {
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  coverImage?: string;
  featured?: boolean;
}

export interface Blog {
  slug: string;
  metadata: BlogMetadata;
  content: string;
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { metadata: BlogMetadata; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    console.error('[blogs] Failed to parse frontmatter from content:', content.substring(0, 100));
    throw new Error('Invalid markdown file: missing frontmatter');
  }

  const [, frontmatterStr, markdownContent] = match;
  const metadata: Record<string, any> = {};

  // Parse YAML-like frontmatter
  frontmatterStr.split(/\r?\n/).forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key && value) {
        // Handle arrays (tags)
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[key] = value
            .slice(1, -1)
            .split(',')
            .map((item) => item.trim().replace(/['"]/g, ''));
        } else if (value === 'true' || value === 'false') {
          metadata[key] = value === 'true';
        } else {
          metadata[key] = value.replace(/['"]/g, '');
        }
      }
    }
  });

  // Remove the first H1 from content since we display title in the header
  let processedContent = markdownContent.trim();

  // Remove first H1 if present
  const firstH1Regex = /^#\s+(.+?)$/m;
  const h1Match = processedContent.match(firstH1Regex);
  if (h1Match) {
    processedContent = processedContent.replace(firstH1Regex, '').trim();
  }

  return {
    metadata: {
      title: metadata.title || 'Untitled',
      description: metadata.description || '',
      author: metadata.author || 'OtterAI Team',
      date: metadata.date || new Date().toISOString().split('T')[0],
      tags: metadata.tags || [],
      coverImage: metadata.coverImage,
      featured: metadata.featured || false,
    },
    content: processedContent,
  };
}

// Import all markdown files using Vite's glob import
// This is a static import that happens at build time
const blogsModules = import.meta.glob('../../content/blogs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Parse all blogs at module load time
const allBlogs: Blog[] = Object.entries(blogsModules).map(([filepath, content]) => {

  // Extract slug from filepath (e.g., "../../content/blogs/introducing-otterai.md" -> "introducing-otterai")
  const filename = filepath.split('/').pop() || '';
  const slug = filename.replace('.md', '');

  const { metadata, content: markdownContent } = parseFrontmatter(content as string);

  return {
    slug,
    metadata,
    content: markdownContent,
  };
});

// Sort blogs by date (newest first)
allBlogs.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());

/**
 * Get all available blog posts
 */
export function getAllBlogs(): Blog[] {
  return allBlogs;
}

/**
 * Get featured blog posts
 */
export function getFeaturedBlogs(): Blog[] {
  return allBlogs.filter((blog) => blog.metadata.featured);
}

/**
 * Get blogs by tag
 */
export function getBlogsByTag(tag: string): Blog[] {
  return allBlogs.filter((blog) => blog.metadata.tags.includes(tag));
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  allBlogs.forEach((blog) => {
    blog.metadata.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Get a single blog post by slug
 */
export function getBlogBySlug(slug: string): Blog | null {
  const blog = allBlogs.find((b) => b.slug === slug);
  if (!blog) {
    return null;
  }
  return blog;
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}


