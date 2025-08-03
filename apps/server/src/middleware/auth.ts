import { Request, Response, NextFunction } from 'express';
import { createClientWithCredentials } from '../google/client';
import { SessionService, UserService } from '../database/user.service';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  user?: any;
  driveAuth?: any;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const sessionToken = req.cookies?.sessionToken;

  if (!sessionToken) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      requiresAuth: true,
      message: 'Faça login para continuar'
    });
  }

  try {
    const session = await SessionService.findByToken(sessionToken);
    
    if (!session) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        requiresAuth: true,
        message: 'Sessão inválida ou expirada, faça login novamente'
      });
    }

    // Buscar dados do usuário
    const user = await UserService.findById(session.user_id);
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        requiresAuth: true,
        message: 'Usuário não encontrado'
      });
    }

    // Criar cliente do Google Drive
    let googleTokens;
    try {
      googleTokens = typeof session.google_tokens === 'string' 
        ? JSON.parse(session.google_tokens) 
        : session.google_tokens;
    } catch (error) {
      console.error('Erro ao fazer parse dos tokens do Google:', error);
      return res.status(401).json({ 
        error: 'Unauthorized', 
        requiresAuth: true,
        message: 'Tokens de autenticação inválidos'
      });
    }
    
    const userClient = createClientWithCredentials(googleTokens);
    
    req.userId = user.id;
    req.userEmail = user.email;
    req.user = user;
    req.driveAuth = userClient;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      requiresAuth: true,
      message: 'Erro na validação da sessão'
    });
  }
}