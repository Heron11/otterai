import { Link } from '@remix-run/react';
import type { Project } from '~/lib/types/platform/project';
import { format } from 'date-fns';

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
      to={`/project/${project.id}`}
      className="group relative block aspect-square bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-neutral-200/50 dark:border-white/10 rounded-2xl p-6 hover:border-[#e86b47]/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
    >
      {/* Delete button - top right corner */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 p-1.5 text-neutral-500 dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 backdrop-blur-sm"
          title="Delete project"
        >
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      <div className="relative z-10 h-full flex flex-col">
        {/* Status dot - Top left corner */}
        <div className="absolute top-0 left-0">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        {/* Project Icon - Centered at top */}
        <div className="flex items-center justify-center mb-2 mt-1">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#e86b47] to-[#d45a36] rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg overflow-hidden">
            <img 
              src="/lightmodeavatar.svg" 
              alt="OtterAI" 
              className="w-10 h-10"
            />
          </div>
        </div>

        {/* Project Title - Centered, single line */}
        <h3 className="text-center text-base font-semibold text-text-primary dark:text-white group-hover:text-[#e86b47] transition-colors line-clamp-1 mb-3 leading-tight px-2">
          {project.name}
        </h3>

        {/* Spacer */}
        <div className="flex-1 min-h-[8px]"></div>

        {/* Footer - Timestamp and template badge */}
        <div className="space-y-1.5">
          {/* Template badge - Small badge if exists */}
          {project.templateName && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e86b47]/90 dark:bg-[#e86b47]/80 backdrop-blur-sm border border-[#e86b47]/30 rounded-md shadow-sm">
                <svg className="w-2.5 h-2.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-[11px] font-medium text-white truncate max-w-[90px]">
                  {project.templateName}
                </span>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-[9px] text-text-tertiary dark:text-white/40 font-medium uppercase tracking-wide leading-tight">
              Last edited
            </div>
            <div className="text-[11px] text-text-secondary dark:text-white/70 font-semibold leading-tight mt-0.5">
              {format(project.lastModified, 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle background decoration */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#e86b47]/5 to-transparent dark:from-[#e86b47]/10 dark:to-transparent rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#e86b47]/5 dark:to-[#e86b47]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </Link>
  );
}



