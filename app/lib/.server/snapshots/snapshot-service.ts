/**
 * Project Snapshot Service
 * Handles creation and management of project snapshots for public templates
 */

import type { Database } from '../db/client';
import { queryFirst, queryAll, execute } from '../db/client';
import { nanoid } from 'nanoid';

// Snapshot limits
const MAX_SNAPSHOT_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES_PER_SNAPSHOT = 1000;
const MAX_SNAPSHOTS_PER_USER = {
  free: 3,
  plus: 10,
  pro: 50,
};

export interface ProjectSnapshot {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  description?: string;
  templateId?: string;
  templateName?: string;
  r2Path: string;
  fileCount: number;
  totalSize: number;
  version: number;
  createdAt: Date;
}

export interface SnapshotFile {
  id: number;
  snapshotId: string;
  filePath: string;
  r2Key: string;
  fileSize: number;
  contentType?: string;
  createdAt: Date;
}

// Denylist of sensitive files that should never be included in public snapshots
const SENSITIVE_FILE_PATTERNS: RegExp[] = [
  /(^|\/)\.env(\..*)?$/i,
  /(^|\/)\.dev\.vars(\..*)?$/i,
  /(^|\/)\.env\.local$/i,
  /(^|\/)\.env\.production$/i,
  /(^|\/)\.env\.development$/i,
  /\.pem$/i,
  /\.key$/i,
  /(^|\/)\.ssh(\/|$)/i,
  /(^|\/)secrets?\./i,
];

function isSensitiveFile(path: string): boolean {
  return SENSITIVE_FILE_PATTERNS.some((re) => re.test(path));
}

/**
 * Create a snapshot of a project when it's made public
 */
