import express from 'express';
import multer from 'multer';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { WorkspaceService } from '../database/workspace.service';
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
router.post('/:workspaceId/items', authMiddleware, upload.single('file'), async (req: MulterRequest, res) => {
  try {
    const { workspaceId } = req.params;
    const { content, title, type } = req.body;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Valid workspace ID is required' });
    }
    
    const workspace = await WorkspaceService.getWorkspaceById(workspaceId, req.userId!);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
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
        
        item = await WorkspaceService.addItem(workspaceId, req.userId!, {
          type: 'file',
          content: driveFile.webContentLink || '',
          title: req.file.originalname,
          driveFileId: driveFile.id || undefined,
          fileSize: req.file.size,
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
      
      item = await WorkspaceService.addItem(workspaceId, req.userId!, {
        type: type as 'text' | 'link',
        content: content.trim(),
        title: title?.trim()
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

export default router;
