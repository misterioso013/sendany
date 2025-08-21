import { NextRequest, NextResponse } from 'next/server';
import { driveService } from '@/lib/google-drive';

export async function GET() {
  try {
    const authUrl = driveService.getAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
