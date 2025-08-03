import { pool, Workspace, WorkspaceItem } from './config';

export class WorkspaceService {
  // Criar workspace
  static async createWorkspace(name: string, ownerId: string, isPrivate: boolean = false): Promise<Workspace> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Criar workspace
      const workspaceResult = await client.query(
        'INSERT INTO workspaces (name, owner_id, is_private) VALUES ($1, $2, $3) RETURNING *',
        [name, ownerId, isPrivate]
      );
      
      const workspace = workspaceResult.rows[0];
      
      // Adicionar owner como membro
      await client.query(
        'INSERT INTO workspace_members (workspace_id, user_id) VALUES ($1, $2)',
        [workspace.id, ownerId]
      );
      
      await client.query('COMMIT');
      return workspace;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Buscar workspaces do usuário
  static async getUserWorkspaces(userId: string): Promise<any[]> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          w.*,
          u.name as owner_name,
          u.email as owner_email,
          (
            SELECT COUNT(*)::int
            FROM workspace_members wm 
            WHERE wm.workspace_id = w.id
          ) as member_count,
          (
            SELECT json_agg(
              json_build_object(
                'id', wi.id,
                'type', wi.type,
                'content', wi.content,
                'title', wi.title,
                'sender_id', wi.sender_id,
                'sender_name', sender.name,
                'sender_email', sender.email,
                'drive_file_id', wi.drive_file_id,
                'file_size', wi.file_size,
                'mime_type', wi.mime_type,
                'created_at', wi.created_at
              ) ORDER BY wi.created_at DESC
            )
            FROM workspace_items wi
            LEFT JOIN users sender ON sender.id = wi.sender_id
            WHERE wi.workspace_id = w.id
            LIMIT 10
          ) as items
        FROM workspaces w
        LEFT JOIN users u ON u.id = w.owner_id
        INNER JOIN workspace_members wm ON wm.workspace_id = w.id
        WHERE wm.user_id = $1
        ORDER BY w.updated_at DESC
      `, [userId]);
      
      return result.rows.map(row => ({
        ...row,
        items: row.items || []
      }));
    } finally {
      client.release();
    }
  }

  // Buscar workspace por ID
  static async getWorkspaceById(workspaceId: string, userId: string): Promise<any | null> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          w.*,
          u.name as owner_name,
          u.email as owner_email,
          (
            SELECT json_agg(
              json_build_object(
                'user_id', wm.user_id,
                'email', member.email,
                'name', member.name,
                'picture', member.picture,
                'joined_at', wm.joined_at
              )
            )
            FROM workspace_members wm
            LEFT JOIN users member ON member.id = wm.user_id
            WHERE wm.workspace_id = w.id
          ) as members,
          (
            SELECT json_agg(
              json_build_object(
                'id', wi.id,
                'type', wi.type,
                'content', wi.content,
                'title', wi.title,
                'sender_id', wi.sender_id,
                'sender_name', sender.name,
                'sender_email', sender.email,
                'drive_file_id', wi.drive_file_id,
                'file_size', wi.file_size,
                'mime_type', wi.mime_type,
                'created_at', wi.created_at
              ) ORDER BY wi.created_at ASC
            )
            FROM workspace_items wi
            LEFT JOIN users sender ON sender.id = wi.sender_id
            WHERE wi.workspace_id = w.id
          ) as items
        FROM workspaces w
        LEFT JOIN users u ON u.id = w.owner_id
        INNER JOIN workspace_members wm ON wm.workspace_id = w.id
        WHERE w.id = $1 AND wm.user_id = $2
      `, [workspaceId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const workspace = result.rows[0];
      return {
        ...workspace,
        members: workspace.members || [],
        items: workspace.items || []
      };
    } finally {
      client.release();
    }
  }

  // Adicionar item ao workspace
  static async addItem(workspaceId: string, senderId: string, item: {
    type: 'text' | 'link' | 'file';
    content: string;
    title?: string;
    driveFileId?: string;
    fileSize?: number;
    mimeType?: string;
  }): Promise<WorkspaceItem> {
    const client = await pool.connect();
    
    try {
      // Verificar se usuário tem acesso ao workspace
      const accessCheck = await client.query(
        'SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, senderId]
      );
      
      if (accessCheck.rows.length === 0) {
        throw new Error('User does not have access to this workspace');
      }
      
      // Inserir item
      const result = await client.query(`
        INSERT INTO workspace_items 
        (workspace_id, sender_id, type, content, title, drive_file_id, file_size, mime_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
      `, [
        workspaceId,
        senderId,
        item.type,
        item.content,
        item.title,
        item.driveFileId,
        item.fileSize,
        item.mimeType
      ]);
      
      // Atualizar timestamp do workspace
      await client.query(
        'UPDATE workspaces SET updated_at = NOW() WHERE id = $1',
        [workspaceId]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Ingressar em workspace público
  static async joinWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      // Verificar se workspace existe e é público
      const workspaceCheck = await client.query(
        'SELECT id, is_private FROM workspaces WHERE id = $1',
        [workspaceId]
      );
      
      if (workspaceCheck.rows.length === 0) {
        throw new Error('Workspace not found');
      }
      
      if (workspaceCheck.rows[0].is_private) {
        throw new Error('Cannot join private workspace');
      }
      
      // Verificar se já é membro
      const memberCheck = await client.query(
        'SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, userId]
      );
      
      if (memberCheck.rows.length > 0) {
        return true; // Já é membro
      }
      
      // Adicionar como membro
      await client.query(
        'INSERT INTO workspace_members (workspace_id, user_id) VALUES ($1, $2)',
        [workspaceId, userId]
      );
      
      return true;
    } finally {
      client.release();
    }
  }
}
