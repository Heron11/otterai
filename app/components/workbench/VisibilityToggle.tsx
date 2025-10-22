/**
 * Project Visibility Toggle
 * Simple Private/Public toggle with slider design
 */

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/remix';
import { toast } from 'react-toastify';

interface VisibilityToggleProps {
  projectId?: string;
  currentVisibility?: 'private' | 'public';
  onVisibilityChange?: (visibility: 'private' | 'public') => void;
}

export function VisibilityToggle({ 
  projectId, 
  currentVisibility = 'private', 
  onVisibilityChange 
}: VisibilityToggleProps) {
  const { user } = useUser();
  const [visibility, setVisibility] = useState<'private' | 'public'>(currentVisibility);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibility(currentVisibility);
  }, [currentVisibility]);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleVisibilityChange = async (newVisibility: 'private' | 'public') => {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setVisibility(newVisibility);
        onVisibilityChange?.(newVisibility);
        
        const messages = {
          private: 'Project is now private',
          public: 'Project is now public and discoverable'
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
      <button
        onClick={() => handleVisibilityChange(visibility === 'private' ? 'public' : 'private')}
        disabled={isUpdating}
        className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#e86b47] focus:ring-offset-2 bg-gray-300 dark:bg-gray-600"
        aria-label="Toggle project visibility"
        title={`Switch to ${visibility === 'private' ? 'public' : 'private'} visibility`}
      >
        {/* Slider */}
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            visibility === 'public' ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        >
          {/* Icon inside the slider */}
          <span className="flex items-center justify-center h-full w-full">
            {visibility === 'public' ? (
              <svg className="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </span>
      </button>
      
      {/* Info icon with tooltip */}
      <div 
        ref={iconRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        <svg 
          className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
      
      {/* Tooltip - positioned absolutely to escape all containers */}
      {showTooltip && (
        <div 
          className="fixed px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg pointer-events-none z-[99999] max-w-xs"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-center leading-relaxed">
            {visibility === 'private' 
              ? 'Your project is only visible to you' 
              : 'Your project is public and discoverable by everyone'
            }
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}
      
      {isUpdating && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#e86b47]"></div>
      )}
    </div>
  );
}
