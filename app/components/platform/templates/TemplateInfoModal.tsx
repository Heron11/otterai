import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@remix-run/react';
import type { Project } from '~/lib/types/platform/project';

interface TemplateInfoModalProps {
  template: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateInfoModal({ template, isOpen, onClose }: TemplateInfoModalProps) {
  const [isCloning, setIsCloning] = useState(false);
  const [viewCount, setViewCount] = useState(template.view_count || 0);

  // Track view when modal opens
  useEffect(() => {
    if (isOpen && template.visibility === 'public') {
      const trackView = async () => {
        try {
          const response = await fetch('/api/projects/increment-view', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              projectId: template.id
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setViewCount(prev => prev + 1);
            }
          }
        } catch (error) {
          console.error('Failed to track view:', error);
          // Don't show error to user, just fail silently
        }
      };

      trackView();
    }
  }, [isOpen, template.id, template.visibility]);

  const handleUseTemplate = async () => {
    setIsCloning(true);
    
    try {
      const response = await fetch('/api/projects/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceProjectId: template.id,
          newProjectName: `${template.name} (Clone)`
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to clone template';
        
        if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a few minutes before cloning more templates.';
        } else if (response.status === 404) {
          errorMessage = 'Template not found or no longer available.';
        } else if (response.status === 401) {
          errorMessage = 'Please log in to clone templates.';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Close modal and redirect to the new project
      onClose();
      
      // Add a small delay to ensure the server has processed the clone
      setTimeout(() => {
        window.location.href = `/project/${result.project.id}`;
      }, 500);
    } catch (error) {
      console.error('Error cloning template:', error);
      alert(error instanceof Error ? error.message : 'Failed to clone template. Please try again.');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="relative p-8 border-b border-gray-200 dark:border-gray-700">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Template Icon and Title */}
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#e86b47] to-[#d45a36] rounded-2xl flex items-center justify-center shadow-lg">
                        {template.iconUrl ? (
                          <img 
                            src={template.iconUrl} 
                            alt={template.name} 
                            className="w-16 h-16 object-cover rounded-xl"
                          />
                        ) : (
                          <img 
                            src="/lightmodeavatar.svg" 
                            alt="OtterAI" 
                            className="w-12 h-12"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {template.name}
                      </h2>
                      {template.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Template Stats */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Views</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {viewCount}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Clones</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {template.clone_count || 0}
                      </div>
                    </div>

                    {/* File Count */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Files</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {template.fileCount || 0}
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="space-y-4 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        About this template
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        This template provides a solid foundation for your project. Once you use it, you'll get a complete copy that you can customize and build upon. All the files and structure will be ready for you to start developing.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Last updated: {new Date(template.lastModified).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUseTemplate}
                      disabled={isCloning}
                      className="flex-1 px-6 py-3 bg-[#e86b47] hover:bg-[#d45a36] disabled:bg-[#e86b47]/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isCloning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating Project...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Use Template
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
