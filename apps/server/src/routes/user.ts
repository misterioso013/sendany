import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router: express.Router = express.Router();

// Get current user info
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

export default router;
