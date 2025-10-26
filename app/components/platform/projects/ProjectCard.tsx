import { Link } from '@remix-run/react';
import { useState } from 'react';
import type { Project } from '~/lib/types/platform/project';
import { format } from 'date-fns';
import { ProjectSettingsModal } from './ProjectSettingsModal';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  showSettings?: boolean;
  onOpenModal?: (project: Project) => void;
  useModal?: boolean;
}

export function ProjectCard({ project, onDelete, isDeleting = false, showSettings = true, onOpenModal, useModal = false }: ProjectCardProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete && window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project.id);
    }
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSettingsModal(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (useModal && onOpenModal) {
      e.preventDefault();
      onOpenModal(project);
    }
  };

  const CardWrapper = useModal ? 'div' : Link;
  const cardProps = useModal 
    ? { onClick: handleCardClick }
    : { to: `/project/${project.id}` };

  return (
    <>
      <CardWrapper
        {...cardProps}
        className={`group relative block aspect-square bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-neutral-200/50 dark:border-white/10 rounded-2xl p-6 hover:border-[#e86b47]/30 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden cursor-pointer ${
          isDeleting ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {/* Action buttons - top right corner */}
        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-all duration-200">
          {/* Delete button */}
          {onDelete && !isDeleting && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 rounded-lg bg-transparent hover:bg-red-50 dark:hover:bg-red-950/30 backdrop-blur-sm border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
              title="Delete project"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                </svg>
            </button>
          )}

          {/* Settings button - only show if showSettings is true */}
          {showSettings && (
            <button
              onClick={handleSettings}
              className="p-2 text-gray-400 dark:text-gray-600 hover:text-[#e86b47] dark:hover:text-[#e86b47] transition-all duration-200 rounded-lg bg-transparent hover:bg-[#e86b47]/10 dark:hover:bg-[#e86b47]/10 backdrop-blur-sm border border-transparent hover:border-[#e86b47]/20 dark:hover:border-[#e86b47]/20"
              title="Project settings"
            >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
            </button>
          )}
        </div>

        {/* Loading indicator when deleting */}
        {isDeleting && (
          <div className="absolute top-3 right-3 z-20 p-2">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col">
          {/* Status dot - Top left corner */}
          <div className="absolute top-0 left-0">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          {/* Project Icon - Centered at top */}
          <div className="flex items-center justify-center mb-2 mt-1">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#e86b47] to-[#d45a36] rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg overflow-hidden">
              {project.iconUrl ? (
                <img 
                  src={project.iconUrl} 
                  alt={project.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src="/lightmodeavatar.svg" 
                  alt="OtterAI" 
                  className="w-10 h-10"
                />
              )}
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
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
      </CardWrapper>

      {/* Settings Modal */}
      <ProjectSettingsModal
        project={project}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
}