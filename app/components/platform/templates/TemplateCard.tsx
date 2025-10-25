import { Link } from '@remix-run/react';
import { memo } from 'react';
import type { Template } from '~/lib/types/platform/template';

interface TemplateCardProps {
  template: Template;
}

export const TemplateCard = memo(function TemplateCard({ template }: TemplateCardProps) {
  // Removed subscription checking - all templates are now accessible
  const hasAccess = true;

  // Removed tier badge logic since all templates are now accessible

  return (
    <div className="group bg-white/80 dark:bg-neutral-900/90 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl dark:hover:shadow-2xl hover:-translate-y-1 hover:border-[#e86b47]/30 dark:hover:border-[#e86b47]/30 cursor-pointer">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 relative overflow-hidden">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            width="1600"
            height="900"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-6xl opacity-20 dark:opacity-30 group-hover:opacity-40 dark:group-hover:opacity-50 transition-opacity duration-500">
              {template.framework === 'react' ? '⚛️' : 
               template.framework === 'next' ? '▲' :
               template.framework === 'vue' ? '🖖' :
               template.framework === 'svelte' ? '🔥' :
               template.framework === 'express' ? '🚀' :
               template.framework === 'astro' ? '⭐' :
               '💻'}
            </div>
          </div>
        )}
        
        {/* Featured badge */}
        {template.featured && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#e86b47]/95 backdrop-blur-sm border border-[#e86b47]/30 rounded-lg text-xs font-semibold text-white shadow-sm">
            Featured
          </div>
        )}
        
        {/* Removed tier badge since all templates are now accessible */}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
          {/* Content in overlay */}
          <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
            {/* Title */}
            <h3 className="text-xl font-semibold text-white mb-3 line-clamp-1">
              {template.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-200 mb-4 line-clamp-2 leading-relaxed">
              {template.description}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{template.usageCount.toLocaleString()} uses</span>
              </div>
              
              {/* Framework tags */}
              <div className="flex gap-1">
                {template.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-xs rounded text-white"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 2 && (
                  <span className="px-2 py-0.5 text-xs text-gray-300">
                    +{template.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Link
                to={`/templates/${template.id}`}
                className="flex-1 px-3 py-2 text-sm text-center border border-white/30 rounded-lg text-white hover:bg-white/20 transition-colors duration-300"
              >
                Preview
              </Link>
              
              <Link
                to={`/?template=${template.id}`}
                className="flex-1 px-3 py-2 text-sm text-center bg-[#e86b47] text-white rounded-lg hover:bg-[#d45a36] transition-all duration-300"
              >
                Use Template
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});


