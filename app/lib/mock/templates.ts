import type { Template } from '~/lib/types/platform/template';

export const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'React + Vite Starter',
    description: 'Modern React app with Vite, TypeScript, and Tailwind CSS',
    longDescription: 'A modern React starter template powered by Vite for lightning-fast development. Includes TypeScript for type safety, Tailwind CSS for styling, and ESLint/Prettier for code quality.',
    githubUrl: 'https://github.com/vitejs/vite',
    thumbnailUrl: '/template-preview.png',
    category: 'frontend',
    tags: ['react', 'vite', 'typescript', 'tailwind'],
    framework: 'react',
    requiredTier: 'free',
    featured: true,
    usageCount: 1250,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: '2',
    name: 'Next.js App Router',
    description: 'Next.js 14 with App Router, Server Components, and Tailwind',
    longDescription: 'Full-featured Next.js template using the App Router, React Server Components, TypeScript, and Tailwind CSS. Perfect for building modern web applications with excellent SEO.',
    githubUrl: 'https://github.com/vercel/next.js',
    thumbnailUrl: '/template-preview.png',
    category: 'fullstack',
    tags: ['nextjs', 'react', 'typescript', 'tailwind', 'app-router'],
    framework: 'next',
    requiredTier: 'free',
    featured: true,
    usageCount: 2100,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-10-05'),
  },
  {
    id: '3',
    name: 'Express API Server',
    description: 'RESTful API with Express, TypeScript, and PostgreSQL',
    longDescription: 'Production-ready Express.js API server with TypeScript, PostgreSQL database integration, authentication middleware, and comprehensive error handling.',
    githubUrl: 'https://github.com/expressjs/express',
    thumbnailUrl: '/template-preview.png',
    category: 'backend',
    tags: ['express', 'nodejs', 'typescript', 'postgresql', 'api'],
    framework: 'express',
    requiredTier: 'plus',
    featured: false,
    usageCount: 780,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-09-20'),
  },
  {
    id: '4',
    name: 'Svelte + SvelteKit',
    description: 'Modern Svelte framework with SvelteKit for full-stack apps',
    longDescription: 'Build blazingly fast web applications with Svelte and SvelteKit. Includes TypeScript, Tailwind CSS, and optimized build configuration.',
    githubUrl: 'https://github.com/sveltejs/kit',
    thumbnailUrl: '/template-preview.png',
    category: 'frontend',
    tags: ['svelte', 'sveltekit', 'typescript', 'tailwind'],
    framework: 'svelte',
    requiredTier: 'free',
    featured: false,
    usageCount: 450,
    createdAt: new Date('2024-04-12'),
    updatedAt: new Date('2024-09-28'),
  },
  {
    id: '5',
    name: 'AI Chat Application',
    description: 'Full-stack AI chat app with OpenAI integration',
    longDescription: 'Complete AI-powered chat application with OpenAI API integration, real-time messaging, user authentication, and conversation history. Built with Next.js and PostgreSQL.',
    githubUrl: 'https://github.com/openai/openai-node',
    thumbnailUrl: '/template-preview.png',
    category: 'ai',
    tags: ['ai', 'openai', 'nextjs', 'chat', 'typescript'],
    framework: 'next',
    requiredTier: 'pro',
    featured: true,
    usageCount: 1890,
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



