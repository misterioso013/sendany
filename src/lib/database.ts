import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const sql = neon(process.env.DATABASE_URL!);

export interface Workspace {
  id: string;
  title: string;
  slug: string;
  description?: string;
  user_id: string | null;
  is_public: boolean;
  password_hash: string | null;
  expires_at: Date | null;
  drive_folder_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceFile {
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
}

export interface WorkspaceView {
  id: string;
  workspace_id: string;
  ip_address: string;
  user_agent: string | null;
  viewed_at: Date;
}

// Workspace operations
export async function createWorkspace(data: {
  title?: string;
  slug?: string;
  description?: string;
  user_id?: string | null;
  is_public?: boolean;
  password?: string;
  expires_at?: Date | null;
}): Promise<Workspace> {
  const id = nanoid();
  const slug = data.slug || nanoid(8);
  const password_hash = data.password
    ? await bcrypt.hash(data.password, 10)
    : null;

  const result = await sql`
    INSERT INTO workspaces (id, title, slug, description, user_id, is_public, password_hash, expires_at)
    VALUES (${id}, ${data.title || "Untitled"}, ${slug}, ${data.description || null}, ${data.user_id ?? null}, ${
    data.is_public ?? true
  }, ${password_hash}, ${data.expires_at ?? null})
    RETURNING *
  `;

  return result[0] as Workspace;
}

export async function getWorkspaceBySlug(
  slug: string
): Promise<Workspace | null> {
  const result = await sql`
    SELECT * FROM workspaces 
    WHERE slug = ${slug} AND (expires_at IS NULL OR expires_at > NOW())
  `;

  return (result[0] as Workspace) || null;
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  const result = await sql`
    SELECT * FROM workspaces WHERE id = ${id}
  `;

  return (result[0] as Workspace) || null;
}

export async function updateWorkspace(
  id: string,
  data: Partial<Omit<Workspace, "id" | "created_at" | "updated_at">>
): Promise<Workspace | null> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    updates.push(`title = $${values.length + 1}`);
    values.push(data.title);
  }
  if (data.slug !== undefined) {
    updates.push(`slug = $${values.length + 1}`);
    values.push(data.slug);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${values.length + 1}`);
    values.push(data.description);
  }
  if (data.is_public !== undefined) {
    updates.push(`is_public = $${values.length + 1}`);
    values.push(data.is_public);
  }
  if (data.password_hash !== undefined) {
    updates.push(`password_hash = $${values.length + 1}`);
    values.push(data.password_hash);
  }
  if (data.expires_at !== undefined) {
    updates.push(`expires_at = $${values.length + 1}`);
    values.push(data.expires_at);
  }
  if (data.drive_folder_id !== undefined) {
    updates.push(`drive_folder_id = $${values.length + 1}`);
    values.push(data.drive_folder_id);
  }

  if (updates.length === 0) {
    return await getWorkspaceById(id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await sql`
    UPDATE workspaces
    SET ${updates.join(", ")}
    WHERE id = ${values[values.length - 1]}
    RETURNING *
  `;
  return (result[0] as Workspace) || null;
}

export async function deleteWorkspace(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM workspaces WHERE id = ${id}`;
  return result.length > 0;
}

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const result = await sql`
    SELECT * FROM workspaces 
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `;

  return result as Workspace[];
}

export async function verifyWorkspacePassword(
  workspace: Workspace,
  password: string
): Promise<boolean> {
  if (!workspace.password_hash) return true;
  return await bcrypt.compare(password, workspace.password_hash);
}

// File operations
export async function createWorkspaceFile(data: {
  workspace_id: string;
  filename: string;
  content?: string;
  file_type?: "text" | "code" | "markdown" | "file";
  language?: string;
  file_size?: number;
  file_url?: string;
  mime_type?: string;
  drive_file_id?: string;
  order_index?: number;
}): Promise<WorkspaceFile> {
  const id = nanoid();

  // Get the next file order if not provided
  const order_index = data.order_index !== undefined ? data.order_index : 
    (await sql`
      SELECT COALESCE(MAX(order_index), 0) + 1 as next_order 
      FROM workspace_files 
      WHERE workspace_id = ${data.workspace_id}
    `)[0]?.next_order || 0;

  const result = await sql`
    INSERT INTO workspace_files (id, workspace_id, filename, content, file_type, language, file_size, file_url, mime_type, drive_file_id, order_index)
    VALUES (${id}, ${data.workspace_id}, ${data.filename}, ${data.content || ""}, ${
    data.file_type || "text"
  }, ${data.language || null}, ${data.file_size || null}, ${data.file_url || null}, ${data.mime_type || null}, ${
    data.drive_file_id || null
  }, ${order_index})
    RETURNING *
  `;

  return result[0] as WorkspaceFile;
}

