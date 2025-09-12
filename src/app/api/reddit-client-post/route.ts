import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, text, subreddit } = await request.json();

    // Return Reddit OAuth URL for client-side authentication
    const clientId = process.env.REDDIT_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/reddit-callback`;
    
    const authUrl = `https://www.reddit.com/api/v1/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `state=random_string&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `duration=temporary&` +
      `scope=submit`;

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'Client-side Reddit authentication required',
      data: { title, text, subreddit }
    });

  } catch (error) {
    console.error('Reddit client post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to prepare Reddit post' },
      { status: 500 }
    );
  }
}
