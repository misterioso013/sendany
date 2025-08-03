import express from 'express';
import { oauth2Client } from '../google/client';
import { google } from 'googleapis';
import { UserService, SessionService } from '../database/user.service';

const router: express.Router = express.Router();

router.get('/', async (req, res) => {
  const code  = req.query.code as string;

  if (!code) return res.status(400).send('Missing code parameter');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Obtem informações do usuário
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    const name = userInfo.data.name;
    const picture = userInfo.data.picture;
    const googleId = userInfo.data.id;

    if (!email) return res.status(500).send('Unable to get user email');

    // Buscar ou criar usuário no banco
    const user = await UserService.findOrCreateUser(email, name || undefined, picture || undefined, googleId || undefined);
    
    // Criar sessão
    const session = await SessionService.createSession(user.id, tokens);

    // Salva token de sessão em cookie com configurações para cross-domain
    res.cookie('sessionToken', session.session_token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true apenas em HTTPS/produção
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' para cross-domain em produção
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined // Configure para seu domínio em produção
    });
    
    console.log('Usuario logado:', email, 'Session:', session.session_token);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/workspaces`);
  } catch (err) {
    console.error('Erro na autenticação:', err);
    res.status(500).send('Auth failed');
  }
});

export default router;