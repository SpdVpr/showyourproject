# 🚀 Social Media Auto-Sharing Setup Guide

This guide will help you set up automatic social media sharing for ShowYourProject.com. When projects are approved, they will be automatically shared across your configured social media platforms.

## 📋 Overview

The auto-sharing system supports:
- **Facebook** - Share to Facebook Pages
- **Twitter/X** - Post tweets with project details
- **Discord** - Send rich embeds to Discord channels
- **Reddit** - Submit posts to relevant subreddits
- **Telegram** - Send messages to channels/groups

## 🔧 Platform Setup Instructions

### 1. Facebook Setup

**Requirements:**
- Facebook Developer Account
- Facebook Page (not personal profile)
- Facebook App with Pages permissions

**Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app → "Business" type
3. Add "Pages" product to your app
4. Generate a Page Access Token:
   - Go to Graph API Explorer
   - Select your app and page
   - Request permissions: `pages_manage_posts`, `pages_read_engagement`
   - Generate token and make it permanent
5. Get your Page ID from your Facebook Page settings

**Environment Variables:**
```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
FACEBOOK_PAGE_ID=your_facebook_page_id
```

### 2. Twitter/X Setup

**Requirements:**
- Twitter Developer Account
- Twitter API v2 access (Essential tier is sufficient)

**Steps:**
1. Apply for Twitter Developer Account at [developer.twitter.com](https://developer.twitter.com)
2. Create a new project and app
3. Generate API keys and tokens:
   - API Key and Secret
   - Access Token and Secret
   - Bearer Token
4. Ensure your app has "Read and Write" permissions

**Environment Variables:**
```env
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

### 3. Discord Setup (Easiest!)

**Requirements:**
- Discord server where you have admin permissions

**Steps:**
1. Go to your Discord server
2. Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Choose the channel where posts should appear
5. Copy the webhook URL

**Environment Variables:**
```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
```

### 4. Reddit Setup

**Requirements:**
- Reddit account
- Reddit app credentials

**Steps:**
1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose "script" type
4. Note down client ID and secret
5. Choose target subreddit (e.g., "startups", "SideProject")

**Environment Variables:**
```env
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=ShowYourProject:v1.0.0 (by /u/yourusername)
REDDIT_SUBREDDIT=startups
```

**Important:** Follow subreddit rules for self-promotion!

### 5. Telegram Setup

**Requirements:**
- Telegram account
- Telegram channel or group

**Steps:**
1. Create a bot by messaging [@BotFather](https://t.me/botfather)
2. Use `/newbot` command and follow instructions
3. Get your bot token
4. Add bot to your channel/group as admin
5. Get chat ID:
   - For channels: Use @username or -100xxxxxxxxx format
   - For groups: Use group invite link method or bot API

**Environment Variables:**
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_channel_or_group_id
```

## ⚙️ Configuration

### Global Settings

Add these to your `.env.local` file:

```env
# Enable/disable auto-sharing
SOCIAL_MEDIA_AUTO_SHARE=true

# Rate limiting (posts per hour)
SOCIAL_MEDIA_MAX_POSTS_PER_HOUR=10
```

### Admin Panel Configuration

1. Go to Admin Dashboard → Social Media tab
2. Configure each platform with your API credentials
3. Test connections to ensure everything works
4. Enable/disable platforms as needed
5. Preview post templates

## 📝 Post Templates

The system uses different templates for each platform:

### Facebook
- Full project description
- Website link
- ShowYourProject.com link
- Relevant hashtags

### Twitter/X
- Concise format (280 char limit)
- Project name and tagline
- Website link
- Key hashtags

### Discord
- Rich embed with thumbnail
- Project details in structured format
- Clickable links

### Reddit
- Title: "🚀 ProjectName - Tagline"
- Full description with formatting
- Links and attribution

### Telegram
- Markdown formatting
- Project details with emojis
- Clickable links

## 🔄 How It Works

1. **Project Approval**: When admin approves a project
2. **Auto-Trigger**: System automatically starts sharing process
3. **Platform Check**: Verifies which platforms are enabled and configured
4. **Sequential Posting**: Posts to each platform with 2-second delays
5. **Error Handling**: Logs any failures for admin review
6. **Database Update**: Tracks sharing status in project record

## 📊 Monitoring

### Admin Dashboard Features:
- **Activity Logs**: View all posts and their status
- **Error Tracking**: See failed posts and reasons
- **Platform Statistics**: Success rates per platform
- **Post Preview**: See how posts will look
- **Export Logs**: Download activity data

### Key Metrics:
- Total posts sent
- Success/failure rates
- Platform performance
- Error frequency

## 🚨 Troubleshooting

### Common Issues:

**Facebook:**
- Token expired → Regenerate Page Access Token
- Permission denied → Check page permissions
- Rate limited → Reduce posting frequency

**Twitter:**
- Authentication failed → Verify all 5 credentials
- Tweet too long → Template will auto-truncate
- Rate limited → Twitter has strict limits

**Discord:**
- Webhook invalid → Regenerate webhook URL
- Channel permissions → Ensure webhook has send permissions

**Reddit:**
- Authentication failed → Check username/password
- Subreddit rules → Ensure compliance with posting rules
- Rate limited → Reddit has strict anti-spam measures

**Telegram:**
- Bot not admin → Add bot as admin to channel
- Chat ID wrong → Verify chat ID format
- Message too long → Template will truncate

### Debug Steps:
1. Check Admin → Social Media → Activity Logs
2. Look for error messages in logs
3. Test individual platform connections
4. Verify environment variables
5. Check API rate limits

## 🔒 Security Notes

- Keep all API keys and tokens secure
- Use environment variables, never commit secrets
- Regularly rotate access tokens
- Monitor for unauthorized usage
- Set up rate limiting to prevent abuse

## 📈 Best Practices

1. **Content Quality**: Ensure projects are high-quality before approval
2. **Frequency**: Don't overwhelm followers - space out posts
3. **Engagement**: Monitor and respond to comments/reactions
4. **Compliance**: Follow each platform's terms of service
5. **Analytics**: Track which platforms drive the most traffic

## 🎯 Platform-Specific Tips

### Facebook:
- Post during peak hours (1-3 PM, 7-9 PM)
- Use high-quality images
- Engage with comments quickly

### Twitter:
- Use trending hashtags when relevant
- Tweet during business hours
- Retweet and engage with community

### Discord:
- Join relevant developer/startup communities
- Share in appropriate channels only
- Be helpful, not just promotional

### Reddit:
- Follow the 90/10 rule (90% helpful, 10% promotional)
- Engage genuinely with community
- Respect subreddit rules strictly

### Telegram:
- Share in relevant tech/startup channels
- Provide value beyond just promotion
- Build relationships with channel admins

---

## 🆘 Support

If you need help setting up social media integration:

1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Test each platform individually
4. Monitor the activity logs for errors

Remember: Social media automation should enhance, not replace, genuine community engagement! 🚀
