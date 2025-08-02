import { Request, Response, NextFunction } from 'express';
import { createClientWithCredentials, oauth2Client } from '../google/client';
import { tokenStore } from '../store/memory';

export interface AuthenticatedRequest extends Request {
  userEmail?: string;
  driveAuth?: typeof oauth2Client;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const email = req.cookies?.user;

  if(!email || !(email in tokenStore)) {
    return res.status(401).json({ error: 'Unauthorized', requiresAuth: true });
  }

  const userClient = createClientWithCredentials(tokenStore[email]!);
  req.userEmail = email;
  req.driveAuth = userClient;
  next();
}