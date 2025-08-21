import { NextRequest, NextResponse } from 'next/server';
import { driveService } from '@/lib/google-drive';
import { saveUserDriveTokens } from '@/lib/databse';
import { stackServerApp } from '@/stack';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?error=missing_auth_code', request.url));
    }

    // Get the current user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.redirect(new URL('/handler/sign-in?after=google-drive', request.url));
    }

    // Exchange code for tokens
    const tokens = await driveService.getTokens(code);

    // Save tokens to database
    await saveUserDriveTokens({
      user_id: user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      scope: tokens.scope,
      drive_email: tokens.email,
    });

    // Redirect to dashboard with success message
    return NextResponse.redirect(new URL('/dashboard?success=google_drive_connected', request.url));

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(new URL('/dashboard?error=google_auth_processing_failed', request.url));
  }
}
