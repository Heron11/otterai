/**
 * Template Database Queries
 * Provides functions to fetch templates from D1
 */

import type { Database } from '../db/client';
import { queryFirst, queryAll } from '../db/client';
import type { Template, TemplateCategory } from '~/lib/types/platform/template';

/**
 * Get all templates
 */
export async function getAllTemplates(db: Database): Promise<Template[]> {
  const rows = await queryAll<any>(
    db,
    `SELECT * FROM templates ORDER BY is_featured DESC, downloads DESC, created_at DESC`
  );

  return rows.map(mapRowToTemplate);
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(
  db: Database,
  category: TemplateCategory
): Promise<Template[]> {
  const rows = await queryAll<any>(
    db,
    'SELECT * FROM templates WHERE category = ? ORDER BY is_featured DESC, downloads DESC',
    category
  );

  return rows.map(mapRowToTemplate);
}

/**
 * Get templates by tier
 */
export async function getTemplatesByTier(
  db: Database,
  tier: 'free' | 'plus' | 'pro'
): Promise<Template[]> {
  const rows = await queryAll<any>(
    db,
    'SELECT * FROM templates WHERE tier = ? ORDER BY is_featured DESC, downloads DESC',
    tier
  );

  return rows.map(mapRowToTemplate);
}

/**
 * Get featured templates
 */
export async function getFeaturedTemplates(
  db: Database,
  limit: number = 6
): Promise<Template[]> {
  const rows = await queryAll<any>(
    db,
    'SELECT * FROM templates WHERE is_featured = 1 ORDER BY downloads DESC LIMIT ?',
    limit
  );

  return rows.map(mapRowToTemplate);
}

/**
 * Get a specific template by ID
 */
export async function getTemplateById(
  db: Database,
  templateId: string
): Promise<Template | null> {
  const row = await queryFirst<any>(
    db,
    'SELECT * FROM templates WHERE id = ?',
    templateId
  );

  if (!row) {
    return null;
  }

  return mapRowToTemplate(row);
}

/**
 * Search templates by name or description
 */
export async function searchTemplates(
  db: Database,
  query: string
): Promise<Template[]> {
  const searchTerm = `%${query}%`;
  const rows = await queryAll<any>(
    db,
    `SELECT * FROM templates 
     WHERE name LIKE ? OR description LIKE ? 
     ORDER BY is_featured DESC, downloads DESC`,
    searchTerm,
    searchTerm
  );

  return rows.map(mapRowToTemplate);
}

/**
 * Map database row to Template type
 */
function mapRowToTemplate(row: any): Template {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as TemplateCategory,
    tier: row.tier,
    framework: row.framework,
    tags: JSON.parse(row.tags || '[]'),
    thumbnailUrl: row.thumbnail_url,
    githubUrl: row.github_url,
    isFeatured: Boolean(row.is_featured),
    authorId: row.author_id,
    downloads: row.downloads || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

