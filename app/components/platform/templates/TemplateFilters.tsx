import { useState } from 'react';
import type { TemplateCategory, TemplateFramework } from '~/lib/types/platform/template';

interface TemplateFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: TemplateCategory | undefined) => void;
  onFrameworkChange: (framework: TemplateFramework | undefined) => void;
}

export function TemplateFilters({ onSearchChange, onCategoryChange, onFrameworkChange }: TemplateFiltersProps) {
  const [search, setSearch] = useState('');

  const categories: TemplateCategory[] = [
    'frontend',
    'fullstack',
    'backend',
    'mobile',
    'ai',
    'ecommerce',
    'blog',
    'portfolio',
  ];

  const frameworks: TemplateFramework[] = [
    'react',
    'vue',
    'svelte',
    'next',
    'remix',
    'astro',
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  return (
    <div className="bg-white dark:bg-bg-2 border border-border-primary dark:border-border-primary rounded-xl p-6 shadow-soft">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary dark:text-text-tertiary"
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-bg-4 border border-border-primary dark:border-border-primary rounded-lg text-text-primary dark:text-white placeholder:text-text-tertiary dark:placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-[#e86b47] focus:border-[#e86b47] transition-all"
          />
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-4">
        {/* Category filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
            Category
          </label>
          <select
            onChange={(e) => onCategoryChange(e.target.value ? e.target.value as TemplateCategory : undefined)}
            className="w-full px-4 py-2.5 bg-white dark:bg-bg-4 border border-border-primary dark:border-border-primary rounded-lg text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e86b47] focus:border-[#e86b47] transition-all"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Framework filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
            Framework
          </label>
          <select
            onChange={(e) => onFrameworkChange(e.target.value ? e.target.value as TemplateFramework : undefined)}
            className="w-full px-4 py-2.5 bg-white dark:bg-bg-4 border border-border-primary dark:border-border-primary rounded-lg text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e86b47] focus:border-[#e86b47] transition-all"
          >
            <option value="">All frameworks</option>
            {frameworks.map((framework) => (
              <option key={framework} value={framework}>
                {framework.charAt(0).toUpperCase() + framework.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}



