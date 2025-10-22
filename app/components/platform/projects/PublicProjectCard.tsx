/**
 * Public Project Card Component
 * Displays a public project with access controls
 */

import { Link } from '@remix-run/react';
import { AccessIndicator } from '~/components/projects/AccessIndicator';
import type { ProjectAccess } from '~/lib/.server/projects/access-control';

interface PublicProject {
  id: string;
  name: string;
  description: string;
  viewCount: number;
  cloneCount: number;
  createdAt: string;
  updatedAt: string;
  templateName?: string;
  author: {
    name: string;
    imageUrl?: string;
  };
}

interface PublicProjectCardProps {
  project: PublicProject;
  access: ProjectAccess;
  onClone?: (projectId: string) => void;
}

export function PublicProjectCard({ project, access, onClone }: PublicProjectCardProps) {
  const handleClone = () => {
    if (onClone) {
      onClone(project.id);
    }
  };

  return (
    <div className="project-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Access indicators */}
      <div className="access-indicators p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="public-badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
              🌐 Public
            </span>
            {access.isCloned && (
              <span className="cloned-badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                ✅ You have a copy
              </span>
            )}
          </div>
          <AccessIndicator access={access} />
        </div>
      </div>
      
      {/* Project content */}
      <div className="project-content p-4 pt-2">
        <div className="flex items-start gap-3 mb-3">
          {project.author.imageUrl && (
            <img
              src={project.author.imageUrl}
              alt={project.author.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              by {project.author.name}
            </p>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {project.description}
        </p>
        
        {project.templateName && (
          <div className="mb-3">
            <span className="template-badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
              📋 {project.templateName}
            </span>
          </div>
        )}
        
        {/* Stats */}
        <div className="stats flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            👁️ {project.viewCount}
          </span>
          <span className="flex items-center gap-1">
            📋 {project.cloneCount}
          </span>
          <span className="flex items-center gap-1">
            🕒 {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="actions p-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Link
            to={`/projects/${project.id}/preview`}
            className="preview-button flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
          >
            Preview
          </Link>
          
          {access.canClone && !access.isCloned ? (
            <button
              onClick={handleClone}
              className="clone-button bg-[#e86b47] hover:bg-[#d45a36] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Clone
            </button>
          ) : access.isCloned && access.clonedProjectId ? (
            <Link
              to={`/chat/${access.clonedProjectId}`}
              className="edit-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Edit Your Copy
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
