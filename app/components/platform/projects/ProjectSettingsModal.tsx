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
  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRepublishing, setIsRepublishing] = useState(false);
  const [projectIcon, setProjectIcon] = useState<string | null>(project.iconUrl || null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'visibility' | 'advanced'>('general');
  const fetcher = useFetcher();

  const handleGeneralUpdate = async () => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project details');
      }

      alert('Project details updated successfully!');
    } catch (error) {
      console.error('Error updating project details:', error);
      alert('Failed to update project details. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVisibilityChange = async (newVisibility: 'private' | 'public') => {
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
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-full max-w-4xl mx-4 p-0 overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Project Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-[#e86b47] dark:hover:text-[#e86b47] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Project Info */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">{project.name}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Created {new Date(project.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Vertical Menu Bar */}
          <div className="w-52 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
            <nav className="flex-1 py-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'general'
                    ? 'text-[#e86b47] bg-[#e86b47]/10 dark:bg-[#e86b47]/20 rounded-l-none rounded-r-full border-l-4 border-[#e86b47] shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 bg-transparent dark:bg-neutral-900 hover:text-[#e86b47] dark:hover:text-[#e86b47] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-l-none rounded-r-full'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                General
              </button>
              
              <button
                onClick={() => setActiveTab('visibility')}
                className={`w-full flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'visibility'
                    ? 'text-[#e86b47] bg-[#e86b47]/10 dark:bg-[#e86b47]/20 rounded-l-none rounded-r-full border-l-4 border-[#e86b47] shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 bg-transparent dark:bg-neutral-900 hover:text-[#e86b47] dark:hover:text-[#e86b47] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-l-none rounded-r-full'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visibility
              </button>
              
              <button
                onClick={() => setActiveTab('advanced')}
                className={`w-full flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'advanced'
                    ? 'text-[#e86b47] bg-[#e86b47]/10 dark:bg-[#e86b47]/20 rounded-l-none rounded-r-full border-l-4 border-[#e86b47] shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 bg-transparent dark:bg-neutral-900 hover:text-[#e86b47] dark:hover:text-[#e86b47] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-l-none rounded-r-full'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Advanced
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">General Settings</h3>
              
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-[#e86b47] focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 transition-all duration-200"
                  placeholder="Enter project name"
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-[#e86b47] focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 transition-all duration-200 resize-none"
                  placeholder="Describe your project..."
                />
              </div>

              {/* Project Icon */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-3">
                  Project Icon
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-neutral-200/50 dark:border-white/10 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                    {projectIcon ? (
                      <img 
                        src={projectIcon} 
                        alt="Project icon" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src="/lightmodeavatar.svg" 
                        alt="Default icon" 
                        className="w-8 h-8"
                      />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="icon-upload"
                      accept="image/png,image/jpeg,image/gif"
                      onChange={handleIconUpload}
                      className="hidden"
                      disabled={isUploadingIcon}
                    />
                    <label
                      htmlFor="icon-upload"
                      className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 ${
                        isUploadingIcon
                          ? 'bg-neutral-100 dark:bg-white/10 text-text-tertiary dark:text-white/50 cursor-not-allowed'
                          : 'bg-[#e86b47] hover:bg-[#d45a36] hover:shadow-lg text-white shadow-sm'
                      }`}
                    >
                      {isUploadingIcon ? (
                        <>
                          <div className="w-4 h-4 border-2 border-text-tertiary dark:border-white/50 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Change Icon
                        </>
                      )}
                    </label>
                    <p className="text-xs text-text-tertiary dark:text-white/50 mt-1">PNG, JPG, or GIF. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleGeneralUpdate}
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-[#e86b47] hover:bg-[#d45a36] disabled:bg-neutral-300 dark:disabled:bg-white/20 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'visibility' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">Visibility Settings</h3>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-neutral-200/50 dark:border-white/10 rounded-xl hover:bg-[#e86b47]/5 dark:hover:bg-[#e86b47]/10 cursor-pointer transition-all duration-200 bg-white/80 dark:bg-white/5 backdrop-blur-sm">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={() => handleVisibilityChange('private')}
                    disabled={isUpdating}
                    className="w-4 h-4 text-[#e86b47] border-neutral-300 dark:border-white/20 focus:ring-[#e86b47] focus:ring-2"
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-text-primary dark:text-white">Private</div>
                    <div className="text-xs text-text-tertiary dark:text-white/50">Only you can see this project</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-neutral-200/50 dark:border-white/10 rounded-xl hover:bg-[#e86b47]/5 dark:hover:bg-[#e86b47]/10 cursor-pointer transition-all duration-200 bg-white/80 dark:bg-white/5 backdrop-blur-sm">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={() => handleVisibilityChange('public')}
                    disabled={isUpdating}
                    className="w-4 h-4 text-[#e86b47] border-neutral-300 dark:border-white/20 focus:ring-[#e86b47] focus:ring-2"
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-text-primary dark:text-white">Public</div>
                    <div className="text-xs text-text-tertiary dark:text-white/50">Anyone can view and clone this project</div>
                  </div>
                </label>

              </div>

              {/* Publishing Section - Only show for public projects */}
              {visibility === 'public' && (
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Publishing</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Create a new snapshot of your current project to update the public template. This will create a frozen version that others can clone.
                  </p>
                  <button
                    onClick={handleRepublish}
                    disabled={isRepublishing || visibility !== 'public'}
                    className="w-full bg-[#e86b47] hover:bg-[#d45a36] disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {isRepublishing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Republishing...
                      </div>
                    ) : (
                      'Republish Project'
                    )}
                  </button>
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
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Settings</h3>
              
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Coming Soon</h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Advanced settings like custom domains, webhooks, and more will be available here.
                </p>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
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