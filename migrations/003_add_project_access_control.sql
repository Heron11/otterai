-- Migration: Add project access control fields
-- This migration adds support for public/private projects and cloning

-- Add cloned_from field to track project origins
ALTER TABLE projects ADD COLUMN cloned_from TEXT;

-- Add index for clone tracking
CREATE INDEX IF NOT EXISTS idx_projects_cloned_from ON projects(cloned_from);

-- Add project access logs for analytics
CREATE TABLE IF NOT EXISTS project_access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  user_id TEXT, -- NULL for anonymous access
  access_type TEXT NOT NULL, -- 'view', 'clone', 'edit'
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Add indexes for access logs
CREATE INDEX IF NOT EXISTS idx_access_logs_project ON project_access_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON project_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_type ON project_access_logs(access_type);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON project_access_logs(created_at);

-- Add view_count and clone_count if they don't exist
-- (These might already exist from previous migrations)
ALTER TABLE projects ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN clone_count INTEGER DEFAULT 0;

-- Add indexes for analytics
CREATE INDEX IF NOT EXISTS idx_projects_view_count ON projects(view_count);
CREATE INDEX IF NOT EXISTS idx_projects_clone_count ON projects(clone_count);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);
