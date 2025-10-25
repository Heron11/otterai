import type { Template } from '~/lib/types/platform/template';

export const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'React Vite Starter',
    description: 'Clean React app with Vite and modern tooling',
    longDescription: 'A minimal React starter template powered by Vite for lightning-fast development. Includes modern tooling and hot reload for rapid development.',
    localPath: 'react-vite',
    thumbnailUrl: '/template-preview.png',
    category: 'frontend',
    tags: ['react', 'vite', 'javascript', 'modern'],
    framework: 'react',
    requiredTier: 'free',
    featured: true,
    usageCount: 1250,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: '2',
    name: 'React Todo App',
    description: 'Classic TodoMVC implementation in React',
    longDescription: 'The famous TodoMVC application built with React. Perfect for learning React fundamentals including components, state management, and event handling.',
    localPath: 'react-todo',
    thumbnailUrl: '/template-preview.png',
    category: 'frontend',
    tags: ['react', 'todo', 'mvc', 'learning'],
    framework: 'react',
    requiredTier: 'free',
    featured: true,
    usageCount: 2100,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-10-05'),
  },
  {
    id: '3',
    name: 'React Calculator',
    description: 'iOS-style calculator built with React',
    longDescription: 'A beautiful iOS-style calculator implementation using React. Demonstrates component composition, event handling, and state management for arithmetic operations.',
    localPath: 'react-calculator',
    thumbnailUrl: '/template-preview.png',
    category: 'frontend',
    tags: ['react', 'calculator', 'ios', 'math'],
    framework: 'react',
    requiredTier: 'free',
    featured: false,
    usageCount: 780,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-09-20'),
  },
];

export const getFeaturedTemplates = () => {
  return mockTemplates.filter(t => t.featured);
};

export const getTemplatesByTier = (tier: 'free' | 'plus' | 'pro') => {
  const tierHierarchy = { free: 0, plus: 1, pro: 2 };
  const userTierLevel = tierHierarchy[tier];
  
  return mockTemplates.filter(t => {
    const requiredLevel = tierHierarchy[t.requiredTier];
    return requiredLevel <= userTierLevel;
  });
};

export const getTemplateById = (id: string) => {
  return mockTemplates.find(t => t.id === id);
};



