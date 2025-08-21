import { NextRequest, NextResponse } from 'next/server';
import { driveService, STORAGE_LIMITS } from '@/lib/google-drive';
import { 
  getUserDriveTokens, 
  getUserStorageUsage, 
  getWorkspaceSize,
  updateUserStorageUsed,
  updateWorkspaceFileDriveId,
  updateWorkspaceDriveFolder,
  getWorkspaceById,
  saveUserDriveTokens
} from '@/lib/databse';
import { stackServerApp } from '@/stack';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user's Drive tokens
    const driveTokens = await getUserDriveTokens(user.id);
    if (!driveTokens) {
      return NextResponse.json(
        { error: 'Google Drive not connected. Please connect your Google Drive first.' },
        { status: 400 }
      );
    }

    // Check if token needs refresh
    if (new Date() >= driveTokens.expires_at) {
      try {
        const refreshedTokens = await driveService.refreshTokens(driveTokens.refresh_token);
        await saveUserDriveTokens({
          user_id: user.id,
          access_token: refreshedTokens.access_token,
          refresh_token: refreshedTokens.refresh_token,
          expires_at: refreshedTokens.expires_at,
          scope: refreshedTokens.scope,
        });
        driveService.setCredentials({
          access_token: refreshedTokens.access_token,
          refresh_token: refreshedTokens.refresh_token,
        });
      } catch (error) {
        console.error('Failed to refresh tokens:', error);
        return NextResponse.json(
          { error: 'Google Drive token expired. Please reconnect your Google Drive.' },
          { status: 401 }
        );
      }
    } else {
      driveService.setCredentials({
        access_token: driveTokens.access_token,
        refresh_token: driveTokens.refresh_token,
      });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workspaceId = formData.get('workspaceId') as string;
    const fileId = formData.get('fileId') as string; // Database file ID (optional for new uploads)

    if (!file || !workspaceId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, workspaceId' },
        { status: 400 }
      );
    }

    // Get workspace to verify ownership
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (workspace.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get current storage usage
    const currentUserStorage = await getUserStorageUsage(user.id);
    const currentWorkspaceSize = await getWorkspaceSize(workspaceId);

    // Validate file size and storage limits
    const validation = driveService.validateFile(
      { size: file.size, type: file.type },
      currentWorkspaceSize,
      currentUserStorage
    );

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Create workspace folder in Drive if not exists
    let workspaceFolderId = workspace.drive_folder_id;
    if (!workspaceFolderId) {
      // Create or get SendAny main folder
      const sendAnyFolderId = await driveService.createSendAnyFolder();
      
      // Create workspace folder
      workspaceFolderId = await driveService.createWorkspaceFolder(
        workspaceId,
        workspace.title,
        sendAnyFolderId
      );

      // Update workspace with folder ID
      await updateWorkspaceDriveFolder(workspaceId, workspaceFolderId);
    }

    // Upload file to Drive
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const driveFile = await driveService.uploadFile(
      fileBuffer,
      file.name,
      file.type,
      workspaceFolderId
    );

    // Update database with Drive file ID if fileId is provided
    if (fileId) {
      await updateWorkspaceFileDriveId(fileId, driveFile.id);
    }

    // Update user's storage usage
    await updateUserStorageUsed(user.id, currentUserStorage + file.size);

    return NextResponse.json({
      success: true,
      driveFile: {
        id: driveFile.id,
        name: driveFile.name,
        size: driveFile.size,
        webViewLink: driveFile.webViewLink,
      },
      storage: {
        used: currentUserStorage + file.size,
        limit: STORAGE_LIMITS.MAX_USER_STORAGE,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Get user's storage information
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const driveTokens = await getUserDriveTokens(user.id);
    const storageUsed = await getUserStorageUsage(user.id);

    return NextResponse.json({
      connected: !!driveTokens,
      driveEmail: driveTokens?.drive_email,
      storage: {
        used: storageUsed,
        limit: STORAGE_LIMITS.MAX_USER_STORAGE,
        percentage: Math.round((storageUsed / STORAGE_LIMITS.MAX_USER_STORAGE) * 100),
      },
      limits: STORAGE_LIMITS,
    });

  } catch (error) {
    console.error('Error getting storage info:', error);
    return NextResponse.json(
      { error: 'Failed to get storage information' },
      { status: 500 }
    );
  }
}
