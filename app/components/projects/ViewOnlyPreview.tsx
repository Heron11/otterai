/**
 * View-Only Preview Component
 * Shows a read-only preview of a public project
 */

import { useState, useEffect } from 'react';
import { AccessIndicator } from './AccessIndicator';
import type { ProjectAccess } from '~/lib/.server/projects/access-control';
import type { FileMap } from '~/utils/zip';

interface ViewOnlyPreviewProps {
  projectId: string;
  files: FileMap;
  access: ProjectAccess;
  onClone?: () => void;
}

export function ViewOnlyPreview({ projectId, files, access, onClone }: ViewOnlyPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!access.canView) {
      setError('Access denied');
      setIsLoading(false);
      return;
    }
    
    // Start read-only preview
    startReadOnlyPreview(projectId, files)
      .then(url => {
        setPreviewUrl(url);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [projectId, files, access.canView]);
  
  const handleClone = () => {
    if (onClone) {
      onClone();
    }
  };
  
  if (isLoading) {
    return (
      <div className="preview-loading flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e86b47] mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 mb-2">Loading preview...</p>
        <AccessIndicator access={access} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="preview-error flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-red-700 dark:text-red-400 mb-2">Preview failed: {error}</p>
        <AccessIndicator access={access} />
      </div>
    );
  }
  
  return (
    <div className="view-only-preview bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="preview-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="access-indicators flex items-center gap-2">
          <AccessIndicator access={access} />
          {access.canClone && !access.isCloned && (
            <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
              📋 Clone Available
            </span>
          )}
        </div>
        
        {access.canClone && !access.isCloned && (
          <button
            onClick={handleClone}
            className="clone-button bg-[#e86b47] hover:bg-[#d45a36] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📋 Clone Project
          </button>
        )}
      </div>
      
      <div className="preview-content">
        <iframe
          src={previewUrl || undefined}
          className="w-full h-96 border-0"
          title={`Preview of ${projectId}`}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
      
      {access.canClone && !access.isCloned && (
        <div className="clone-prompt p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
          <p className="text-blue-700 dark:text-blue-400 text-sm mb-3">
            Want to edit this project? Clone it to get full access!
          </p>
          <button
            onClick={handleClone}
            className="clone-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📋 Clone Project
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Start a read-only preview session
 * This would integrate with your WebContainer system
 */
async function startReadOnlyPreview(projectId: string, files: FileMap): Promise<string> {
  // This is a placeholder implementation
  // In a real implementation, you would:
  // 1. Start a WebContainer instance
  // 2. Load the files into it
  // 3. Start the development server
  // 4. Return the preview URL
  
  // For now, return a placeholder URL
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`/preview/${projectId}`);
    }, 1000);
  });
}
