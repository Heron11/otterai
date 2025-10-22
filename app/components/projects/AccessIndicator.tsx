/**
 * Access Indicator Component
 * Shows the current access level for a project
 */

import type { ProjectAccess } from '~/lib/.server/projects/access-control';

interface AccessIndicatorProps {
  access: ProjectAccess;
  className?: string;
}

export function AccessIndicator({ access, className = '' }: AccessIndicatorProps) {
  if (access.isOwner) {
    return (
      <div className={`access-indicator owner ${className}`}>
        <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
          👑 Owner
        </span>
        <span className="description text-xs text-gray-600 dark:text-gray-400">
          Full access
        </span>
      </div>
    );
  }
  
  if (access.isCloned) {
    return (
      <div className={`access-indicator cloned ${className}`}>
        <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
          ✅ Your Copy
        </span>
        <span className="description text-xs text-gray-600 dark:text-gray-400">
          Full edit access
        </span>
      </div>
    );
  }
  
  if (access.canView) {
    return (
      <div className={`access-indicator viewer ${className}`}>
        <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
          👁️ View Only
        </span>
        <span className="description text-xs text-gray-600 dark:text-gray-400">
          Read-only access
        </span>
      </div>
    );
  }
  
  return (
    <div className={`access-indicator denied ${className}`}>
      <span className="badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
        🚫 No Access
      </span>
      <span className="description text-xs text-gray-600 dark:text-gray-400">
        Access denied
      </span>
    </div>
  );
}
