import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function loader({ context }: LoaderFunctionArgs) {
  // Import server-only modules inside the function
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { getAllDocs } = await import('~/lib/content/docs');
  const { getAllBlogs } = await import('~/lib/content/blogs');

  const baseUrl = 'https://otterai.net';
  
  // Static pages with their priorities and change frequencies
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' }, // Home page
    { url: '/pricing', priority: '0.9', changefreq: 'weekly' },
    { url: '/templates', priority: '0.9', changefreq: 'daily' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/dashboard', priority: '0.8', changefreq: 'daily' },
    { url: '/projects', priority: '0.8', changefreq: 'daily' },
    { url: '/docs', priority: '0.8', changefreq: 'weekly' },
    { url: '/sign-in', priority: '0.6', changefreq: 'monthly' },
    { url: '/sign-up', priority: '0.6', changefreq: 'monthly' },
  ];

  // Get all documentation pages
  const docs = getAllDocs();
  const docPages = docs.map(doc => ({
    url: `/docs/${doc.slug}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: doc.metadata.lastUpdated,
  }));

  // Get all blog posts
  const blogs = getAllBlogs();
  const blogPages = blogs.map(blog => ({
    url: `/blog/${blog.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: blog.metadata.date,
  }));

  // Get public templates from database
  const db = getDatabase(context.cloudflare.env);
  let templatePages: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> = [];
  
  try {
    const templates = await db
      .prepare(`
        SELECT id, updated_at 
        FROM projects 
        WHERE is_template = 1 
        ORDER BY updated_at DESC
      `)
      .all();

    templatePages = templates.results.map((template: any) => ({
      url: `/templates/${template.id}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: template.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching templates for sitemap:', error);
  }

  // Combine all pages
  const allPages = [...staticPages, ...docPages, ...blogPages, ...templatePages];

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages
  .map(page => {
    const lastmod = page.lastmod 
      ? `\n    <lastmod>${new Date(page.lastmod).toISOString().split('T')[0]}</lastmod>`
      : '';
    
    return `  <url>
    <loc>${baseUrl}${page.url}</loc>${lastmod}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}

