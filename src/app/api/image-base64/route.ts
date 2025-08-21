import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(imageUrl);
    
    // Fetch the image from Google Drive
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Convert to base64
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      contentType,
      size: imageBuffer.byteLength,
    });

  } catch (error) {
    console.error('Image to base64 error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
