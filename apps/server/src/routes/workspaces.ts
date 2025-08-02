import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { createWorkspace, getUserWorkspaces, workspaceStore } from '../store/workspace';

const router: express.Router = express.Router();

// Get user's workspaces
router.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const workspaces = getUserWorkspaces(req.userEmail!);
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Create new workspace
router.post('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { name, isPrivate = false } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }
    
    const workspace = createWorkspace(name.trim(), req.userEmail!, isPrivate);
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Get specific workspace
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const workspace = workspaceStore[id];
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    // Check if user has access
    if (!workspace.members.includes(req.userEmail!)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Join workspace by ID
router.post('/:id/join', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const workspace = workspaceStore[id];
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (workspace.isPrivate) {
      return res.status(403).json({ error: 'Cannot join private workspace' });
    }
    
    if (!workspace.members.includes(req.userEmail!)) {
      workspace.members.push(req.userEmail!);
    }
    
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join workspace' });
  }
});

export default router;
