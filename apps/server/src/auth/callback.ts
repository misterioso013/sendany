import express from 'express';
import { oauth2Client } from '../google/client';
import { google } from 'googleapis';
import { tokenStore } from '../store/memory';

const router: express.Router = express.Router();

router.get('/', async (req, res) => {
  const code  = req.query.code as string;

  if (!code) return res.status(400).send('Missing code parameter');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Obtem e-mail do usuário
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    if (!email) return res.status(500).send('Unable to get user email');

    // Armazena o token
    tokenStore[email] = tokens;

    // Salva em cookie simples (exemplo)
    res.cookie('user', email, { httpOnly: true });
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000'); // Redireciona para o frontend
  } catch (err) {
    console.error(err);
    res.status(500).send('Auth failed');
  }
});

export default router;