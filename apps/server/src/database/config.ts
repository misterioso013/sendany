import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_C4JIFSBhD9Yc@ep-morning-hat-ad0oh2k3-pooler.c-2.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

// Configuração do pool de conexões
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Função para verificar a conexão
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Conectado ao banco de dados:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Erro na conexão com o banco:', error);
    return false;
  }
}

// Interface para usuário
export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  google_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Interface para sessão
export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  google_tokens: any;
  expires_at: Date;
  created_at: Date;
  last_used_at: Date;
}

// Interface para workspace
export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  is_private: boolean;
  created_at: Date;
  updated_at: Date;
}

// Interface para workspace item
export interface WorkspaceItem {
  id: string;
  workspace_id: string;
  sender_id: string;
  type: 'text' | 'link' | 'file';
  content: string;
  title?: string;
  drive_file_id?: string;
  file_size?: number;
  mime_type?: string;
  created_at: Date;
}
