import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { motion } from 'framer-motion';

export const meta: MetaFunction = () => {
  return [
    { title: 'Blog - OtterAI' },
    { name: 'description', content: 'Read the latest news, updates, and insights from the OtterAI team' },
  ];
};

export async function loader({ }: LoaderFunctionArgs) {
  const { getAllBlogs, getAllTags } = await import('~/lib/content/blogs');

  const blogs = getAllBlogs();
  const tags = getAllTags();

  return json({ blogs, tags });
}

export default function BlogIndexPage() {
  const { blogs, tags } = useLoaderData<typeof loader>();

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
              to="/"
              className="text-sm text-slate-600 hover:text-[#e86b47] transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-slate-900 mb-4">OtterAI Blog</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The latest news, updates, and insights from the OtterAI team
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tags */}
        {tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-[#e86b47] hover:text-[#e86b47] transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        {blogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="relative inline-block">
              <div className="text-8xl mb-6 opacity-30">📝</div>
              <div className="absolute inset-0 bg-[#e86b47]/10 rounded-full blur-2xl"></div>
            </div>
            <p className="text-slate-600 text-lg mb-6">No blog posts yet. Check back soon!</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#e86b47]/10 border border-[#e86b47]/20 rounded-full">
              <span className="text-[#e86b47] text-sm font-medium">
                We're working on great content for you
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={`/blog/${blog.slug}`}
                  className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Cover Image */}
                  {blog.metadata.coverImage ? (
                    <div className="aspect-video bg-gradient-to-br from-[#e86b47]/20 to-[#d45a36]/20 overflow-hidden">
                      <img
                        src={blog.metadata.coverImage}
                        alt={blog.metadata.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-[#e86b47]/20 to-[#d45a36]/20 flex items-center justify-center">
                      <span className="text-6xl opacity-50">📝</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span>{new Date(blog.metadata.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</span>
                      <span>•</span>
                      <span>{blog.metadata.author}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#e86b47] transition-colors">
                      {blog.metadata.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {blog.metadata.description}
                    </p>

                    {/* Tags */}
                    {blog.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blog.metadata.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

