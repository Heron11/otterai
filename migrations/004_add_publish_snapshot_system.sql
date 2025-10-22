ALTER TABLE projects ADD COLUMN is_published BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN published_snapshot_id TEXT;
ALTER TABLE projects ADD COLUMN is_snapshot BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN source_project_id TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_is_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_is_snapshot ON projects(is_snapshot);
CREATE INDEX IF NOT EXISTS idx_projects_source_project ON projects(source_project_id);
CREATE INDEX IF NOT EXISTS idx_projects_published_snapshot ON projects(published_snapshot_id);

