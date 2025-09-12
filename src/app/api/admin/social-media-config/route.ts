import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check Reddit configuration
    const redditConfigured = !!(
      process.env.REDDIT_CLIENT_ID &&
      process.env.REDDIT_CLIENT_SECRET &&
      process.env.REDDIT_USERNAME &&
      process.env.REDDIT_PASSWORD
    );

    // Check Facebook configuration
    const facebookConfigured = !!(
      process.env.FACEBOOK_APP_ID &&
      process.env.FACEBOOK_APP_SECRET &&
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN &&
      process.env.FACEBOOK_PAGE_ID
    );

    // Check Twitter configuration
    const twitterConfigured = !!(
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET &&
      process.env.TWITTER_BEARER_TOKEN
    );

    // Check Discord configuration
    const discordConfigured = !!process.env.DISCORD_WEBHOOK_URL;

    // Check Telegram configuration
    const telegramConfigured = !!(
      process.env.TELEGRAM_BOT_TOKEN &&
      process.env.TELEGRAM_CHAT_ID
    );

    const config = {
      reddit: {
        configured: redditConfigured,
        enabled: redditConfigured,
        REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID ? '••••••••' : '',
        REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET ? '••••••••' : '',
        REDDIT_USERNAME: process.env.REDDIT_USERNAME || '',
        REDDIT_PASSWORD: process.env.REDDIT_PASSWORD ? '••••••••' : '',
        REDDIT_SUBREDDIT: process.env.REDDIT_SUBREDDIT || 'startups',
      },
      facebook: {
        configured: facebookConfigured,
        enabled: facebookConfigured,
        FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID ? '••••••••' : '',
        FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET ? '••••••••' : '',
        FACEBOOK_PAGE_ACCESS_TOKEN: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? '••••••••' : '',
        FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID ? '••••••••' : '',
      },
      twitter: {
        configured: twitterConfigured,
        enabled: twitterConfigured,
        TWITTER_API_KEY: process.env.TWITTER_API_KEY ? '••••••••' : '',
        TWITTER_API_SECRET: process.env.TWITTER_API_SECRET ? '••••••••' : '',
        TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN ? '••••••••' : '',
        TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET ? '••••••••' : '',
        TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN ? '••••••••' : '',
      },
      discord: {
        configured: discordConfigured,
        enabled: discordConfigured,
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ? '••••••••' : '',
      },
      telegram: {
        configured: telegramConfigured,
        enabled: telegramConfigured,
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? '••••••••' : '',
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
      },
      globalSettings: {
        autoShareEnabled: process.env.SOCIAL_MEDIA_AUTO_SHARE === 'true',
        shareOnApproval: true,
        shareOnFeatured: true,
        maxPostsPerHour: parseInt(process.env.SOCIAL_MEDIA_MAX_POSTS_PER_HOUR || '10'),
      }
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading social media config:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}
