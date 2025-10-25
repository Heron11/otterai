import { memo } from 'react';
import type { Template } from '~/lib/types/platform/template';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
  templates: Template[];
  emptyMessage?: string;
}

export const TemplateGrid = memo(function TemplateGrid({ 
  templates, 
  emptyMessage = "No templates available." 
}: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-30">📂</div>
        <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-2">
          No Templates Found
        </h3>
        <p className="text-text-secondary dark:text-white/70 max-w-md mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
});