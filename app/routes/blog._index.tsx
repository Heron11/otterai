import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter blogs based on search query and selected tag
  const filteredBlogs = useMemo(() => {
    let filtered = blogs;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.metadata.title.toLowerCase().includes(query) ||
          blog.metadata.description.toLowerCase().includes(query) ||
          blog.metadata.author.toLowerCase().includes(query) ||
          blog.metadata.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter((blog) => blog.metadata.tags.includes(selectedTag));
    }

    return filtered;
  }, [blogs, searchQuery, selectedTag]);

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

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
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="max-w-2xl mx-auto relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search blog posts by title, description, author, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e86b47] focus:border-transparent shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Tags */}
        {tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedTag === tag
                      ? 'bg-[#e86b47] text-white shadow-lg shadow-[#e86b47]/30'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#e86b47] hover:text-[#e86b47]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        {(searchQuery || selectedTag) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-center"
          >
            <p className="text-slate-600">
              Found <span className="font-semibold text-[#e86b47]">{filteredBlogs.length}</span>{' '}
              {filteredBlogs.length === 1 ? 'post' : 'posts'}
              {selectedTag && (
                <span>
                  {' '}
                  tagged with <span className="font-semibold">"{selectedTag}"</span>
                </span>
              )}
            </p>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        {filteredBlogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="relative inline-block">
              <div className="text-8xl mb-6 opacity-30">
                {searchQuery || selectedTag ? '🔍' : '📝'}
              </div>
              <div className="absolute inset-0 bg-[#e86b47]/10 rounded-full blur-2xl"></div>
            </div>
            <p className="text-slate-600 text-lg mb-6">
              {searchQuery || selectedTag
                ? 'No blog posts match your search.'
                : 'No blog posts yet. Check back soon!'}
            </p>
            {(searchQuery || selectedTag) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#e86b47] text-white rounded-lg font-medium hover:bg-[#d45a36] transition-colors"
              >
                Clear filters
              </button>
            )}
            {!searchQuery && !selectedTag && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#e86b47]/10 border border-[#e86b47]/20 rounded-full">
                <span className="text-[#e86b47] text-sm font-medium">
                  We're working on great content for you
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog, index) => (
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

