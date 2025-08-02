import express from 'express';
import multer from 'multer';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { addItemToWorkspace, workspaceStore } from '../store/workspace';
import { uploadFileToDrive } from '../google/drive';

const router: express.Router = express.Router();

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

interface MulterRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

// Add any type of item to workspace (unified endpoint)
router.post('/:workspaceId', upload.single('file'), async (req: MulterRequest, res) => {
  try {
    const { workspaceId } = req.params;
    const { content, title, type } = req.body;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const workspace = workspaceStore[workspaceId];
    if (!workspace || !workspace.members.includes(req.userEmail!)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let item;
    
    if (type === 'file' && req.file) {
      // Handle file upload
      try {
        const driveFile = await uploadFileToDrive(req.driveAuth!, {
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          buffer: req.file.buffer
        });
        
        item = addItemToWorkspace(workspaceId, {
          type: 'file',
          content: driveFile.webContentLink || '',
          title: req.file.originalname,
          driveFileId: driveFile.id || undefined,
          sender: req.userEmail!,
          size: req.file.size,
          mimeType: req.file.mimetype
        });
      } catch (error) {
        console.error('Drive upload error:', error);
        return res.status(500).json({ error: 'Failed to upload file to Drive' });
      }
    } else if (type === 'text' || type === 'link') {
      // Handle text/link
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      item = addItemToWorkspace(workspaceId, {
        type: type as 'text' | 'link',
        content: content.trim(),
        title: title?.trim(),
        sender: req.userEmail!
      });
    } else {
      return res.status(400).json({ error: 'Invalid item type or missing file' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Add text item to workspace
router.post('/:workspaceId/text', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { workspaceId } = req.params;
    const { content, title } = req.body;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const workspace = workspaceStore[workspaceId];
    if (!workspace || !workspace.members.includes(req.userEmail!)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const item = addItemToWorkspace(workspaceId, {
      type: 'text',
      content: content.trim(),
      title: title?.trim(),
      sender: req.userEmail!
    });
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add text item' });
  }
});

// Add link item to workspace
router.post('/:workspaceId/link', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { workspaceId } = req.params;
    const { content, title } = req.body;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Link is required' });
    }
    
    const workspace = workspaceStore[workspaceId];
    if (!workspace || !workspace.members.includes(req.userEmail!)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const item = addItemToWorkspace(workspaceId, {
      type: 'link',
      content: content.trim(),
      title: title?.trim(),
      sender: req.userEmail!
    });
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add link item' });
  }
});

// Add file item to workspace
router.post('/:workspaceId/file', authMiddleware, upload.single('file'), async (req: MulterRequest, res) => {
  try {
    const { workspaceId } = req.params;
    const file = req.file;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }
    
    const workspace = workspaceStore[workspaceId];
    if (!workspace || !workspace.members.includes(req.userEmail!)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Upload to Google Drive
    const driveFile = await uploadFileToDrive(req.driveAuth!, {
      filename: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
      folderId: process.env.DRIVE_FOLDER_ID
    });
    
    const item = addItemToWorkspace(workspaceId, {
      type: 'file',
      content: file.originalname,
      title: file.originalname,
      driveFileId: driveFile.id!,
      sender: req.userEmail!,
      size: file.size,
      mimeType: file.mimetype
    });
    
    res.json(item);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
