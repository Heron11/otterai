import { atom } from 'nanostores';
import type { Project, CreateProjectInput } from '~/lib/types/platform/project';
import { mockProjects } from '~/lib/mock/projects';

export const projectsStore = atom<Project[]>(mockProjects);
export const currentProjectStore = atom<Project | null>(null);

export const createProject = (input: CreateProjectInput) => {
  const projects = projectsStore.get();
  
  const newProject: Project = {
    id: 'proj_' + Date.now(),
    userId: 'user_1', // Mock user ID
    name: input.name,
    description: input.description,
    templateId: input.templateId,
    status: 'active',
    lastModified: new Date(),
    createdAt: new Date(),
  };
  
  projectsStore.set([...projects, newProject]);
  return newProject;
};

export const updateProject = (id: string, updates: Partial<Project>) => {
  const projects = projectsStore.get();
  const updatedProjects = projects.map(project => 
    project.id === id 
      ? { ...project, ...updates, lastModified: new Date() }
      : project
  );
  
  projectsStore.set(updatedProjects);
};

export const deleteProject = (id: string) => {
  const projects = projectsStore.get();
  const updatedProjects = projects.filter(project => project.id !== id);
  projectsStore.set(updatedProjects);
};

export const archiveProject = (id: string) => {
  updateProject(id, { status: 'archived' });
};

export const setCurrentProject = (project: Project | null) => {
  currentProjectStore.set(project);
};

export const getActiveProjects = () => {
  return projectsStore.get().filter(p => p.status === 'active');
};

export const getRecentProjects = (limit: number = 4) => {
  return projectsStore.get()
    .filter(p => p.status === 'active')
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .slice(0, limit);
};



