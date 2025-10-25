import type { Template } from '~/lib/types/platform/template';

export const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'React Vite Starter',
    description: 'Clean React app with Vite and modern tooling',
    longDescription: 'A minimal React starter template powered by Vite for lightning-fast development. Includes modern tooling and hot reload for rapid development.',
    githubUrl: 'https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react',
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
    githubUrl: 'https://github.com/tastejs/todomvc/tree/master/examples/react',
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
    githubUrl: 'https://github.com/ahfarmer/calculator',
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
  {
    id: '4',
    name: 'Create React App',
    description: 'Official React starter template from Facebook',
    longDescription: 'The official Create React App template with zero configuration. Perfect starting point for React applications with built-in build tools, testing, and development server.',
    githubUrl: 'https://github.com/facebook/create-react-app/tree/main/packages/cra-template',
    thumbnailUrl: '/template-preview.png',
    category: 'frontend',
    tags: ['react', 'cra', 'official', 'starter'],
    framework: 'react',
    requiredTier: 'free',
    featured: false,
    usageCount: 450,
    createdAt: new Date('2024-04-12'),
    updatedAt: new Date('2024-09-28'),
  },
  {
    id: '5',
    name: 'React Weather App',
    description: 'Weather application with API integration',
    longDescription: 'A beautiful weather application built with React that integrates with weather APIs. Features location-based weather, forecasts, and responsive design.',
    githubUrl: 'https://github.com/apvarun/weather-app-react',
    thumbnailUrl: '/template-preview.png',
    category: 'frontend',
    tags: ['react', 'weather', 'api', 'responsive'],
    framework: 'react',
    requiredTier: 'free',
    featured: false,
    usageCount: 890,
    createdAt: new Date('2024-05-20'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: '6',
    name: 'E-commerce Store',
    description: 'Complete e-commerce solution with Stripe integration',
    longDescription: 'Full-featured e-commerce store template with product management, shopping cart, Stripe payment integration, and admin dashboard. Built with Next.js and Tailwind CSS.',
    githubUrl: 'https://github.com/vercel/commerce',
    thumbnailUrl: '/template-preview.png',
    category: 'ecommerce',
    tags: ['ecommerce', 'stripe', 'nextjs', 'tailwind', 'shop'],
    framework: 'next',
    requiredTier: 'pro',
    featured: true,
    usageCount: 920,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-10-08'),
  },
  {
    id: '7',
    name: 'Astro Blog',
    description: 'Fast, content-focused blog built with Astro',
    longDescription: 'SEO-optimized blog template using Astro for maximum performance. Includes Markdown support, RSS feed, sitemap, and beautiful typography.',
    githubUrl: 'https://github.com/withastro/astro',
    thumbnailUrl: '/template-preview.png',
    category: 'blog',
    tags: ['astro', 'blog', 'markdown', 'seo'],
    framework: 'astro',
    requiredTier: 'free',
    featured: false,
    usageCount: 650,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-09-25'),
  },
  {
    id: '8',
    name: 'Portfolio Site',
    description: 'Personal portfolio with animations and dark mode',
    longDescription: 'Stunning portfolio template with smooth animations, dark mode support, project showcase, and contact form. Built with React and Framer Motion.',
    githubUrl: 'https://github.com/framer/motion',
    thumbnailUrl: '/template-preview.png',
    category: 'portfolio',
    tags: ['portfolio', 'react', 'framer-motion', 'tailwind'],
    framework: 'react',
    requiredTier: 'free',
    featured: false,
    usageCount: 1100,
    createdAt: new Date('2024-08-05'),
    updatedAt: new Date('2024-10-02'),
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



