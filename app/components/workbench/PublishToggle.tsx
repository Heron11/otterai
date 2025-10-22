/**
 * Project Publish Toggle
 * Publishes project to create a public snapshot that auto-syncs on save
 */

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/remix';
import { toast } from 'react-toastify';

interface PublishToggleProps {
  projectId?: string;
  isPublished?: boolean;
  onPublishChange?: (isPublished: boolean) => void;
}

export function PublishToggle({ 
  projectId, 
  isPublished = false, 
  onPublishChange 
}: PublishToggleProps) {
  const { user } = useUser();
  const [published, setPublished] = useState<boolean>(isPublished);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPublished(isPublished);
  }, [isPublished]);

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

  const handlePublishToggle = async () => {
    if (!user || !projectId) {
      toast.error('You must be logged in to publish projects');
      return;
    }

    const newPublishState = !published;
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: newPublishState ? 'publish' : 'unpublish' 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPublished(newPublishState);
        onPublishChange?.(newPublishState);
        
        toast.success(result.message || (newPublishState 
          ? 'Project published! Updates will sync automatically.' 
          : 'Project unpublished'
        ));
      } else {
        toast.error(result.error || 'Failed to update publish status');
      }
    } catch (error) {
      console.error('Publish toggle error:', error);
      toast.error('Failed to update publish status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="publish-toggle flex items-center gap-2">
      <button
        onClick={handlePublishToggle}
        disabled={isUpdating}
        className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#e86b47] focus:ring-offset-2 ${
          published 
            ? 'bg-[#e86b47]' 
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
        aria-label="Toggle project publish status"
        title={published ? 'Unpublish project' : 'Publish project'}
      >
        {/* Slider */}
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            published ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        >
          {/* Icon inside the slider */}
          <span className="flex items-center justify-center h-full w-full">
            {published ? (
              // Globe icon for published
              <svg className="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
            ) : (
              // Lock icon for private
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
            {published 
              ? 'Your project is published. Updates sync automatically when you save.' 
              : 'Publish this project to make it publicly discoverable. Your working version stays private.'
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

