"use server";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const environmentSchema = z.object({
  DATABASE_URL: z.string().url({
    message: "Invalid or missing DATABASE_URL environment variable",
  })
});

const sql = neon(environmentSchema.parse(process.env).DATABASE_URL);

// Types
export type Workspace = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  user_id?: string;
  password_hash?: string;
  expires_at?: Date;
  is_public: boolean;
  drive_folder_id?: string;
  created_at: Date;
  updated_at: Date;
};

export type WorkspaceFile = {
  id: string;
  workspace_id: string;
  filename: string;
  content?: string;
  file_type: "text" | "code" | "markdown" | "file";
  language?: string;
  file_size?: number;
  file_url?: string;
  mime_type?: string;
  drive_file_id?: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
};

// Workspace functions
export async function createWorkspace(data: {
  title?: string;
  description?: string;
  user_id?: string;
  password?: string;
  expires_at?: Date;
  is_public?: boolean;
  custom_slug?: string;
}) {
  const id = nanoid();
  const slug = data.custom_slug || nanoid(10);
  const password_hash = data.password ? await bcrypt.hash(data.password, 10) : null;

  const workspace = await sql`
    INSERT INTO workspaces (id, slug, title, description, user_id, password_hash, expires_at, is_public)
    VALUES (${id}, ${slug}, ${data.title || 'Untitled'}, ${data.description || null}, ${data.user_id || null}, ${password_hash}, ${data.expires_at || null}, ${data.is_public ?? true})
    RETURNING *
  `;

  return workspace[0] as Workspace;
}

export async function getWorkspace(slug: string) {
  const workspace = await sql`
    SELECT * FROM workspaces 
    WHERE slug = ${slug} 
    AND (expires_at IS NULL OR expires_at > NOW())
  `;
  
  return workspace[0] as Workspace | undefined;
}

export async function getWorkspaceById(id: string) {
  const workspace = await sql`
    SELECT * FROM workspaces 
    WHERE id = ${id} 
    AND (expires_at IS NULL OR expires_at > NOW())
  `;
  
  return workspace[0] as Workspace | undefined;
}

