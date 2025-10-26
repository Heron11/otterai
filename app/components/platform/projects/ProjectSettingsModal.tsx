import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import type { Project } from '~/lib/types/platform/project';

interface ProjectSettingsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSettingsModal({ project, isOpen, onClose }: ProjectSettingsModalProps) {
  const [visibility, setVisibility] = useState<'private' | 'public' | 'unlisted'>(project.visibility || 'private');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRepublishing, setIsRepublishing] = useState(false);
  const [projectIcon, setProjectIcon] = useState<string | null>(project.iconUrl || null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const fetcher = useFetcher();

  const handleVisibilityChange = async (newVisibility: 'private' | 'public' | 'unlisted') => {
    setVisibility(newVisibility);
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visibility: newVisibility,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project visibility');
      }
    } catch (error) {
      console.error('Error updating project visibility:', error);
      // Revert on error
      setVisibility(project.visibility || 'private');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRepublish = async () => {
    if (visibility !== 'public') return;
    
    setIsRepublishing(true);
    
    try {
      const response = await fetch(`/api/projects/${project.id}/republish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to republish project');
      }

      const result = await response.json();
      console.log('Project republished:', result);
      
      // You could show a success message here
      alert(`Project republished successfully! New version: ${result.snapshot.version}`);
    } catch (error) {
      console.error('Error republishing project:', error);
      alert('Failed to republish project. Please try again.');
    } finally {
      setIsRepublishing(false);
    }
  };

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Please select a JPG, PNG, GIF, or WebP image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB');
      return;
    }

    setIsUploadingIcon(true);

    try {
      const formData = new FormData();
      formData.append('icon', file);

      const response = await fetch(`/api/projects/${project.id}/icon`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload icon');
      }

      const result = await response.json();
      setProjectIcon(result.iconUrl);
      
      // Show success message
      alert('Project icon updated successfully!');
    } catch (error) {
      console.error('Error uploading icon:', error);
      alert('Failed to upload icon. Please try again.');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Project Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
            
            {/* Snapshot Info */}
            {project.snapshotId && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Public Snapshot
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Version {project.snapshotVersion} • 
                  Published {project.snapshotCreatedAt ? new Date(project.snapshotCreatedAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            )}
          </div>

          {/* Visibility Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Visibility
            </h4>
            <div className="space-y-3">
              {/* Private */}
              <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => handleVisibilityChange('private')}
                  disabled={isUpdating}
                  className="w-4 h-4 text-[#e86b47] border-gray-300 focus:ring-[#e86b47]"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Private
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Only you can see this project
                  </div>
                </div>
              </label>

              {/* Public */}
              <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => handleVisibilityChange('public')}
                  disabled={isUpdating}
                  className="w-4 h-4 text-[#e86b47] border-gray-300 focus:ring-[#e86b47]"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Public
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Anyone can view and clone this project
                  </div>
                </div>
              </label>

              {/* Unlisted */}
              <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="unlisted"
                  checked={visibility === 'unlisted'}
                  onChange={() => handleVisibilityChange('unlisted')}
                  disabled={isUpdating}
                  className="w-4 h-4 text-[#e86b47] border-gray-300 focus:ring-[#e86b47]"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Unlisted
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Only people with the link can view this project
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Republish Section */}
          {visibility === 'public' && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Publishing
              </h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                {/* Project Icon Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                    Project Icon
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Current Icon Preview */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {projectIcon ? (
                        <img 
                          src={projectIcon} 
                          alt="Project icon" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleIconUpload}
                        disabled={isUploadingIcon}
                        className="hidden"
                        id="icon-upload"
                      />
                      <label
                        htmlFor="icon-upload"
                        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border cursor-pointer transition-colors ${
                          isUploadingIcon
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                        }`}
                      >
                        {isUploadingIcon ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {projectIcon ? 'Change Icon' : 'Upload Icon'}
                          </>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        PNG, JPG, or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Republish Button */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Create a new snapshot of your current project to update the public template.
                    This will create a frozen version that others can clone.
                  </p>
                  <button
                    onClick={handleRepublish}
                    disabled={isRepublishing || isUpdating}
                    className="w-full px-4 py-2 bg-[#e86b47] text-white text-sm font-medium rounded-lg hover:bg-[#d45a36] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isRepublishing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Snapshot...
                      </div>
                    ) : (
                      'Republish Project'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status indicator */}
          {isUpdating && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-[#e86b47] border-t-transparent rounded-full animate-spin"></div>
              Updating visibility...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
