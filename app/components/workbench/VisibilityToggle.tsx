/**
 * Project Visibility Toggle
 * Allows users to set their project as public or private
 */

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/remix';
import { toast } from 'react-toastify';

interface VisibilityToggleProps {
  projectId?: string;
  currentVisibility?: 'private' | 'public' | 'unlisted';
  onVisibilityChange?: (visibility: 'private' | 'public' | 'unlisted') => void;
}

export function VisibilityToggle({ 
  projectId, 
  currentVisibility = 'private', 
  onVisibilityChange 
}: VisibilityToggleProps) {
  const { user } = useUser();
  const [visibility, setVisibility] = useState<'private' | 'public' | 'unlisted'>(currentVisibility);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setVisibility(currentVisibility);
  }, [currentVisibility]);

  const handleVisibilityChange = async (newVisibility: 'private' | 'public' | 'unlisted') => {
    if (!user || !projectId) {
      toast.error('You must be logged in to change project visibility');
      return;
    }

    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visibility: newVisibility }),
      });

      const result = await response.json();

      if (result.success) {
        setVisibility(newVisibility);
        onVisibilityChange?.(newVisibility);
        
        const messages = {
          private: 'Project is now private',
          public: 'Project is now public and discoverable',
          unlisted: 'Project is unlisted (accessible via link only)'
        };
        
        toast.success(messages[newVisibility]);
      } else {
        toast.error(result.error || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Visibility update error:', error);
      toast.error('Failed to update visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="visibility-toggle flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">Visibility:</span>
      
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => handleVisibilityChange('private')}
          disabled={isUpdating}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            visibility === 'private'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🔒 Private
        </button>
        
        <button
          onClick={() => handleVisibilityChange('unlisted')}
          disabled={isUpdating}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            visibility === 'unlisted'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🔗 Unlisted
        </button>
        
        <button
          onClick={() => handleVisibilityChange('public')}
          disabled={isUpdating}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            visibility === 'public'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🌐 Public
        </button>
      </div>
      
      {isUpdating && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#e86b47]"></div>
      )}
    </div>
  );
}
