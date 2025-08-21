import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';

// Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

// Storage limits (in bytes)
export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB per file
  MAX_WORKSPACE_SIZE: 500 * 1024 * 1024, // 500MB per workspace
  MAX_USER_STORAGE: 5 * 1024 * 1024 * 1024, // 5GB per user
};

// Scopes needed for Google Drive
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Create and access files created by the app
  'https://www.googleapis.com/auth/userinfo.email', // Get user email
];

export interface DriveTokens {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  scope: string;
  email?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  webViewLink?: string;
  downloadUrl?: string;
}

export class GoogleDriveService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
  }

  // Generate authorization URL
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string): Promise<DriveTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get required tokens');
    }

    // Get user email
    this.oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
      scope: tokens.scope || SCOPES.join(' '),
      email: userInfo.data.email || undefined,
    };
  }

  // Refresh access token using refresh token
  async refreshTokens(refreshToken: string): Promise<DriveTokens> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    return {
      access_token: credentials.access_token,
      refresh_token: refreshToken, // Keep the same refresh token
      expires_at: new Date(credentials.expiry_date || Date.now() + 3600 * 1000),
      scope: credentials.scope || SCOPES.join(' '),
    };
  }

  // Set credentials for API calls
  setCredentials(tokens: { access_token: string; refresh_token: string }) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Create SendAny folder in user's Drive
  async createSendAnyFolder(): Promise<string> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    // Check if SendAny folder already exists
    const existingFolders = await drive.files.list({
      q: "name='SendAny' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)',
    });

    if (existingFolders.data.files && existingFolders.data.files.length > 0) {
      return existingFolders.data.files[0].id!;
    }

    // Create new SendAny folder
    const folder = await drive.files.create({
      requestBody: {
        name: 'SendAny',
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Files uploaded to SendAny application',
      },
      fields: 'id',
    });

    return folder.data.id!;
  }

  // Create workspace folder inside SendAny folder
  async createWorkspaceFolder(workspaceId: string, workspaceTitle: string, parentFolderId: string): Promise<string> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    const folder = await drive.files.create({
      requestBody: {
        name: `${workspaceTitle} (${workspaceId})`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
        description: `Workspace: ${workspaceTitle}`,
      },
      fields: 'id',
    });

    return folder.data.id!;
  }

  // Upload file to workspace folder
  async uploadFile(
    file: Buffer | string,
    filename: string,
    mimeType: string,
    parentFolderId: string
  ): Promise<DriveFile> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    const fileMetadata = {
      name: filename,
      parents: [parentFolderId],
    };

    // Convert Buffer to Readable stream
    let fileStream: Readable;
    if (typeof file === 'string') {
      fileStream = Readable.from([file]);
    } else {
      fileStream = Readable.from([file]);
    }

    const media = {
      mimeType: mimeType,
      body: fileStream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, size, mimeType',
    });

    const fileData = response.data;
    const fileId = fileData.id!;

    // Make file publicly viewable for direct access
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permissionError) {
      console.warn('Failed to make file public:', permissionError);
    }

    // Generate appropriate URL based on mime type
    let directUrl: string;
    if (mimeType.startsWith('image/')) {
      // For images, use multiple fallback URLs
      // Primary: Google Drive direct link that sometimes works
      directUrl = `https://lh3.googleusercontent.com/d/${fileId}=s2000`;
    } else if (mimeType.startsWith('video/')) {
      // For videos, use the preview URL
      directUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
      // For other files, use download URL
      directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    return {
      id: fileId,
      name: fileData.name!,
      size: parseInt(fileData.size || '0'),
      mimeType: fileData.mimeType!,
      webViewLink: directUrl,
    };
  }

  // Delete file from Drive
  async deleteFile(fileId: string): Promise<void> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    await drive.files.delete({ fileId });
  }

  // Delete folder and all contents
  async deleteFolder(folderId: string): Promise<void> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    await drive.files.delete({ fileId: folderId });
  }

  // Get file content
  async getFileContent(fileId: string): Promise<Buffer> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    });

    return Buffer.from(response.data as string);
  }

  // Get folder size (total size of all files in folder)
  async getFolderSize(folderId: string): Promise<number> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    const files = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(size)',
    });

    let totalSize = 0;
    for (const file of files.data.files || []) {
      totalSize += parseInt(file.size || '0');
    }

    return totalSize;
  }

  // Check available storage for user
  async checkStorageQuota(): Promise<{ used: number; total: number; available: number }> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    const about = await drive.about.get({
      fields: 'storageQuota',
    });

    const quota = about.data.storageQuota!;
    const used = parseInt(quota.usage || '0');
    const total = parseInt(quota.limit || '0');
    const available = total - used;

    return { used, total, available };
  }

  // Validate file before upload
  validateFile(file: { size: number; type: string }, currentWorkspaceSize: number, userStorageUsed: number): {
    valid: boolean;
    error?: string;
  } {
    // Check file size
    if (file.size > STORAGE_LIMITS.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds limit of ${STORAGE_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Check workspace size
    if (currentWorkspaceSize + file.size > STORAGE_LIMITS.MAX_WORKSPACE_SIZE) {
      return {
        valid: false,
        error: `Workspace size would exceed limit of ${STORAGE_LIMITS.MAX_WORKSPACE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Check user total storage
    if (userStorageUsed + file.size > STORAGE_LIMITS.MAX_USER_STORAGE) {
      return {
        valid: false,
        error: `User storage would exceed limit of ${STORAGE_LIMITS.MAX_USER_STORAGE / (1024 * 1024 * 1024)}GB`,
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const driveService = new GoogleDriveService();
