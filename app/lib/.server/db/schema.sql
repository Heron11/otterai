-- OtterAI Database Schema for Cloudflare D1
-- This schema supports user management, credit tracking, and Stripe integration
--
-- ⚠️ NEXT REFACTOR TODO:
-- When recreating the database schema, DROP these redundant/unused fields:
--   1. projects.is_template (use visibility='public' instead)
--   2. Any other deprecated fields added during development
--
-- SQLite doesn't support DROP COLUMN, so we need to recreate tables to remove fields.
-- Keep this list updated as we identify fields to remove.

-- Users table: stores user profiles and subscription information
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'plus', 'pro'
  credits INTEGER NOT NULL DEFAULT 50, -- Monthly credits remaining
  credits_reset_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- When credits were last reset
  daily_credits_used INTEGER NOT NULL DEFAULT 0, -- Credits used today
  daily_credits_reset_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- When daily credits were last reset
  stripe_customer_id TEXT, -- For future Stripe integration
  stripe_subscription_id TEXT, -- For future Stripe integration
  subscription_status TEXT DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete support
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Projects table: stores user projects linked to chat sessions
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_id TEXT, -- Reference to templates table
  template_name TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived'
  chat_id TEXT, -- Link to IndexedDB chat for anonymous, or internal ID for auth users
  preview_url TEXT,
  r2_path TEXT, -- R2 storage path: projects/{projectId}/
  file_count INTEGER NOT NULL DEFAULT 0, -- Number of files in project
  total_size INTEGER NOT NULL DEFAULT 0, -- Total size in bytes
  visibility TEXT NOT NULL DEFAULT 'private', -- 'private' (owner only), 'public' (anyone can view & clone), 'unlisted' (link only)
  view_count INTEGER NOT NULL DEFAULT 0, -- Number of times viewed
  clone_count INTEGER NOT NULL DEFAULT 0, -- Number of times cloned/used
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for user projects
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);
CREATE INDEX IF NOT EXISTS idx_projects_public ON projects(visibility, clone_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_popular ON projects(visibility, view_count DESC);

-- Project files index: metadata for files stored in R2
CREATE TABLE IF NOT EXISTS project_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Relative path within project (e.g., 'src/App.tsx')
  r2_key TEXT NOT NULL, -- Full R2 key (e.g., 'projects/{id}/src/App.tsx')
  file_size INTEGER NOT NULL DEFAULT 0,
  content_type TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(project_id, file_path)
);

-- Index for file lookups
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_user ON project_files(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_path ON project_files(project_id, file_path);

-- Usage logs: tracks message usage per user for analytics
CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 1, -- Number of messages in this session
  credits_used INTEGER NOT NULL DEFAULT 1, -- Credits deducted
  model TEXT NOT NULL DEFAULT 'claude-haiku-4-5', -- Model used
  session_id TEXT, -- Optional: link to chat session
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for usage analytics
CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_logs(user_id, created_at DESC);

-- Templates table: curated templates (replacing mock data)
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'saas', 'ecommerce', 'portfolio', etc.
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'plus', 'pro'
  framework TEXT NOT NULL, -- 'react', 'vue', 'nextjs', etc.
  tags TEXT NOT NULL, -- JSON array: ["tailwind", "typescript"]
  thumbnail_url TEXT,
  github_url TEXT NOT NULL, -- GitHub repo URL to clone
  is_featured BOOLEAN NOT NULL DEFAULT 0,
  author_id TEXT, -- Optional: if user-submitted
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for template queries
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_tier ON templates(tier);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(is_featured);

-- Subscriptions table: Stripe subscription data (prepared but not active)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY, -- Stripe subscription ID
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'free', 'plus', 'pro'
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'incomplete'
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Chat messages table: stores authenticated user chat history
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for chat retrieval
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_chat ON chat_messages(user_id, chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(chat_id, created_at ASC);