export async function createProjectSnapshot(
  db: Database,
  projectId: string,
  userId: string,
  r2Bucket: R2Bucket
): Promise<ProjectSnapshot> {
  // Get the current project data
  const project = await queryFirst<any>(
    db,
    `SELECT * FROM projects WHERE id = ? AND user_id = ?`,
    projectId,
    userId
  );

  if (!project) {
    throw new Error('Project not found');
  }

  // Check user's snapshot quota
  const userProfile = await queryFirst<any>(
    db,
    `SELECT tier FROM users WHERE id = ?`,
    userId
  );
  
  const userTier = (userProfile?.tier || 'free') as keyof typeof MAX_SNAPSHOTS_PER_USER;
  const maxSnapshots = MAX_SNAPSHOTS_PER_USER[userTier] || MAX_SNAPSHOTS_PER_USER.free;
  
  const snapshotCount = await queryFirst<{ count: number }>(
    db,
    `SELECT COUNT(*) as count FROM project_snapshots WHERE user_id = ?`,
    userId
  );
  
  if (snapshotCount && snapshotCount.count >= maxSnapshots) {
    throw new Error(`Snapshot quota exceeded. ${userTier} tier allows ${maxSnapshots} snapshots. Please delete old snapshots or upgrade your plan.`);
  }

  // Get the current version number for this project
  const versionResult = await queryFirst<{ version: number }>(
    db,
    `SELECT COALESCE(MAX(version), 0) + 1 as version FROM project_snapshots WHERE project_id = ?`,
    projectId
  );
  const version = versionResult?.version || 1;

  // Generate snapshot ID
  const snapshotId = `snap_${nanoid()}`;
  const snapshotR2Path = `snapshots/${snapshotId}`;

  // Get all project files
  const projectFiles = await queryAll<any>(
    db,
    `SELECT * FROM project_files WHERE project_id = ?`,
    projectId
  );

  // Check file count limit
  if (projectFiles.length > MAX_FILES_PER_SNAPSHOT) {
    throw new Error(`Project has too many files to snapshot. Maximum ${MAX_FILES_PER_SNAPSHOT} files allowed.`);
  }

  // Copy files to snapshot location in R2 (best-effort)
  let totalSize = 0;
  const snapshotFiles: Omit<SnapshotFile, 'id' | 'createdAt'>[] = [];

  for (const file of projectFiles) {
    try {
      // Read the original file from R2
      const originalKey = file.r2_key;
      const originalObject = await r2Bucket.get(originalKey);
      
      if (!originalObject) {
        console.warn('Snapshot file not found in R2');
        continue;
      }

      // Create new key for snapshot (remove leading slash from file path)
      const normalizedFilePath = file.file_path.startsWith('/') ? file.file_path.slice(1) : file.file_path;

      // Skip sensitive files from snapshot
      if (isSensitiveFile(normalizedFilePath)) {
        console.warn('Skipping sensitive file from snapshot:', normalizedFilePath);
        continue;
      }
      const snapshotKey = `${snapshotR2Path}/${normalizedFilePath}`;
      
      // Copy file to snapshot location
      await r2Bucket.put(snapshotKey, originalObject.body, {
        httpMetadata: {
          contentType: file.content_type || 'text/plain',
        },
      });

      // Track file metadata
      snapshotFiles.push({
        snapshotId,
        filePath: normalizedFilePath,
        r2Key: snapshotKey,
        fileSize: file.file_size,
        contentType: file.content_type,
      });

      totalSize += file.file_size;
      
      // Check size limit
      if (totalSize > MAX_SNAPSHOT_SIZE) {
        throw new Error(`Project is too large to snapshot. Maximum ${MAX_SNAPSHOT_SIZE / 1024 / 1024}MB allowed.`);
      }
    } catch (error) {
      // Best-effort: skip problematic files but continue snapshotting
      console.error(`Failed to copy file to snapshot:`, error);
      continue;
    }
  }

  // Create snapshot record
  await execute(
    db,
    `INSERT INTO project_snapshots (
      id, project_id, user_id, name, description, template_id, template_name,
      r2_path, file_count, total_size, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    snapshotId,
    projectId,
    userId,
    project.name,
    project.description,
    project.template_id,
    project.template_name,
    snapshotR2Path,
    snapshotFiles.length,
    totalSize,
    version
  );

  // Insert snapshot file records
  for (const file of snapshotFiles) {
    await execute(
      db,
      `INSERT INTO snapshot_files (snapshot_id, file_path, r2_key, file_size, content_type)
       VALUES (?, ?, ?, ?, ?)`,
      file.snapshotId,
      file.filePath,
      file.r2Key,
      file.fileSize,
      file.contentType
    );
  }

  // Update the project with snapshot info
  await execute(
    db,
    `UPDATE projects SET 
      snapshot_id = ?, 
      snapshot_created_at = CURRENT_TIMESTAMP,
      snapshot_version = ?
     WHERE id = ?`,
    snapshotId,
    version,
    projectId
  );

  return {
    id: snapshotId,
    projectId,
    userId,
    name: project.name,
    description: project.description,
    templateId: project.template_id,
    templateName: project.template_name,
    r2Path: snapshotR2Path,
    fileCount: projectFiles.length,
    totalSize,
    version,
    createdAt: new Date(),
  };
}

/**
 * Get snapshot files for a specific snapshot
 */
export async function getSnapshotFiles(
  db: Database,
  snapshotId: string
): Promise<SnapshotFile[]> {
  const rows = await queryAll<any>(
    db,
    `SELECT * FROM snapshot_files WHERE snapshot_id = ? ORDER BY file_path`,
    snapshotId
  );

  return rows.map(row => ({
    id: row.id,
    snapshotId: row.snapshot_id,
    filePath: row.file_path,
    r2Key: row.r2_key,
    fileSize: row.file_size,
    contentType: row.content_type,
    createdAt: new Date(row.created_at),
  }));
}

/**
 * Get all snapshots for a project
 */
export async function getProjectSnapshots(
  db: Database,
  projectId: string
): Promise<ProjectSnapshot[]> {
  const rows = await queryAll<any>(
    db,
    `SELECT * FROM project_snapshots WHERE project_id = ? ORDER BY version DESC`,
    projectId
  );

  return rows.map(row => ({
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    templateId: row.template_id,
    templateName: row.template_name,
    r2Path: row.r2_path,
    fileCount: row.file_count,
    totalSize: row.total_size,
    version: row.version,
    createdAt: new Date(row.created_at),
  }));
}

/**
 * Get the latest snapshot for a project
 */
export async function getLatestSnapshot(
  db: Database,
  projectId: string
): Promise<ProjectSnapshot | null> {
  const row = await queryFirst<any>(
    db,
    `SELECT * FROM project_snapshots WHERE project_id = ? ORDER BY version DESC LIMIT 1`,
    projectId
  );

  if (!row) return null;

  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    templateId: row.template_id,
    templateName: row.template_name,
    r2Path: row.r2_path,
    fileCount: row.file_count,
    totalSize: row.total_size,
    version: row.version,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Delete a snapshot and its files
 */
export async function deleteSnapshot(
  db: Database,
  snapshotId: string,
  userId: string,
  r2Bucket: R2Bucket
): Promise<void> {
  // Verify ownership before deletion
  const snapshot = await queryFirst<any>(
    db,
    `SELECT ps.*, p.user_id 
     FROM project_snapshots ps
     JOIN projects p ON ps.project_id = p.id
     WHERE ps.id = ?`,
    snapshotId
  );
  
  if (!snapshot) {
    throw new Error('Snapshot not found');
  }
  
  if (snapshot.user_id !== userId) {
    throw new Error('Unauthorized: Cannot delete snapshot that does not belong to you');
  }
  
  // Get snapshot files
  const files = await getSnapshotFiles(db, snapshotId);

  // Delete files from R2
  for (const file of files) {
    try {
      await r2Bucket.delete(file.r2Key);
    } catch (error) {
      console.error('Failed to delete snapshot file from R2:', error);
    }
  }

  // Delete snapshot records
  await execute(db, `DELETE FROM snapshot_files WHERE snapshot_id = ?`, snapshotId);
  await execute(db, `DELETE FROM project_snapshots WHERE id = ?`, snapshotId);
}
