import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect, useRef } from 'react';

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
  const [visibleBlogs, setVisibleBlogs] = useState(6); // Start with 6 posts
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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
    setVisibleBlogs(6); // Reset visible blogs when filtering
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          setTimeout(() => {
            setVisibleBlogs(prev => Math.min(prev + 6, filteredBlogs.length));
            setIsLoading(false);
          }, 300); // Small delay for smooth loading
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [filteredBlogs.length, isLoading]);

  // Reset visible blogs when search/filter changes
  useEffect(() => {
    setVisibleBlogs(6);
  }, [searchQuery, selectedTag]);

  const displayedBlogs = filteredBlogs.slice(0, visibleBlogs);
  const hasMoreBlogs = visibleBlogs < filteredBlogs.length;

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
              to="/"
              className="text-sm text-slate-600 hover:text-[#e86b47] transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#e86b47]/5 via-white to-slate-50 border-b border-slate-200 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-[#e86b47]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 md:w-96 h-48 md:h-96 bg-slate-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 md:mb-6 tracking-tight">
              OtterAI Blog
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-4">
              Discover the latest insights, tips, and updates on AI-powered development
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

        {/* Tags - Horizontally Scrollable */}
        {tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 md:mb-12"
          >
            <h2 className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 md:mb-4">
              Browse by Topic
            </h2>
            <div className="relative group">
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 scrollbar-hide scroll-smooth">
                <div className="flex gap-2 md:gap-3 min-w-max px-1">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                        selectedTag === tag
                          ? 'bg-gradient-to-r from-[#e86b47] to-[#d45a36] text-white shadow-lg shadow-[#e86b47]/40 scale-105'
                          : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-[#e86b47] hover:text-[#e86b47] hover:shadow-md hover:scale-105'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Enhanced scroll indicators */}
              <div className="absolute top-0 right-0 bottom-3 w-12 md:w-20 bg-gradient-to-l from-slate-50 via-slate-50/60 to-transparent pointer-events-none opacity-100 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute top-0 left-0 bottom-3 w-12 md:w-20 bg-gradient-to-r from-slate-50 via-slate-50/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-80 transition-opacity"></div>
              
              {/* Animated scroll hint */}
              <div className="absolute -bottom-1 right-0 text-xs text-slate-400 flex items-center gap-1 animate-pulse">
                <svg className="w-3 md:w-3.5 h-3 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                <span className="font-medium hidden md:inline">Scroll</span>
              </div>
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
        {displayedBlogs.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedBlogs.map((blog, index) => (
              <motion.div
                key={blog.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={`/blog/${blog.slug}`}
                  className="group block bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-[#e86b47]/20 hover:border-[#e86b47]/30 transition-all duration-500 hover:-translate-y-2 relative"
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e86b47]/0 to-[#e86b47]/0 group-hover:from-[#e86b47]/5 group-hover:to-transparent transition-all duration-500 pointer-events-none z-10"></div>
                  
                  {/* Cover Image */}
                  {blog.metadata.coverImage ? (
                    <div className="aspect-video bg-gradient-to-br from-[#e86b47]/20 to-[#d45a36]/20 overflow-hidden relative">
                      <img
                        src={blog.metadata.coverImage}
                        alt={blog.metadata.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Image overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-[#e86b47]/20 via-[#e86b47]/10 to-[#d45a36]/20 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                      <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-500 relative z-10">📝</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 md:p-6 relative z-20">
                    {/* Meta */}
                    <div className="flex items-center gap-2 md:gap-3 text-xs font-medium text-slate-500 mb-2 md:mb-3">
                      <time className="group-hover:text-[#e86b47] transition-colors">
                        {new Date(blog.metadata.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                      <span>•</span>
                      <span className="group-hover:text-slate-700 transition-colors truncate">{blog.metadata.author}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3 group-hover:text-[#e86b47] transition-colors duration-300 line-clamp-2 leading-tight">
                      {blog.metadata.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-3 md:mb-4 line-clamp-3">
                      {blog.metadata.description}
                    </p>

                    {/* Tags */}
                    {blog.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 md:gap-2 pt-2 border-t border-slate-100">
                        {blog.metadata.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 md:px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-semibold group-hover:bg-[#e86b47]/10 group-hover:text-[#e86b47] transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Read more indicator */}
                    <div className="flex items-center gap-2 mt-3 md:mt-4 text-[#e86b47] font-semibold text-sm opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <span>Read article</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
              ))}
            </div>

            {/* Loading Indicator and Intersection Observer */}
            {hasMoreBlogs && (
              <div ref={observerRef} className="mt-12 text-center">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <div className="w-5 h-5 border-2 border-[#e86b47] border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading more posts...</span>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">
                    Scroll down to load more posts
                  </div>
                )}
              </div>
            )}

            {/* Show total count when all posts are loaded */}
            {!hasMoreBlogs && displayedBlogs.length > 6 && (
              <div className="mt-8 text-center text-slate-500 text-sm">
                Showing all {displayedBlogs.length} posts
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

