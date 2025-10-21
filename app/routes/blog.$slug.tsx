import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Not Found - OtterAI' }];
  }

  return [
    { title: `${data.blog.metadata.title} - OtterAI Blog` },
    { name: 'description', content: data.blog.metadata.description },
    { property: 'og:title', content: data.blog.metadata.title },
    { property: 'og:description', content: data.blog.metadata.description },
    { property: 'og:type', content: 'article' },
    { property: 'article:author', content: data.blog.metadata.author },
    { property: 'article:published_time', content: data.blog.metadata.date },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;

  if (!slug) {
    throw new Response('Not Found', { status: 404 });
  }

  try {
    const { getBlogBySlug, calculateReadingTime, getAllBlogs } = await import('~/lib/content/blogs');

    const blog = getBlogBySlug(slug);

    if (!blog) {
      throw new Response('Not Found', { status: 404 });
    }

    const readingTime = calculateReadingTime(blog.content);
    const allBlogs = getAllBlogs();
    
    // Get related posts (same tags, limit 3)
    const relatedPosts = allBlogs
      .filter((b) => 
        b.slug !== slug && 
        b.metadata.tags.some((tag) => blog.metadata.tags.includes(tag))
      )
      .slice(0, 3);

    return json({
      blog,
      readingTime,
      relatedPosts,
    });
  } catch (error) {
    console.error(`[blog.$slug] Error loading blog for slug ${slug}:`, error);

    // Re-throw Response errors (404)
    if (error instanceof Response) {
      throw error;
    }

    throw new Response('Internal Server Error', { status: 500 });
  }
}

