import type { UserTier } from './user';

export type TemplateCategory = 
  | 'frontend' 
  | 'fullstack' 
  | 'backend' 
  | 'mobile' 
  | 'ai' 
  | 'ecommerce' 
  | 'blog' 
  | 'portfolio'
  | 'other';

export type TemplateFramework = 
  | 'react' 
  | 'vue' 
  | 'svelte' 
  | 'angular' 
  | 'next' 
  | 'remix' 
  | 'astro' 
  | 'vite'
  | 'node'
  | 'express'
  | 'other';

export interface Template {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  localPath: string;
  thumbnailUrl?: string;
  category: TemplateCategory;
  tags: string[];
  framework: TemplateFramework;
  requiredTier: UserTier;
  featured: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateFilters {
  category?: TemplateCategory;
  framework?: TemplateFramework;
  tier?: UserTier;
  search?: string;
  tags?: string[];
}



