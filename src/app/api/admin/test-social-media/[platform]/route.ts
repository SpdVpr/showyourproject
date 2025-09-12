import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;

    switch (platform) {
      case 'reddit':
        return await testRedditConnection();
      case 'facebook':
        return await testFacebookConnection();
      case 'twitter':
        return await testTwitterConnection();
      case 'discord':
        return await testDiscordConnection();
      case 'telegram':
        return await testTelegramConnection();
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown platform' },
          { status: 400 }
        );
    }
  } catch (error) {
    const { platform } = await params;
    console.error(`Error testing ${platform} connection:`, error);
    return NextResponse.json(
      { success: false, error: 'Connection test failed' },
      { status: 500 }
    );
  }
}

async function testRedditConnection() {
  try {
    // Check if all required environment variables are present
    if (!process.env.REDDIT_CLIENT_ID || 
        !process.env.REDDIT_CLIENT_SECRET || 
        !process.env.REDDIT_USERNAME || 
        !process.env.REDDIT_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Reddit credentials not configured in environment variables'
      });
    }

    // Test Reddit authentication
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': process.env.REDDIT_USER_AGENT || 'ShowYourProject:v1.0.0',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: process.env.REDDIT_USERNAME!,
        password: process.env.REDDIT_PASSWORD!,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: result.error_description || 'Reddit authentication failed'
      });
    }

    // Test subreddit access
    const subreddit = process.env.REDDIT_SUBREDDIT || 'startups';
    const subredditResponse = await fetch(`https://oauth.reddit.com/r/${subreddit}/about`, {
      headers: {
        'Authorization': `Bearer ${result.access_token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'ShowYourProject:v1.0.0',
      },
    });

    if (!subredditResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `Cannot access subreddit r/${subreddit}`
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully connected to Reddit and verified access to r/${subreddit}`
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testFacebookConnection() {
  if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN || !process.env.FACEBOOK_PAGE_ID) {
    return NextResponse.json({
      success: false,
      error: 'Facebook credentials not configured'
    });
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Facebook API connection failed'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Facebook'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testTwitterConnection() {
  if (!process.env.TWITTER_BEARER_TOKEN) {
    return NextResponse.json({
      success: false,
      error: 'Twitter credentials not configured'
    });
  }

  try {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Twitter API connection failed'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Twitter'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testDiscordConnection() {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    return NextResponse.json({
      success: false,
      error: 'Discord webhook URL not configured'
    });
  }

  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: '🧪 **Connection Test** - ShowYourProject.com social media integration is working!',
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Discord webhook test failed'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully sent test message to Discord'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testTelegramConnection() {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return NextResponse.json({
      success: false,
      error: 'Telegram credentials not configured'
    });
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: '🧪 **Connection Test** - ShowYourProject.com social media integration is working!',
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Telegram API connection failed'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully sent test message to Telegram'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
