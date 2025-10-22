import { memo } from 'react';
import type { Template } from '~/lib/types/platform/template';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
  templates: Template[];
  emptyMessage?: string;
}

export const TemplateGrid = memo(function TemplateGrid({ templates, emptyMessage = 'No templates found' }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative">
          <div className="text-8xl mb-6 opacity-30">📦</div>
          <div className="absolute inset-0 bg-[#e86b47]/10 rounded-full blur-2xl"></div>
        </div>
        <p className="text-text-secondary dark:text-white/70 text-lg mb-6">{emptyMessage}</p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#e86b47]/10 dark:bg-[#e86b47]/20 border border-[#e86b47]/20 rounded-full">
          <span className="text-[#e86b47] text-sm font-medium">Browse our template library</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
});



