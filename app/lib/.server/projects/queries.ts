/**
 * Project Database Queries
 * Provides functions to fetch and manage user projects from D1
 */

import type { Database } from '../db/client';
import { queryFirst, queryAll, execute } from '../db/client';
import type { Project } from '~/lib/types/platform/project';

/**
 * Get all active projects for a user
 */
export async function getUserProjects(
  db: Database,
  userId: string
): Promise<Project[]> {
  const rows = await queryAll<any>(
    db,
    `SELECT * FROM projects 
     WHERE user_id = ? AND status = 'active' 
     ORDER BY updated_at DESC`,
    userId
  );

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    templateId: row.template_id,
    templateName: row.template_name,
    chatId: row.chat_id,
    status: row.status,
    lastModified: new Date(row.updated_at),
    createdAt: new Date(row.created_at),
    previewUrl: row.preview_url,
  }));
}

/**
 * Get recent projects for a user
 */
export async function getRecentProjects(
  db: Database,
  userId: string,
  limit: number = 4
): Promise<Project[]> {
  const rows = await queryAll<any>(
    db,
    `SELECT * FROM projects 
     WHERE user_id = ? AND status = 'active' 
     ORDER BY updated_at DESC 
     LIMIT ?`,
    userId,
    limit
  );

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    templateId: row.template_id,
    templateName: row.template_name,
    chatId: row.chat_id,
    status: row.status,
    lastModified: new Date(row.updated_at),
    createdAt: new Date(row.created_at),
    previewUrl: row.preview_url,
  }));
}

/**
 * Get a specific project by ID
 */
export async function getProjectById(
  db: Database,
  projectId: string,
  userId: string
): Promise<Project | null> {
  const row = await queryFirst<any>(
    db,
    'SELECT * FROM projects WHERE id = ? AND user_id = ?',
    projectId,
    userId
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    templateId: row.template_id,
    templateName: row.template_name,
    status: row.status,
    lastModified: new Date(row.updated_at),
    createdAt: new Date(row.created_at),
    previewUrl: row.preview_url,
  };
}

/**
 * Create a new project
 */
export async function createProject(
  db: Database,
  userId: string,
  data: {
    id: string;
    name: string;
    description?: string;
    templateId?: string;
    templateName?: string;
    chatId?: string;
  }
): Promise<boolean> {
  const result = await execute(
    db,
    `INSERT INTO projects (id, user_id, name, description, template_id, template_name, chat_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
    data.id,
    userId,
    data.name,
    data.description || null,
    data.templateId || null,
    data.templateName || null,
    data.chatId || null
  );

  return result.success;
}

/**
 * Update a project
 */
export async function updateProject(
  db: Database,
  projectId: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string;
    status: string;
    previewUrl: string;
  }>
): Promise<boolean> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (data.previewUrl !== undefined) {
    updates.push('preview_url = ?');
    values.push(data.previewUrl);
  }

  if (updates.length === 0) {
    return false;
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(projectId, userId);

  const result = await execute(
    db,
    `UPDATE projects SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
    ...values
  );

  return result.success;
}

/**
 * Delete (archive) a project
 */
export async function archiveProject(
  db: Database,
  projectId: string,
  userId: string
): Promise<boolean> {
  return updateProject(db, projectId, userId, { status: 'archived' });
}

/**
 * Get project count for a user
 */
export async function getUserProjectCount(
  db: Database,
  userId: string
): Promise<number> {
  const result = await queryFirst<{ count: number }>(
    db,
    'SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND status = "active"',
    userId
  );

  return result?.count || 0;
}

/**
 * Get public projects as templates
 * Public projects = templates (can be cloned by anyone)
 */
export async function getPublicTemplates(
  db: Database,
  limit: number = 20,
  category?: string
): Promise<Project[]> {
  let query = `
    SELECT * FROM projects 
    WHERE visibility = 'public' 
      AND status = 'active'
  `;
  
  const params: any[] = [];
  
  if (category) {
    // Future: add category field to projects or filter by tags
  }
  
  query += ' ORDER BY clone_count DESC, view_count DESC LIMIT ?';
  params.push(limit);
  
  const rows = await queryAll<any>(db, query, ...params);

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    templateId: row.template_id,
    templateName: row.template_name,
    chatId: row.chat_id,
    status: row.status,
    lastModified: new Date(row.updated_at),
    createdAt: new Date(row.created_at),
    previewUrl: row.preview_url,
  }));
}

/**
 * Get featured/popular public projects (for dashboard)
 */
export async function getFeaturedProjects(
  db: Database,
  limit: number = 6
): Promise<Project[]> {
  const rows = await queryAll<any>(
    db,
    `SELECT * FROM projects 
     WHERE visibility = 'public' 
       AND status = 'active'
     ORDER BY clone_count DESC, view_count DESC 
     LIMIT ?`,
    limit
  );

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    templateId: row.template_id,
    templateName: row.template_name,
    chatId: row.chat_id,
    status: row.status,
    lastModified: new Date(row.updated_at),
    createdAt: new Date(row.created_at),
    previewUrl: row.preview_url,
  }));
}

