import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { ProjectGrid } from '~/components/platform/projects/ProjectGrid';
import { requireAuth } from '~/lib/.server/auth/clerk.server';
import { getDatabase, execute } from '~/lib/.server/db/client';
import { getUserProjects } from '~/lib/.server/projects/queries';
import { useState } from 'react';

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

export async function action(args: ActionFunctionArgs) {
  const { request, context } = args;
  const auth = await requireAuth(args);
  const db = getDatabase(context.cloudflare.env);

  const formData = await request.formData();
  const projectId = formData.get('projectId') as string;
  const action = formData.get('_action') as string;

  if (action === 'delete' && projectId) {
    try {
      // Verify user owns this project
      const project = await db.prepare(
        'SELECT id FROM projects WHERE id = ? AND user_id = ?'
      ).bind(projectId, auth.userId).first();

      if (!project) {
        return json({ error: 'Project not found' }, { status: 404 });
      }

      // Delete project files from R2 (if any)
      // Note: R2 cleanup would be handled by a background job in production
      
      // Delete project from database
      await execute(
        db,
        'DELETE FROM projects WHERE id = ? AND user_id = ?',
        projectId,
        auth.userId
      );

      return json({ success: true });
    } catch (error) {
      console.error('Error deleting project:', error);
      return json({ error: 'Failed to delete project' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function ProjectsPage() {
  const { projects } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [deletingProjects, setDeletingProjects] = useState<Set<string>>(new Set());
  
  const activeProjects = projects.filter(p => p.status === 'active');

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProjects(prev => new Set(prev).add(projectId));
    
    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('_action', 'delete');
      
      const response = await fetch('/projects', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // Reload the page to refresh the project list
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to delete project: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
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
              {activeProjects.length} active {activeProjects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>

          <ProjectGrid
            projects={activeProjects}
            onDeleteProject={handleDeleteProject}
            deletingProjects={deletingProjects}
            emptyMessage="No projects yet. Create your first project to get started!"
          />
        </div>
      </div>
    </PlatformLayout>
  );
}



