import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { WorkspaceService } from '../database/workspace.service';

const router: express.Router = express.Router();

// Get user's workspaces
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const workspaces = await WorkspaceService.getUserWorkspaces(req.userId!);
    res.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Create new workspace
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, isPrivate = false } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }
    
    const workspace = await WorkspaceService.createWorkspace(name.trim(), req.userId!, isPrivate);
    res.json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Get specific workspace
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const workspace = await WorkspaceService.getWorkspaceById(id, req.userId!);
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    res.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

export default router;
