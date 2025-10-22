/**
 * Project Access Control
 * Handles secure access control for public/private projects
 */

import type { Database } from '../db/client';
import { queryFirst } from '../db/client';

export interface ProjectAccess {
  canView: boolean;
  canEdit: boolean;
  canClone: boolean;
  isOwner: boolean;
  isCloned: boolean;
  accessType: 'owner' | 'viewer' | 'none';
  clonedProjectId?: string;
}

/**
 * Check what access a user has to a project
 */
export async function checkProjectAccess(
  db: Database,
  projectId: string,
  userId?: string
): Promise<ProjectAccess> {
  const project = await queryFirst<{ user_id: string; visibility: string }>(db, 
    'SELECT user_id, visibility FROM projects WHERE id = ?', 
    projectId
  );
  
  if (!project) {
    return {
      canView: false,
      canEdit: false,
      canClone: false,
      isOwner: false,
      isCloned: false,
      accessType: 'none'
    };
  }
  
  const isOwner = userId === project.user_id;
  const isPublic = project.visibility === 'public';
  
  // Check if user has a cloned version
  const clonedProject = userId ? await queryFirst<{ id: string }>(db,
    'SELECT id FROM projects WHERE user_id = ? AND cloned_from = ?',
    userId,
    projectId
  ) : null;
  
  const isCloned = !!clonedProject;
  
  return {
    canView: isOwner || isPublic,
    canEdit: isOwner || isCloned, // Only owner or user with cloned version
    canClone: isPublic,
    isOwner,
    isCloned,
    clonedProjectId: clonedProject?.id,
    accessType: isOwner ? 'owner' : (isCloned ? 'viewer' : (isPublic ? 'viewer' : 'none'))
  };
}

/**
 * Log project access for analytics
 */
export async function logProjectAccess(
  db: Database,
  projectId: string,
  userId: string | null,
  accessType: 'view' | 'clone' | 'edit',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db.prepare(
      `INSERT INTO project_access_logs (project_id, user_id, access_type, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(projectId, userId, accessType, ipAddress || null, userAgent || null).run();
  } catch (error) {
    // Log access errors but don't fail the main operation
    console.error('Failed to log project access:', error);
  }
}
