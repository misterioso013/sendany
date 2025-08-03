import { pool, User, UserSession } from './config';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  // Buscar ou criar usuário
  static async findOrCreateUser(email: string, name?: string, picture?: string, googleId?: string): Promise<User> {
    const client = await pool.connect();
    
    try {
      // Primeiro, tenta encontrar o usuário
      let result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length > 0) {
        // Usuário existe, atualiza informações se necessário
        if (name || picture) {
          await client.query(
            'UPDATE users SET name = COALESCE($1, name), picture = COALESCE($2, picture), google_id = COALESCE($3, google_id), updated_at = NOW() WHERE email = $4',
            [name, picture, googleId, email]
          );
          
          // Busca novamente com dados atualizados
          result = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
          );
        }
        return result.rows[0];
      } else {
        // Usuário não existe, cria novo
        const newUser = await client.query(
          'INSERT INTO users (email, name, picture, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
          [email, name, picture, googleId]
        );
        return newUser.rows[0];
      }
    } finally {
      client.release();
    }
  }

  // Buscar usuário por ID
  static async findById(id: string): Promise<User | null> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  // Buscar usuário por email
  static async findByEmail(email: string): Promise<User | null> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }
}

export class SessionService {
  // Criar nova sessão
  static async createSession(userId: string, googleTokens: any): Promise<UserSession> {
    const client = await pool.connect();
    
    try {
      const sessionToken = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
      
      const result = await client.query(
        'INSERT INTO user_sessions (user_id, session_token, google_tokens, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, sessionToken, JSON.stringify(googleTokens), expiresAt]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Buscar sessão por token
  static async findByToken(sessionToken: string): Promise<UserSession | null> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM user_sessions WHERE session_token = $1 AND expires_at > NOW()',
        [sessionToken]
      );
      
      if (result.rows.length > 0) {
        // Atualiza last_used_at
        await client.query(
          'UPDATE user_sessions SET last_used_at = NOW() WHERE id = $1',
          [result.rows[0].id]
        );
        
        return result.rows[0];
      }
      
      return null;
    } finally {
      client.release();
    }
  }

  // Remover sessão (logout)
  static async removeSession(sessionToken: string): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM user_sessions WHERE session_token = $1',
        [sessionToken]
      );
      
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  // Limpar sessões expiradas
  static async cleanExpiredSessions(): Promise<number> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM user_sessions WHERE expires_at < NOW()'
      );
      
      return result.rowCount || 0;
    } finally {
      client.release();
    }
  }
}
