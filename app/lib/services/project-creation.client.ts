/**
 * Project creation service for client-side template handling
 */

import { toast } from 'react-toastify';
import { workbenchStore } from '~/lib/stores/workbench';
import { chatId } from '~/lib/persistence';

interface CreateProjectOptions {
  templateId: string;
  templateName: string;
  files: Record<string, any>;
  userId?: string;
}

/**
 * Create a project from a template
 */
export async function createProjectFromTemplate(options: CreateProjectOptions) {
  const { templateId, templateName, files, userId } = options;
  
  try {
    // Generate a unique project name
    const projectName = `${templateName} - ${new Date().toLocaleDateString()}`;
    
    // If user is authenticated, create project in database
    if (userId) {
      const response = await fetch('/api/projects/create-from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          projectName,
          files: Object.keys(files),
          chatId: chatId.get(),
        }),
      });

      if (response.ok) {
        const project = await response.json();
        toast.success(`Project "${projectName}" created successfully!`);
        return project;
      } else {
        console.warn('Failed to create project in database, continuing with local storage');
      }
    }

    // Store project metadata locally (fallback for unauthenticated users)
    const projectData = {
      id: `template-${templateId}-${Date.now()}`,
      name: projectName,
      templateId,
      createdAt: new Date().toISOString(),
      files: Object.keys(files),
      chatId: chatId.get(),
    };

    // Store in localStorage as backup
    const existingProjects = JSON.parse(localStorage.getItem('otter-projects') || '[]');
    existingProjects.push(projectData);
    localStorage.setItem('otter-projects', JSON.stringify(existingProjects));

    return projectData;

  } catch (error) {
    console.error('Error creating project from template:', error);
    toast.error('Failed to create project, but you can still work on your template');
    return null;
  }
}

/**
 * Update project with current files
 */
export async function updateProjectFiles(projectId: string, files: Record<string, any>) {
  try {
    // Get current workbench files
    const workbenchFiles = workbenchStore.files.get();
    
    // Update project in database if authenticated
    const response = await fetch(`/api/projects/${projectId}/files`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: workbenchFiles,
        chatId: chatId.get(),
      }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to update project files:', error);
  }
  
  return null;
}
