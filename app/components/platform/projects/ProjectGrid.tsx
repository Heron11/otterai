import { memo } from 'react';
import type { Project } from '~/lib/types/platform/project';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  onDeleteProject?: (id: string) => void;
  emptyMessage?: string;
  deletingProjects?: Set<string>;
  showSettings?: boolean;
}

export const ProjectGrid = memo(function ProjectGrid({ projects, onDeleteProject, emptyMessage = 'No projects yet', deletingProjects = new Set(), showSettings = true }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative">
          <div className="text-8xl mb-6 opacity-30">📁</div>
          <div className="absolute inset-0 bg-[#e86b47]/10 rounded-full blur-2xl"></div>
        </div>
        <p className="text-text-secondary dark:text-white/70 text-lg mb-6">{emptyMessage}</p>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#e86b47]/10 dark:bg-[#e86b47]/20 border border-[#e86b47]/20 rounded-full">
          <span className="text-[#e86b47] text-sm font-medium">Create your first project to get started</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={onDeleteProject}
          isDeleting={deletingProjects.has(project.id)}
          showSettings={showSettings}
        />
      ))}
    </div>
  );
});



