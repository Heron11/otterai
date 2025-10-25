import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { ProjectGrid } from '~/components/platform/projects/ProjectGrid';
import { requireAuth } from '~/lib/.server/auth/clerk.server';
import { getDatabase } from '~/lib/.server/db/client';
import { getUserProjects } from '~/lib/.server/projects/queries';

export const meta: MetaFunction = () => {
  return [
    { title: 'Projects - OtterAI' },
    { name: 'description', content: 'Manage your projects' },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const { context } = args;
  const auth = await requireAuth(args);
  const db = getDatabase(context.cloudflare.env);

  const projects = await getUserProjects(db, auth.userId!);

  return json({ projects });
}

export default function ProjectsPage() {
  const { projects } = useLoaderData<typeof loader>();
  const [localProjects, setLocalProjects] = useState(projects.filter(p => p.status === 'active'));
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteProject = async (projectId: string) => {
    if (deletingId) return; // Prevent multiple deletes at once
    
    setDeletingId(projectId);
    
    try {
      console.log(`Deleting project: ${projectId}`);
      
      // Call delete API
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        data = { error: 'Invalid response from server' };
      }

      console.log('Delete response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || data.details || `Server error: ${response.status}`);
      }

      // Remove from UI after successful deletion
      setLocalProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
      
      console.log(`Project ${projectId} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PlatformLayout>
      <div className="bg-bg-1 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bolt-elements-textPrimary mb-4">
              My Projects
            </h1>
            <p className="text-lg text-bolt-elements-textSecondary">
              {localProjects.length} active {localProjects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>

          <ProjectGrid
            projects={localProjects}
            onDeleteProject={handleDeleteProject}
            emptyMessage="No projects yet. Create your first project to get started!"
          />
        </div>
      </div>
    </PlatformLayout>
  );
}



