import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { PlatformNav } from '~/components/platform/layout/PlatformNav';
import { FloatingUser } from '~/components/platform/layout/FloatingUser';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const projectName = data?.project?.name || 'Project';
  return [
    { title: `${projectName} - OtterAI` }, 
    { name: 'description', content: `Work on ${projectName} with AI-powered development` }
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const { params, context } = args;
  const { projectId } = params;
  
  if (!projectId) {
    throw new Response('Project ID is required', { status: 400 });
  }

  // Import server-only modules inside the function
  const { requireAuth } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { getProjectById } = await import('~/lib/.server/projects/queries');
  const { getProjectFiles } = await import('~/lib/.server/storage/r2');

  try {
    const auth = await requireAuth(args);
    const db = getDatabase(context.cloudflare.env);
    const bucket = context.cloudflare.env.R2_BUCKET;

    // Get project details
    const project = await getProjectById(db, projectId, auth.userId!);
    
    if (!project) {
      throw new Response('Project not found', { status: 404 });
    }

    // Load project files from R2
    const files = await getProjectFiles(bucket, projectId);

    return json({ 
      project,
      files,
      hasProject: true,
      loadingProject: false // Files are already loaded server-side
    });
  } catch (error) {
    console.error('Failed to load project:', error);
    throw new Response('Failed to load project', { status: 500 });
  }
}

export default function ProjectPage() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="flex flex-col h-full w-full bg-bg-3 dark:bg-black">
      <PlatformNav />
      <ClientOnly fallback={<BaseChat />}>
        {() => <Chat projectData={data} />}
      </ClientOnly>
      <FloatingUser />
    </div>
  );
}
