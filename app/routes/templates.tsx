import type { MetaFunction } from '@remix-run/cloudflare';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { TemplateGrid } from '~/components/platform/templates/TemplateGrid';
import { TemplateFilters } from '~/components/platform/templates/TemplateFilters';
import { useStore } from '@nanostores/react';
import { templatesStore } from '~/lib/stores/platform/templates';
import type { TemplateCategory, TemplateFramework } from '~/lib/types/platform/template';

export const meta: MetaFunction = () => {
  return [
    { title: 'Templates - OtterAI' },
    { name: 'description', content: 'Browse our collection of project templates' },
  ];
};

export default function TemplatesPage() {
  const templates = useStore(templatesStore);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<TemplateCategory | undefined>();
  const [framework, setFramework] = useState<TemplateFramework | undefined>();

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      if (category && template.category !== category) {
        return false;
      }
      
      if (framework && template.framework !== framework) {
        return false;
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) {
          return false;
        }
      }
      
      return true;
    });
  }, [templates, search, category, framework]);

  return (
    <PlatformLayout>
      <div className="min-h-screen bg-bg-1 dark:bg-black">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#e86b47]/10 dark:bg-[#e86b47]/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#e86b47]/8 dark:bg-[#e86b47]/12 rounded-full blur-3xl translate-x-1/2"></div>
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
            <h1 className="font-heading text-6xl lg:text-7xl text-text-primary dark:text-white tracking-tighter mb-6">
              Start with proven designs
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Choose from our curated collection of production-ready templates built with modern frameworks and best practices
            </p>
          </motion.div>

          {/* Filters Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <TemplateFilters
              onSearchChange={setSearch}
              onCategoryChange={setCategory}
              onFrameworkChange={setFramework}
            />
          </motion.div>

          {/* Templates Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TemplateGrid templates={filteredTemplates} />
          </motion.div>
        </div>
      </div>
    </PlatformLayout>
  );
}



