import type { MetaFunction } from '@remix-run/cloudflare';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { ProjectGrid } from '~/components/platform/projects/ProjectGrid';
import { useStore } from '@nanostores/react';
import { projectsStore, deleteProject } from '~/lib/stores/platform/projects';

export const meta: MetaFunction = () => {
  return [
    { title: 'Projects - OtterAI' },
    { name: 'description', content: 'Manage your projects' },
  ];
};

export default function ProjectsPage() {
  const projects = useStore(projectsStore);
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <PlatformLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bolt-elements-textPrimary mb-4">
            My Projects
          </h1>
          <p className="text-lg text-bolt-elements-textSecondary">
            {activeProjects.length} active {activeProjects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        <ProjectGrid
          projects={activeProjects}
          onDeleteProject={deleteProject}
          emptyMessage="No projects yet. Create your first project to get started!"
        />
      </div>
    </PlatformLayout>
  );
}