export async function getWorkspacesByUser(user_id: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  
  const workspaces = await sql`
    SELECT * FROM workspaces 
    WHERE user_id = ${user_id}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return workspaces as Workspace[];
}

export async function getWorkspacesCountByUser(user_id: string) {
  const result = await sql`
    SELECT COUNT(*) as count FROM workspaces 
    WHERE user_id = ${user_id}
  `;
  
  return parseInt(result[0].count as string);
}

export async function updateWorkspace(id: string, data: Partial<Workspace>) {
  const setClause = Object.entries(data)
    .filter(([key, value]) => value !== undefined && key !== 'id')
    .map(([key]) => `${key} = $${key}`)
    .join(', ');

  if (!setClause) return null;

  // This is a simplified version - in production, use a proper query builder
  const workspace = await sql`
    UPDATE workspaces 
    SET title = ${data.title}, description = ${data.description}, is_public = ${data.is_public}
    WHERE id = ${id}
    RETURNING *
  `;

  return workspace[0] as Workspace;
}

export async function deleteWorkspace(id: string, user_id: string) {
  await sql`
    DELETE FROM workspaces 
    WHERE id = ${id} AND user_id = ${user_id}
  `;
}

export async function verifyWorkspacePassword(slug: string, password: string) {
  const workspace = await getWorkspace(slug);
  if (!workspace || !workspace.password_hash) return true;
  
  return bcrypt.compare(password, workspace.password_hash);
}

// Workspace files functions
export async function createWorkspaceFile(data: {
  workspace_id: string;
  filename: string;
  content?: string;
  file_type: "text" | "code" | "markdown" | "file";
  language?: string;
  file_size?: number;
  file_url?: string;
  mime_type?: string;
  order_index?: number;
}) {
  const id = nanoid();
  
  // Ensure filename is never null or empty
  const filename = data.filename?.trim() || 'untitled';
  
  const file = await sql`
    INSERT INTO workspace_files (id, workspace_id, filename, content, file_type, language, file_size, file_url, mime_type, order_index)
    VALUES (${id}, ${data.workspace_id}, ${filename}, ${data.content || null}, ${data.file_type}, ${data.language || null}, ${data.file_size || null}, ${data.file_url || null}, ${data.mime_type || null}, ${data.order_index || 0})
    RETURNING *
  `;

  return file[0] as WorkspaceFile;
}

export async function getWorkspaceFiles(workspace_id: string) {
  const files = await sql`
    SELECT * FROM workspace_files 
    WHERE workspace_id = ${workspace_id}
    ORDER BY order_index ASC, created_at ASC
  `;
  
  return files as WorkspaceFile[];
}

export async function updateWorkspaceFile(id: string, data: Partial<WorkspaceFile>) {
  const file = await sql`
    UPDATE workspace_files 
    SET filename = ${data.filename}, content = ${data.content}, language = ${data.language}
    WHERE id = ${id}
    RETURNING *
  `;

  return file[0] as WorkspaceFile;
}

export async function deleteWorkspaceFile(id: string) {
  await sql`
    DELETE FROM workspace_files 
    WHERE id = ${id}
  `;
}

// Analytics
export async function recordWorkspaceView(workspace_id: string, ip_address: string, user_agent: string) {
  await sql`
    INSERT INTO workspace_views (workspace_id, ip_address, user_agent)
    VALUES (${workspace_id}, ${ip_address}, ${user_agent})
  `;
}

// Google Drive integration types
export type UserDriveTokens = {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  scope: string;
  drive_email?: string;
  total_storage_used: number;
  created_at: Date;
  updated_at: Date;
};

// Google Drive functions
export async function saveUserDriveTokens(data: {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  scope: string;
  drive_email?: string;
}): Promise<void> {
  await sql`
    INSERT INTO user_drive_tokens (
      user_id, access_token, refresh_token, expires_at, scope, drive_email
    ) VALUES (
      ${data.user_id}, ${data.access_token}, ${data.refresh_token}, 
      ${data.expires_at}, ${data.scope}, ${data.drive_email}
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      scope = EXCLUDED.scope,
      drive_email = EXCLUDED.drive_email,
      updated_at = CURRENT_TIMESTAMP
  `;
}

export async function getUserDriveTokens(user_id: string): Promise<UserDriveTokens | null> {
  const result = await sql`
    SELECT * FROM user_drive_tokens WHERE user_id = ${user_id}
  `;
  
  return result[0] ? {
    user_id: result[0].user_id,
    access_token: result[0].access_token,
    refresh_token: result[0].refresh_token,
    scope: result[0].scope,
    drive_email: result[0].drive_email,
    total_storage_used: result[0].total_storage_used,
    expires_at: new Date(result[0].expires_at),
    created_at: new Date(result[0].created_at),
    updated_at: new Date(result[0].updated_at),
  } : null;
}

export async function updateUserStorageUsed(user_id: string, storage_used: number): Promise<void> {
  await sql`
    UPDATE user_drive_tokens 
    SET total_storage_used = ${storage_used}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${user_id}
  `;
}

export async function updateWorkspaceDriveFolder(workspace_id: string, drive_folder_id: string): Promise<void> {
  await sql`
    UPDATE workspaces 
    SET drive_folder_id = ${drive_folder_id}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${workspace_id}
  `;
}

export async function updateWorkspaceFileDriveId(file_id: string, drive_file_id: string): Promise<void> {
  await sql`
    UPDATE workspace_files 
    SET drive_file_id = ${drive_file_id}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${file_id}
  `;
}

// Get expired workspaces for cleanup
export async function getExpiredWorkspaces(): Promise<Workspace[]> {
  const result = await sql`
    SELECT * FROM workspaces 
    WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
    ORDER BY expires_at ASC
  `;
  
  return result.map(workspace => ({
    id: workspace.id,
    slug: workspace.slug,
    title: workspace.title,
    description: workspace.description,
    user_id: workspace.user_id,
    password_hash: workspace.password_hash,
    is_public: workspace.is_public,
    expires_at: workspace.expires_at ? new Date(workspace.expires_at) : undefined,
    created_at: new Date(workspace.created_at),
    updated_at: new Date(workspace.updated_at),
  }));
}

// Delete workspace and all associated files
export async function deleteWorkspaceCompletely(workspace_id: string): Promise<void> {
  // Delete files first (cascading should handle this, but being explicit)
  await sql`DELETE FROM workspace_files WHERE workspace_id = ${workspace_id}`;
  await sql`DELETE FROM workspace_views WHERE workspace_id = ${workspace_id}`;
  await sql`DELETE FROM workspaces WHERE id = ${workspace_id}`;
}

// Get user's total storage usage
export async function getUserStorageUsage(user_id: string): Promise<number> {
  const result = await sql`
    SELECT COALESCE(SUM(file_size), 0) as total_size
    FROM workspace_files wf
    JOIN workspaces w ON wf.workspace_id = w.id
    WHERE w.user_id = ${user_id}
  `;
  
  return parseInt(result[0]?.total_size || '0');
}

// Get workspace total size
export async function getWorkspaceSize(workspace_id: string): Promise<number> {
  const result = await sql`
    SELECT COALESCE(SUM(file_size), 0) as total_size
    FROM workspace_files
    WHERE workspace_id = ${workspace_id}
  `;
  
  return parseInt(result[0]?.total_size || '0');
}

// Get public workspaces for sitemap
export async function getPublicWorkspaces(): Promise<Workspace[]> {
  const result = await sql`
    SELECT * FROM workspaces 
    WHERE is_public = true 
    AND password_hash IS NULL
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    ORDER BY updated_at DESC
    LIMIT 1000
  `;
  
  return result.map(workspace => ({
    id: workspace.id,
    slug: workspace.slug,
    title: workspace.title,
    description: workspace.description,
    user_id: workspace.user_id,
    password_hash: workspace.password_hash,
    is_public: workspace.is_public,
    expires_at: workspace.expires_at ? new Date(workspace.expires_at) : undefined,
    created_at: new Date(workspace.created_at),
    updated_at: new Date(workspace.updated_at),
  }));
}