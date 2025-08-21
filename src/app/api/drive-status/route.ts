import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserDriveTokens, getUserStorageUsage } from '@/lib/databse';
import { STORAGE_LIMITS } from '@/lib/google-drive';

export async function GET() {
  try {
    // Check if Google Drive credentials are configured
    const isGoogleDriveConfigured = !!(
      process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET
    );

    if (!isGoogleDriveConfigured) {
      return NextResponse.json({
        available: false,
        connected: false,
        reason: 'Google Drive integration not configured',
        storage: {
          used: 0,
          limit: STORAGE_LIMITS.MAX_USER_STORAGE,
          percentage: 0,
        },
        limits: STORAGE_LIMITS,
      });
    }

    // Check if user is authenticated
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({
        available: true,
        connected: false,
        reason: 'User not authenticated',
        storage: {
          used: 0,
          limit: STORAGE_LIMITS.MAX_USER_STORAGE,
          percentage: 0,
        },
        limits: STORAGE_LIMITS,
      });
    }

    // Check if user has connected their Google Drive
    const driveTokens = await getUserDriveTokens(user.id);
    const storageUsed = await getUserStorageUsage(user.id);

    return NextResponse.json({
      available: true,
      connected: !!driveTokens,
      driveEmail: driveTokens?.drive_email,
      reason: driveTokens ? undefined : 'Google Drive not connected',
      storage: {
        used: storageUsed,
        limit: STORAGE_LIMITS.MAX_USER_STORAGE,
        percentage: Math.round((storageUsed / STORAGE_LIMITS.MAX_USER_STORAGE) * 100),
      },
      limits: STORAGE_LIMITS,
    });

  } catch (error) {
    console.error('Error checking drive status:', error);
    return NextResponse.json({
      available: false,
      connected: false,
      reason: 'Failed to check Google Drive status',
      storage: {
        used: 0,
        limit: STORAGE_LIMITS.MAX_USER_STORAGE,
        percentage: 0,
      },
      limits: STORAGE_LIMITS,
    });
  }
}
