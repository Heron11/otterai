import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
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
          emptyMessage="No projects yet. Create your first project to get started!"
        />
      </div>
    </PlatformLayout>
  );
}



