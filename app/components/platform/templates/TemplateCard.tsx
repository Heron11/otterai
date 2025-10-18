import { Link } from '@remix-run/react';
import type { Template } from '~/lib/types/platform/template';
import { useSubscription } from '~/lib/hooks/platform/useSubscription';

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const { canAccessTemplate } = useSubscription();
  const hasAccess = canAccessTemplate(template.requiredTier);

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-[#e86b47]/20 text-[#e86b47] border-[#e86b47]/30';
      case 'plus':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <div className="group bg-white dark:bg-bg-2 border border-border-primary dark:border-border-primary rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl hover:-translate-y-1 hover:border-[#e86b47]/30 dark:hover:border-[#e86b47]/30 cursor-pointer">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity duration-300">
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
          <div className="absolute top-3 left-3 px-2 py-1 bg-[#e86b47]/90 backdrop-blur-sm border border-[#e86b47]/30 rounded-md text-xs font-medium text-white">
            Featured
          </div>
        )}
        
        {/* Tier badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 border rounded-md text-xs font-medium backdrop-blur-sm ${getTierBadgeColor(template.requiredTier)}`}>
          {template.requiredTier.charAt(0).toUpperCase() + template.requiredTier.slice(1)}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {/* Content in overlay */}
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
              {template.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-200 mb-3 line-clamp-2 leading-relaxed">
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
              
              {hasAccess ? (
                <Link
                  to={`/?template=${template.id}`}
                  className="flex-1 px-3 py-2 text-sm text-center bg-[#e86b47] text-white rounded-lg hover:bg-[#d45a36] transition-all duration-300"
                >
                  Use Template
                </Link>
              ) : (
                <Link
                  to="/pricing"
                  className="flex-1 px-3 py-2 text-sm text-center bg-[#e86b47] text-white rounded-lg hover:bg-[#d45a36] transition-all duration-300"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



