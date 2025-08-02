import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { google } from 'googleapis';

const router: express.Router = express.Router();

// Get current user info
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    // Get user info from Google OAuth
    const oauth2 = google.oauth2({ version: 'v2', auth: req.driveAuth });
    const userInfo = await oauth2.userinfo.get();
    
    res.json({
      email: req.userEmail,
      name: userInfo.data.name,
      picture: userInfo.data.picture
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

export default router;
