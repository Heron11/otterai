import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { toast } from 'react-toastify';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { PlatformNav } from '~/components/platform/layout/PlatformNav';
import { FloatingUser } from '~/components/platform/layout/FloatingUser';
import { requireAuth } from '~/lib/.server/auth/clerk.server';
import { getDatabase, queryFirst } from '~/lib/.server/db/client';
import type { Project } from '~/lib/types/platform/project';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.project ? `${data.project.name} - OtterAI` : 'Project - OtterAI' },
    { name: 'description', content: 'Work on your project with AI assistance' },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const { params, context } = args;
  const { projectId } = params;

  if (!projectId) {
    throw new Response('Project ID is required', { status: 400 });
  }

  const auth = await requireAuth(args);
  const db = getDatabase(context.cloudflare.env);

  // Load project metadata
  const projectRow = await queryFirst<any>(
    db,
    `SELECT id, user_id, name, description, template_id, template_name, 
            status, created_at, updated_at, preview_url, file_count
     FROM projects 
     WHERE id = ? AND user_id = ?`,
    projectId,
    auth.userId
  );

  if (!projectRow) {
    throw new Response('Project not found', { status: 404 });
  }

  const project: Project = {
    id: projectRow.id,
    userId: projectRow.user_id,
    name: projectRow.name,
    description: projectRow.description,
    templateId: projectRow.template_id,
    templateName: projectRow.template_name,
    status: projectRow.status,
    createdAt: new Date(projectRow.created_at),
    lastModified: new Date(projectRow.updated_at),
    previewUrl: projectRow.preview_url,
  };

  return json({ project, projectId });
}

function ProjectWorkspace() {
  const { project, projectId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isChatInitializing, setIsChatInitializing] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      try {
        // Import client-side modules
        const { loadProjectFiles } = await import('~/lib/services/project-loader.client');
        const { workbenchStore } = await import('~/lib/stores/workbench');
        const { setCurrentProject } = await import('~/lib/stores/project-context');
        
        // Set current project context
        setCurrentProject({
          projectId,
          projectName: project.name,
        });
        
        // Reset workbench to clean state
        await workbenchStore.resetWorkbench();

        // Small delay to ensure WebContainer is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Load project files from R2
        let files: Record<string, string>;
        try {
          files = await loadProjectFiles(projectId);
        } catch (loadError) {
          console.error('Error loading files from API:', loadError);
          
          // Check if it's a "no files" case vs actual error
          if (loadError instanceof Error && loadError.message.includes('404')) {
            files = {};
          } else {
            throw new Error('Failed to load project files');
          }
        }

        if (!mounted) return;

        // Check if we have files
        if (Object.keys(files).length === 0) {
          toast.info('This project has no files yet. Start chatting to create some!');
          setIsLoading(false);
          setIsChatInitializing(false);
          // Still show workbench but empty
          workbenchStore.showWorkbench.set(true);
          return;
        }

        // Load files into workbench (automatically clears if switching projects)
        await workbenchStore.loadProjectFiles(files, project.name, projectId);

        if (!mounted) return;

        setIsLoading(false);
        
        // Brief delay to ensure chat UI has fully initialized
        setTimeout(() => {
          setIsChatInitializing(false);
        }, 800);
        
        toast.success(`Project "${project.name}" loaded successfully with ${Object.keys(files).length} files!`);
          } catch (error) {
            console.error('Failed to load project:', error);
            if (!mounted) return;
            
            setLoadError('Failed to load project');
            setIsLoading(false);
            setIsChatInitializing(false);
            toast.error('Failed to load project');
          }
    }

    loadProject();

    return () => {
      mounted = false;
      
      // Cleanup: Clear project context when leaving
      (async () => {
        const { clearCurrentProject } = await import('~/lib/stores/project-context');
        clearCurrentProject();
      })();
    };
  }, [projectId, project.name]);

  if (loadError) {
    return (
      <div className="flex flex-col h-full w-full bg-bg-3 dark:bg-black">
        <PlatformNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-2">
              Failed to Load Project
            </h2>
            <p className="text-bolt-elements-textSecondary mb-6">
              {loadError}
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="px-6 py-3 bg-[#e86b47] hover:bg-[#d65a38] text-white rounded-lg font-medium transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
        <FloatingUser />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-bg-3 dark:bg-black">
        <PlatformNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e86b47] mb-4"></div>
            <p className="text-bolt-elements-textSecondary">
              Loading project files...
            </p>
          </div>
        </div>
        <FloatingUser />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-bg-3 dark:bg-black relative">
      <PlatformNav />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      <FloatingUser />
      
      {/* Loading overlay - shows on top while chat initializes */}
      {isChatInitializing && (
        <div className="absolute inset-0 z-50 flex flex-col bg-bg-3 dark:bg-black">
          <div className="h-16" /> {/* Space for nav */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e86b47] mb-4"></div>
              <p className="text-bolt-elements-textSecondary">
                Initializing project workspace...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectWorkspace;