export async function getWorkspaceFiles(
  workspaceId: string
): Promise<WorkspaceFile[]> {
  const result = await sql`
    SELECT * FROM workspace_files 
    WHERE workspace_id = ${workspaceId}
    ORDER BY order_index ASC, created_at ASC
  `;

  return result as WorkspaceFile[];
}

export async function updateWorkspaceFile(
  id: string,
  data: Partial<
    Omit<WorkspaceFile, "id" | "workspace_id" | "created_at" | "updated_at">
  >
): Promise<WorkspaceFile | null> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.filename !== undefined) {
    updates.push(`filename = $${values.length + 1}`);
    values.push(data.filename);
  }
  if (data.content !== undefined) {
    updates.push(`content = $${values.length + 1}`);
    values.push(data.content);
  }
  if (data.language !== undefined) {
    updates.push(`language = $${values.length + 1}`);
    values.push(data.language);
  }
  if (data.file_type !== undefined) {
    updates.push(`file_type = $${values.length + 1}`);
    values.push(data.file_type);
  }
  if (data.order_index !== undefined) {
    updates.push(`order_index = $${values.length + 1}`);
    values.push(data.order_index);
  }
  if (data.file_size !== undefined) {
    updates.push(`file_size = $${values.length + 1}`);
    values.push(data.file_size);
  }
  if (data.file_url !== undefined) {
    updates.push(`file_url = $${values.length + 1}`);
    values.push(data.file_url);
  }
  if (data.mime_type !== undefined) {
    updates.push(`mime_type = $${values.length + 1}`);
    values.push(data.mime_type);
  }
  if (data.drive_file_id !== undefined) {
    updates.push(`drive_file_id = $${values.length + 1}`);
    values.push(data.drive_file_id);
  }

  if (updates.length === 0) {
    const result = await sql`SELECT * FROM workspace_files WHERE id = ${id}`;
    return (result[0] as WorkspaceFile) || null;
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await sql`
    UPDATE workspace_files
    SET ${updates.join(", ")}
    WHERE id = ${values[values.length - 1]}
    RETURNING *
  `;
  return (result[0] as WorkspaceFile) || null;
}

