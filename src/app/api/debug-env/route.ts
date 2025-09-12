import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    SOCIAL_MEDIA_AUTO_SHARE: process.env.SOCIAL_MEDIA_AUTO_SHARE,
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID ? '✅ Set' : '❌ Missing',
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    REDDIT_USERNAME: process.env.REDDIT_USERNAME ? '✅ Set' : '❌ Missing',
    REDDIT_PASSWORD: process.env.REDDIT_PASSWORD ? '✅ Set' : '❌ Missing',
    REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT ? '✅ Set' : '❌ Missing',
    REDDIT_SUBREDDIT: process.env.REDDIT_SUBREDDIT || 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  });
}
