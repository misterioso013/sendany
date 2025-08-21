-- SendAny Database Schema
-- Execute this SQL manually in your Neon database

-- Step 1: Create the main workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(21) PRIMARY KEY, -- nanoid
    slug VARCHAR(100) UNIQUE NOT NULL, -- human-readable slug
    title VARCHAR(255) DEFAULT 'Untitled',
    description TEXT,
    user_id VARCHAR(255), -- from Stack Auth, nullable for anonymous
    password_hash VARCHAR(255), -- bcrypt hash for password protection
    expires_at TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create the workspace files table
CREATE TABLE IF NOT EXISTS workspace_files (
    id VARCHAR(21) PRIMARY KEY, -- nanoid
    workspace_id VARCHAR(21) REFERENCES workspaces(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    content TEXT, -- for text files, code, markdown, etc.
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('text', 'code', 'markdown', 'file')),
    language VARCHAR(50), -- for syntax highlighting (js, python, css, etc.)
    file_size BIGINT, -- for uploaded files
    file_url TEXT, -- for uploaded files (could be stored in cloud storage)
    mime_type VARCHAR(100),
    order_index INTEGER DEFAULT 0, -- for ordering files in workspace
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create the workspace views table for analytics
CREATE TABLE IF NOT EXISTS workspace_views (
    id SERIAL PRIMARY KEY,
    workspace_id VARCHAR(21) REFERENCES workspaces(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_at ON workspaces(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspaces_expires_at ON workspaces(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspace_files_workspace_id ON workspace_files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_order ON workspace_files(workspace_id, order_index);
CREATE INDEX IF NOT EXISTS idx_workspace_views_workspace_id ON workspace_views(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_views_viewed_at ON workspace_views(viewed_at DESC);

-- Step 5: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at 
    BEFORE UPDATE ON workspaces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_files_updated_at ON workspace_files;
CREATE TRIGGER update_workspace_files_updated_at 
    BEFORE UPDATE ON workspace_files 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create user Google Drive integration table
CREATE TABLE IF NOT EXISTS user_drive_tokens (
    user_id VARCHAR(255) PRIMARY KEY, -- from Stack Auth
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scope TEXT NOT NULL,
    drive_email VARCHAR(255),
    total_storage_used BIGINT DEFAULT 0, -- in bytes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Add Google Drive fields to existing tables
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS drive_folder_id VARCHAR(255);
ALTER TABLE workspace_files ADD COLUMN IF NOT EXISTS drive_file_id VARCHAR(255);

-- Step 9: Create indexes for Google Drive integration
CREATE INDEX IF NOT EXISTS idx_user_drive_tokens_expires_at ON user_drive_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_workspaces_drive_folder_id ON workspaces(drive_folder_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_drive_file_id ON workspace_files(drive_file_id);

-- Step 10: Create trigger for user_drive_tokens updated_at
DROP TRIGGER IF EXISTS update_user_drive_tokens_updated_at ON user_drive_tokens;
CREATE TRIGGER update_user_drive_tokens_updated_at 
    BEFORE UPDATE ON user_drive_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Insert some sample data (optional - remove in production)
-- INSERT INTO workspaces (id, slug, title, description, is_public) 
-- VALUES ('sample_workspace_123', 'welcome', 'Welcome to SendAny', 'A sample workspace to get you started', true);

-- INSERT INTO workspace_files (id, workspace_id, filename, content, file_type, language, order_index)
-- VALUES ('sample_file_123', 'sample_workspace_123', 'welcome.md', '# Welcome to SendAny\n\nThis is a sample workspace. You can create your own by signing up!', 'markdown', 'markdown', 0);
