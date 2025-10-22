/**
 * Project Preview Page
 * Shows a read-only preview of a public project
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { ViewOnlyPreview } from '~/components/projects/ViewOnlyPreview';
import { AccessIndicator } from '~/components/projects/AccessIndicator';
import type { ProjectAccess } from '~/lib/.server/projects/access-control';
import type { FileMap } from '~/utils/zip';

export async function loader({ params, context, ...args }: LoaderFunctionArgs) {
  // Import server-only modules inside the function
  const { getOptionalUserId } = await import('~/lib/.server/auth/clerk.server');
  const { getDatabase } = await import('~/lib/.server/db/client');
  const { checkProjectAccess, logProjectAccess } = await import('~/lib/.server/projects/access-control');
  const { getProjectFiles } = await import('~/lib/.server/storage/r2');

  const userId = await getOptionalUserId(args);
  const { projectId } = params;

  if (!projectId) {
    throw new Response('Project ID is required', { status: 400 });
  }

  const db = getDatabase(context.cloudflare.env);
  const bucket = context.cloudflare.env.R2_BUCKET;

  // Check access permissions
  const access = await checkProjectAccess(db, projectId, userId);

  if (!access.canView) {
    throw new Response('Access denied', { status: 403 });
  }

  // Get project details
  const project = await db.prepare(
    `SELECT p.*, u.first_name, u.last_name, u.image_url
     FROM projects p
     LEFT JOIN users u ON p.user_id = u.id
     WHERE p.id = ?`
  ).bind(projectId).first<{
    id: string;
    name: string;
    description: string;
    template_name: string;
    view_count: number;
    clone_count: number;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    image_url: string;
  }>();

  if (!project) {
    throw new Response('Project not found', { status: 404 });
  }

  // Load files from R2
  const files = await getProjectFiles(bucket, projectId);

  // Log the view action
  await logProjectAccess(
    db,
    projectId,
    userId,
    'view',
    args.request.headers.get('x-forwarded-for') || undefined,
    args.request.headers.get('user-agent') || undefined
  );

  // Update view count
  await db.prepare(
    'UPDATE projects SET view_count = view_count + 1 WHERE id = ?'
  ).bind(projectId).run();

  return json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      templateName: project.template_name,
      viewCount: project.view_count + 1, // +1 because we just incremented
      cloneCount: project.clone_count,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      author: {
        name: `${project.first_name} ${project.last_name}`.trim() || 'Anonymous',
        imageUrl: project.image_url
      }
    },
    files,
    access
  });
}

export default function ProjectPreview() {
  const { project, files, access } = useLoaderData<typeof loader>();

  const handleClone = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to the cloned project
        window.location.href = result.redirectUrl;
      } else {
        alert(result.error || 'Failed to clone project');
      }
    } catch (error) {
      console.error('Clone error:', error);
      alert('Failed to clone project');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/projects"
              className="text-[#e86b47] hover:text-[#d45a36] transition-colors"
            >
              ← Back to Projects
            </Link>
            <AccessIndicator access={access} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {project.name}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>by {project.author.name}</span>
            <span>•</span>
            <span>👁️ {project.viewCount} views</span>
            <span>•</span>
            <span>📋 {project.cloneCount} clones</span>
            <span>•</span>
            <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
          
          {project.description && (
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              {project.description}
            </p>
          )}
        </div>

        {/* Preview */}
        <ViewOnlyPreview
          projectId={project.id}
          files={files}
          access={access}
          onClone={handleClone}
        />

        {/* Project Info */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Project Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Template</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {project.templateName || 'Custom Project'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Created</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Files</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {Object.keys(files).length} files
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Status</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {access.isOwner ? 'Owner' : access.isCloned ? 'You have a copy' : 'View Only'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