export async function deleteWorkspaceFile(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM workspace_files WHERE id = ${id}`;
  return result.length > 0;
}

export async function deleteWorkspaceFiles(
  workspaceId: string
): Promise<boolean> {
  const result =
    await sql`DELETE FROM workspace_files WHERE workspace_id = ${workspaceId}`;
  return true; // Always return true for bulk delete
}

// View tracking
export async function recordWorkspaceView(data: {
  workspace_id: string;
  ip_address: string;
  user_agent?: string | null;
}): Promise<WorkspaceView> {
  const id = nanoid();

  const result = await sql`
    INSERT INTO workspace_views (id, workspace_id, ip_address, user_agent)
    VALUES (${id}, ${data.workspace_id}, ${data.ip_address}, ${
    data.user_agent || null
  })
    RETURNING *
  `;

  return result[0] as WorkspaceView;
}

export async function getWorkspaceViews(
  workspaceId: string
): Promise<WorkspaceView[]> {
  const result = await sql`
    SELECT * FROM workspace_views 
    WHERE workspace_id = ${workspaceId}
    ORDER BY viewed_at DESC
  `;

  return result as WorkspaceView[];
}

// Cleanup operations
export async function getExpiredWorkspaces(): Promise<Workspace[]> {
  const result = await sql`
    SELECT * FROM workspaces 
    WHERE expires_at IS NOT NULL AND expires_at <= NOW()
  `;

  return result as Workspace[];
}

export async function cleanupExpiredWorkspaces(): Promise<number> {
  const expiredWorkspaces = await getExpiredWorkspaces();

  for (const workspace of expiredWorkspaces) {
    await deleteWorkspaceFiles(workspace.id);
    await sql`DELETE FROM workspace_views WHERE workspace_id = ${workspace.id}`;
    await deleteWorkspace(workspace.id);
  }

  return expiredWorkspaces.length;
}

// Google Drive integration types and functions
export interface UserDriveTokens {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  scope: string;
  drive_email?: string;
  total_storage_used: number;
  created_at: Date;
  updated_at: Date;
}

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
      ${data.expires_at}, ${data.scope}, ${data.drive_email || null}
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

export async function getUserDriveTokens(
  user_id: string
): Promise<UserDriveTokens | null> {
  const result = await sql`
    SELECT * FROM user_drive_tokens WHERE user_id = ${user_id}
  `;

  return result[0]
    ? {
        user_id: result[0].user_id,
        access_token: result[0].access_token,
        refresh_token: result[0].refresh_token,
        scope: result[0].scope,
        drive_email: result[0].drive_email,
        total_storage_used: result[0].total_storage_used,
        expires_at: new Date(result[0].expires_at),
        created_at: new Date(result[0].created_at),
        updated_at: new Date(result[0].updated_at),
      }
    : null;
}

export async function updateUserStorageUsed(
  user_id: string,
  storage_used: number
): Promise<void> {
  await sql`
    UPDATE user_drive_tokens 
    SET total_storage_used = ${storage_used}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${user_id}
  `;
}

export async function updateWorkspaceDriveFolder(
  workspace_id: string,
  drive_folder_id: string
): Promise<void> {
  await sql`
    UPDATE workspaces 
    SET drive_folder_id = ${drive_folder_id}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${workspace_id}
  `;
}

export async function updateWorkspaceFileDriveId(
  file_id: string,
  drive_file_id: string
): Promise<void> {
  await sql`
    UPDATE workspace_files 
    SET drive_file_id = ${drive_file_id}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${file_id}
  `;
}

// Enhanced workspace functions
export async function getWorkspace(slug: string): Promise<Workspace | undefined> {
  return await getWorkspaceBySlug(slug) || undefined;
}

export async function getWorkspacesByUser(
  user_id: string,
  page: number = 1,
  limit: number = 10
): Promise<Workspace[]> {
  const offset = (page - 1) * limit;

  const result = await sql`
    SELECT * FROM workspaces 
    WHERE user_id = ${user_id}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return result as Workspace[];
}

export async function getWorkspacesCountByUser(user_id: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM workspaces 
    WHERE user_id = ${user_id}
  `;

  return parseInt(result[0].count as string);
}

export async function deleteWorkspaceCompletely(
  workspace_id: string
): Promise<void> {
  // Delete files first (cascading should handle this, but being explicit)
  await sql`DELETE FROM workspace_files WHERE workspace_id = ${workspace_id}`;
  await sql`DELETE FROM workspace_views WHERE workspace_id = ${workspace_id}`;
  await sql`DELETE FROM workspaces WHERE id = ${workspace_id}`;
}

export async function getUserStorageUsage(user_id: string): Promise<number> {
  const result = await sql`
    SELECT COALESCE(SUM(file_size), 0) as total_size
    FROM workspace_files wf
    JOIN workspaces w ON wf.workspace_id = w.id
    WHERE w.user_id = ${user_id}
  `;

  return parseInt(result[0]?.total_size || "0");
}

export async function getWorkspaceSize(workspace_id: string): Promise<number> {
  const result = await sql`
    SELECT COALESCE(SUM(file_size), 0) as total_size
    FROM workspace_files
    WHERE workspace_id = ${workspace_id}
  `;

  return parseInt(result[0]?.total_size || "0");
}

export async function getPublicWorkspaces(): Promise<Workspace[]> {
  const result = await sql`
    SELECT * FROM workspaces 
    WHERE is_public = true 
    AND password_hash IS NULL
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    ORDER BY updated_at DESC
    LIMIT 1000
  `;

  return result.map((workspace: any) => ({
    id: workspace.id,
    slug: workspace.slug,
    title: workspace.title,
    description: workspace.description,
    user_id: workspace.user_id,
    password_hash: workspace.password_hash,
    is_public: workspace.is_public,
    expires_at: workspace.expires_at
      ? new Date(workspace.expires_at)
      : null,
    drive_folder_id: workspace.drive_folder_id,
    created_at: new Date(workspace.created_at),
    updated_at: new Date(workspace.updated_at),
  }));
}
