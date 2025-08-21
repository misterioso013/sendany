import { NextRequest, NextResponse } from 'next/server';
import { driveService } from '@/lib/google-drive';
import { 
  getExpiredWorkspaces, 
  deleteWorkspaceCompletely,
  getUserDriveTokens,
  getWorkspaceFiles
} from '@/lib/databse';

// This endpoint should be called by a cron job
export async function POST(request: NextRequest) {
  try {
    // Verify API key for security (only in production if not from Vercel cron)
    const apiKey = request.headers.get('x-api-key');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    
    if (!isVercelCron && process.env.CLEANUP_API_KEY && apiKey !== process.env.CLEANUP_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expiredWorkspaces = await getExpiredWorkspaces();
    
    let cleanedCount = 0;
    let errors: string[] = [];

    for (const workspace of expiredWorkspaces) {
      try {
        console.log(`Cleaning up workspace: ${workspace.id} (${workspace.title})`);

        // If workspace has a user, get their Drive tokens to delete files
        if (workspace.user_id && workspace.drive_folder_id) {
          const driveTokens = await getUserDriveTokens(workspace.user_id);
          
          if (driveTokens) {
            // Check if token needs refresh
            if (new Date() >= driveTokens.expires_at) {
              try {
                const refreshedTokens = await driveService.refreshTokens(driveTokens.refresh_token);
                driveService.setCredentials({
                  access_token: refreshedTokens.access_token,
                  refresh_token: refreshedTokens.refresh_token,
                });
              } catch (refreshError) {
                console.error(`Failed to refresh tokens for user ${workspace.user_id}:`, refreshError);
                // Continue without Drive cleanup if token refresh fails
              }
            } else {
              driveService.setCredentials({
                access_token: driveTokens.access_token,
                refresh_token: driveTokens.refresh_token,
              });
            }

            // Delete workspace folder from Drive (this will delete all files in it)
            try {
              await driveService.deleteFolder(workspace.drive_folder_id);
              console.log(`Deleted Drive folder: ${workspace.drive_folder_id}`);
            } catch (driveError) {
              console.error(`Failed to delete Drive folder ${workspace.drive_folder_id}:`, driveError);
              errors.push(`Drive cleanup failed for workspace ${workspace.id}: ${driveError}`);
            }
          }
        }

        // Delete workspace from database (this will cascade to files)
        await deleteWorkspaceCompletely(workspace.id);
        cleanedCount++;
        
        console.log(`Successfully cleaned up workspace: ${workspace.id}`);

      } catch (error) {
        console.error(`Error cleaning up workspace ${workspace.id}:`, error);
        errors.push(`Workspace ${workspace.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. ${cleanedCount} workspace(s) cleaned up.`,
      cleanedCount,
      totalExpired: expiredWorkspaces.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Cleanup process failed:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup process failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check for expired workspaces without deleting
export async function GET() {
  try {
    const expiredWorkspaces = await getExpiredWorkspaces();
    
    const summary = expiredWorkspaces.map(workspace => ({
      id: workspace.id,
      title: workspace.title,
      user_id: workspace.user_id,
      expires_at: workspace.expires_at,
      drive_folder_id: workspace.drive_folder_id,
    }));

    return NextResponse.json({
      count: expiredWorkspaces.length,
      workspaces: summary,
    });

  } catch (error) {
    console.error('Error checking expired workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to check expired workspaces' },
      { status: 500 }
    );
  }
}
