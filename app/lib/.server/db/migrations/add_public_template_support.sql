-- Migration to add public template support
-- Add new columns to projects table

ALTER TABLE projects ADD COLUMN is_public_template BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN public_template_id TEXT;

-- Create index for public templates
CREATE INDEX IF NOT EXISTS idx_projects_public_template ON projects(is_public_template);
CREATE INDEX IF NOT EXISTS idx_projects_public_template_id ON projects(public_template_id);

-- Update the visibility constraint to remove 'unlisted'
-- Note: SQLite doesn't support DROP CONSTRAINT, so we'll handle this in application code
