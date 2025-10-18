import { Link } from '@remix-run/react';
import type { Project } from '~/lib/types/platform/project';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete && window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project.id);
    }
  };

  return (
    <Link
      to={`/?project=${project.id}`}
      className="group relative block aspect-square bg-white dark:bg-bg-2 border border-border-primary dark:border-border-primary rounded-lg p-4 hover:border-[#e86b47]/50 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Delete button - top right corner */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary dark:text-text-secondary hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10 bg-white/10 dark:bg-black/20 backdrop-blur-sm"
          title="Delete project"
        >
          <svg className="w-3.5 h-3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      <div className="relative z-10 h-full flex flex-col">
        {/* Project Icon/Preview */}
        <div className="flex items-center justify-center w-12 h-12 bg-[#e86b47]/10 dark:bg-[#e86b47]/20 rounded-lg mb-3 group-hover:bg-[#e86b47]/20 dark:group-hover:bg-[#e86b47]/30 transition-all">
          <svg className="w-6 h-6 text-[#e86b47]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>

        {/* Project Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-semibold text-text-primary dark:text-white group-hover:text-[#e86b47] transition-colors line-clamp-2 mb-2">
            {project.name}
          </h3>

          {project.description && (
            <p className="text-xs text-text-secondary dark:text-text-secondary mb-3 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Footer - pushed to bottom */}
          <div className="mt-auto">
            {project.templateName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e86b47]/10 dark:bg-[#e86b47]/20 border border-[#e86b47]/20 rounded-full text-[#e86b47] text-xs font-medium mb-2">
                <svg className="w-2.5 h-2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {project.templateName}
              </span>
            )}
            
            <div className="text-xs text-text-tertiary dark:text-text-tertiary truncate" title={project.lastModified.toLocaleString()}>
              {formatDistanceToNow(project.lastModified, { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#e86b47]/5 dark:bg-[#e86b47]/10 rounded-full blur-xl"></div>
    </Link>
  );
}



