// For App Router: app/api/download-image/route.js
import { NextResponse } from 'next/server';

export async function POST(request:Request) {
  try {
    const { imageUrl } = await request.json();
    
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    
    const imageBuffer = await response.arrayBuffer();
    
    const url = new URL(imageUrl);
    const filename = decodeURIComponent(url.pathname.split('/').pop() || 'image.jpg');
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: `Download failed - ${error}` }, { status: 500 });
  }
}