export default function BlogPostPage() {
  const { blog, readingTime, relatedPosts } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/lightmodelogonew.svg" alt="OtterAI" className="h-8" />
            </Link>
            <Link
              to="/blog"
              className="text-sm text-slate-600 hover:text-[#e86b47] transition-colors font-medium"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {blog.metadata.coverImage && (
        <div className="w-full h-[400px] bg-gradient-to-br from-[#e86b47]/20 to-[#d45a36]/20 overflow-hidden">
          <img
            src={blog.metadata.coverImage}
            alt={blog.metadata.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-12"
        >
          {/* Meta Info */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-6">
              <span className="font-medium text-[#e86b47]">{blog.metadata.author}</span>
              <span>•</span>
              <time dateTime={blog.metadata.date}>
                {new Date(blog.metadata.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {blog.metadata.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-slate-600 leading-relaxed mb-6">
              {blog.metadata.description}
            </p>

            {/* Tags */}
            {blog.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="markdown-content">
            <style dangerouslySetInnerHTML={{__html: `
              .markdown-content {
                font-size: 18px;
                line-height: 1.8;
                color: #475569;
              }
              
              /* Headings */
              .markdown-content h1 {
                font-size: 2.5rem;
                font-weight: 800;
                color: #0f172a;
                margin-top: 3rem;
                margin-bottom: 1.5rem;
                padding-bottom: 0.75rem;
                border-bottom: 2px solid #e2e8f0;
                letter-spacing: -0.02em;
              }
              
              .markdown-content h2 {
                font-size: 2rem;
                font-weight: 700;
                color: #0f172a;
                margin-top: 3rem;
                margin-bottom: 1.25rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #e2e8f0;
                letter-spacing: -0.01em;
              }
              
              .markdown-content h3 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #1e293b;
                margin-top: 2rem;
                margin-bottom: 1rem;
              }
              
              .markdown-content h4 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #334155;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
              }
              
              /* Paragraphs */
              .markdown-content p {
                margin-bottom: 1.5rem;
                color: #475569;
                line-height: 1.8;
              }
              
              .markdown-content p strong {
                color: #0f172a;
                font-weight: 600;
              }
              
              .markdown-content p em {
                font-style: italic;
                color: #334155;
              }
              
              /* Links */
              .markdown-content a {
                color: #e86b47;
                font-weight: 500;
                text-decoration: none;
                border-bottom: 1px solid transparent;
                transition: all 0.2s ease;
              }
              
              .markdown-content a:hover {
                border-bottom-color: #e86b47;
                color: #d45a36;
              }
              
              /* Lists */
              .markdown-content ul,
              .markdown-content ol {
                margin: 1.5rem 0;
                padding-left: 1.75rem;
              }
              
              .markdown-content ul {
                list-style-type: none;
              }
              
              .markdown-content ul li {
                position: relative;
                padding-left: 1.5rem;
                margin-bottom: 0.75rem;
                color: #475569;
                line-height: 1.8;
              }
              
              .markdown-content ul li::before {
                content: "";
                position: absolute;
                left: 0;
                top: 0.7em;
                width: 6px;
                height: 6px;
                background: #e86b47;
                border-radius: 50%;
              }
              
              .markdown-content ol {
                counter-reset: item;
              }
              
              .markdown-content ol li {
                counter-increment: item;
                padding-left: 1.5rem;
                margin-bottom: 0.75rem;
                color: #475569;
                line-height: 1.8;
                position: relative;
              }
              
              .markdown-content ol li::before {
                content: counter(item) ".";
                position: absolute;
                left: 0;
                color: #e86b47;
                font-weight: 600;
              }
              
              /* Code */
              .markdown-content code {
                background: #f1f5f9;
                color: #e86b47;
                padding: 0.2em 0.4em;
                border-radius: 0.375rem;
                font-size: 0.9em;
                font-family: 'Monaco', 'Courier New', monospace;
                font-weight: 500;
                border: 1px solid #e2e8f0;
              }
              
              .markdown-content pre {
                background: #1e293b;
                color: #e2e8f0;
                padding: 1.5rem;
                border-radius: 0.75rem;
                overflow-x: auto;
                margin: 2rem 0;
                border: 1px solid #334155;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              
              .markdown-content pre code {
                background: transparent;
                color: #e2e8f0;
                padding: 0;
                border: none;
                font-size: 0.875rem;
                line-height: 1.7;
              }
              
              /* Blockquotes */
              .markdown-content blockquote {
                border-left: 4px solid #e86b47;
                background: linear-gradient(to right, #fef2f2, #fff);
                padding: 1.5rem 2rem;
                margin: 2rem 0;
                border-radius: 0 0.5rem 0.5rem 0;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              }
              
              .markdown-content blockquote p {
                color: #334155;
                font-style: italic;
                font-size: 1.1em;
                margin: 0;
              }
              
              /* Images */
              .markdown-content img {
                max-width: 100%;
                height: auto;
                border-radius: 0.75rem;
                margin: 2rem 0;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                border: 1px solid #e2e8f0;
              }
              
              /* Tables */
              .markdown-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 2rem 0;
                border-radius: 0.5rem;
                overflow: hidden;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              }
              
              .markdown-content thead {
                background: linear-gradient(135deg, #e86b47, #d45a36);
              }
              
              .markdown-content th {
                padding: 1rem;
                text-align: left;
                font-weight: 600;
                color: white;
                border-bottom: 2px solid #d45a36;
              }
              
              .markdown-content td {
                padding: 1rem;
                border-bottom: 1px solid #e2e8f0;
                color: #475569;
              }
              
              .markdown-content tbody tr {
                background: white;
                transition: background 0.2s ease;
              }
              
              .markdown-content tbody tr:hover {
                background: #f8fafc;
              }
              
              /* Horizontal Rule */
              .markdown-content hr {
                border: none;
                height: 2px;
                background: linear-gradient(to right, transparent, #e2e8f0, transparent);
                margin: 3rem 0;
              }
            `}} />
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
          </div>
        </motion.article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {post.metadata.coverImage ? (
                    <div className="aspect-video bg-gradient-to-br from-[#e86b47]/20 to-[#d45a36]/20 overflow-hidden">
                      <img
                        src={post.metadata.coverImage}
                        alt={post.metadata.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-[#e86b47]/20 to-[#d45a36]/20 flex items-center justify-center">
                      <span className="text-4xl opacity-50">📝</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-[#e86b47] transition-colors line-clamp-2">
                      {post.metadata.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{post.metadata.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

