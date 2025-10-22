import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/lightmodelogonew.svg" alt="OtterAI" style={{ width: '90px', height: 'auto' }} />
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
        <div className="relative w-full h-[300px] md:h-[500px] bg-gradient-to-br from-[#e86b47]/20 to-[#d45a36]/20 overflow-hidden">
          <img
            src={blog.metadata.coverImage}
            alt={blog.metadata.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl md:rounded-3xl border-2 border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8 lg:p-16 relative overflow-hidden"
        >
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-br from-[#e86b47]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-gradient-to-tr from-slate-100 to-transparent rounded-full blur-3xl"></div>
          
          {/* Meta Info */}
          <div className="mb-6 md:mb-10 relative z-10">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-slate-600 mb-6 md:mb-8">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#e86b47]/10 rounded-full">
                <svg className="w-4 h-4 text-[#e86b47]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-[#e86b47] font-semibold">{blog.metadata.author}</span>
              </div>
              <span className="text-slate-400">•</span>
              <time dateTime={blog.metadata.date} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(blog.metadata.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {readingTime} min read
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 md:mb-6 leading-[1.1] tracking-tight">
              {blog.metadata.title}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl lg:text-2xl text-slate-600 leading-relaxed mb-6 md:mb-8 font-light">
              {blog.metadata.description}
            </p>

            {/* Tags */}
            {blog.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:gap-2 pt-3 md:pt-4 border-t-2 border-slate-100">
                {blog.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 text-xs md:text-sm rounded-full font-semibold hover:from-[#e86b47]/10 hover:to-[#e86b47]/5 hover:text-[#e86b47] transition-all duration-300 border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="markdown-content relative z-10">
            <style dangerouslySetInnerHTML={{__html: `
              .markdown-content {
                font-size: 19px;
                line-height: 1.9;
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
            className="mt-12 md:mt-20"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
              <div className="h-1 w-8 md:w-12 bg-gradient-to-r from-[#e86b47] to-[#d45a36] rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Related Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-[#e86b47]/20 hover:border-[#e86b47]/30 transition-all duration-500 hover:-translate-y-2"
                >
                  {post.metadata.coverImage ? (
                    <div className="aspect-video bg-gradient-to-br from-[#e86b47]/20 to-[#d45a36]/20 overflow-hidden relative">
                      <img
                        src={post.metadata.coverImage}
                        alt={post.metadata.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-[#e86b47]/20 to-[#d45a36]/20 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                      <span className="text-4xl opacity-40 group-hover:scale-110 transition-transform duration-500 relative z-10">📝</span>
                    </div>
                  )}
                  <div className="p-4 md:p-5">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 group-hover:text-[#e86b47] transition-colors line-clamp-2 leading-tight">
                      {post.metadata.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{post.metadata.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-[#e86b47] font-semibold text-sm opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <span>Read more</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
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


