/**
 * View-Only Banner
 * Displays a banner when viewing a public project in read-only mode
 */

import { toast } from 'react-toastify';

interface ViewOnlyBannerProps {
  projectId: string;
  projectName: string;
  onClone?: () => void;
}

export function ViewOnlyBanner({ projectId, projectName, onClone }: ViewOnlyBannerProps) {
  const handleClone = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Project cloned successfully!');
        // Redirect to the cloned project
        window.location.href = result.redirectUrl;
      } else {
        toast.error(result.error || 'Failed to clone project');
      }
    } catch (error) {
      console.error('Clone error:', error);
      toast.error('Failed to clone project');
    }

    if (onClone) {
      onClone();
    }
  };

  return (
    <div className="view-only-banner bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">👁️</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
              View-Only Mode
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              You're viewing <span className="font-medium">{projectName}</span>. Clone this project to make changes.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleClone}
          className="flex items-center gap-2 bg-[#e86b47] hover:bg-[#d45a36] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <span>📋</span>
          <span>Clone to Edit</span>
        </button>
      </div>
    </div>
  );
}
