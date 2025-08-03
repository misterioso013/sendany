import express from 'express';
import { SessionService } from '../database/user.service';

const router: express.Router = express.Router();

router.post('/', async (req, res) => {
  try {
    const sessionToken = req.cookies?.sessionToken;
    
    if (sessionToken) {
      // Remove sessão do banco de dados
      await SessionService.removeSession(sessionToken);
    }
    
    // Limpa o cookie
    res.clearCookie('sessionToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
    });
    
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
