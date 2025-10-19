import type { Project } from '~/lib/types/platform/project';

export const mockProjects: Project[] = [
  {
    id: 'proj_1',
    userId: 'user_1',
    name: 'Portfolio Site',
    description: 'Personal portfolio built with React and Tailwind',
    templateId: '8',
    templateName: 'Portfolio Template',
    status: 'active',
    lastModified: new Date('2024-10-15T14:30:00'),
    createdAt: new Date('2024-10-10T10:00:00'),
    previewUrl: 'https://preview.example.com/proj_1',
  },
  {
    id: 'proj_2',
    userId: 'user_1',
    name: 'E-commerce Store',
    description: 'Building an online store for a client',
    templateId: '6',
    templateName: 'E-commerce Template',
    status: 'active',
    lastModified: new Date('2024-10-14T16:45:00'),
    createdAt: new Date('2024-10-05T09:00:00'),
    previewUrl: 'https://preview.example.com/proj_2',
  },
  {
    id: 'proj_3',
    userId: 'user_1',
    name: 'Tech Blog',
    description: 'Tech blog for my startup',
    templateId: '7',
    templateName: 'Blog Template',
    status: 'active',
    lastModified: new Date('2024-10-12T11:20:00'),
    createdAt: new Date('2024-09-28T14:00:00'),
    previewUrl: 'https://preview.example.com/proj_3',
  },
  {
    id: 'proj_5',
    userId: 'user_1',
    name: 'Old Project',
    description: 'Archived project from last month',
    templateId: '1',
    templateName: 'React + Vite Starter',
    status: 'archived',
    lastModified: new Date('2024-09-15T10:00:00'),
    createdAt: new Date('2024-08-01T12:00:00'),
  },
];

export const getActiveProjects = (userId: string) => {
  return mockProjects.filter(p => p.userId === userId && p.status === 'active');
};

export const getProjectById = (id: string) => {
  return mockProjects.find(p => p.id === id);
};

export const getRecentProjects = (userId: string, limit: number = 4) => {
  return mockProjects
    .filter(p => p.userId === userId && p.status === 'active')
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .slice(0, limit);
};



