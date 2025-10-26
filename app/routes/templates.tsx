import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { ProjectGrid } from '~/components/platform/projects/ProjectGrid';
import { getDatabase } from '~/lib/.server/db/client';
import { getPublicTemplates } from '~/lib/.server/projects/queries';

export const meta: MetaFunction = () => {
  return [
    { title: 'Templates - OtterAI' },
    { name: 'description', content: 'Browse community templates - public projects you can clone' },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const db = getDatabase(context.cloudflare.env);
  const templates = await getPublicTemplates(db, 50); // Get up to 50 public projects

  return json({ templates });
}

export default function TemplatesPage() {
  const { templates } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!search) return templates;
    
    const searchLower = search.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(searchLower) ||
      (template.description && template.description.toLowerCase().includes(searchLower))
    );
  }, [templates, search]);

  return (
    <PlatformLayout>
      <div className="min-h-screen bg-bg-1 dark:bg-black overflow-x-hidden">
        {/* Background decorative elements - safe positioning */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#e86b47]/10 dark:bg-[#e86b47]/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-20 w-64 h-64 bg-[#e86b47]/8 dark:bg-[#e86b47]/12 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-[#e86b47]/5 dark:bg-[#e86b47]/4 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block mb-4 text-sm text-[#e86b47] font-medium tracking-tight"
            >
              Professional Templates
            </motion.span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-text-primary dark:text-white tracking-tighter mb-6 break-words">
              Start with proven designs
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary dark:text-white/80 max-w-2xl mx-auto leading-relaxed">
              Choose from our curated collection of production-ready templates built with modern frameworks and best practices
            </p>
          </motion.div>

          {/* Search Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-6 py-4 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 rounded-2xl text-text-primary dark:text-white placeholder:text-text-tertiary dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#e86b47]/50 transition-all"
              />
            </div>
          </motion.div>

          {/* Templates Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ProjectGrid 
              projects={filteredTemplates} 
              emptyMessage="No public templates available yet. Be the first to share a project!"
              showSettings={false}
            />
          </motion.div>
        </div>
      </div>
    </PlatformLayout>
  );
}



