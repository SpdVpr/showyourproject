import { Project, SocialMediaPost, SocialMediaConfig } from '@/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Base interface for all social media platforms
interface SocialMediaPlatformService {
  name: string;
  isEnabled(): boolean;
  post(project: Project): Promise<SocialMediaPost>;
  validateConfig(): boolean;
}

// Facebook Service
export class FacebookService implements SocialMediaPlatformService {
  name = 'Facebook';

  isEnabled(): boolean {
    return !!(
      process.env.FACEBOOK_APP_ID &&
      process.env.FACEBOOK_APP_SECRET &&
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN &&
      process.env.FACEBOOK_PAGE_ID
    );
  }

  validateConfig(): boolean {
    return this.isEnabled();
  }

  async post(project: Project): Promise<SocialMediaPost> {
    if (!this.isEnabled()) {
      throw new Error('Facebook configuration is incomplete');
    }

    const message = this.formatMessage(project);
    const imageUrl = project.thumbnailUrl || project.logoUrl;

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            url: imageUrl,
            access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Facebook API error');
      }

      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'facebook',
        content: message,
        imageUrl,
        postUrl: `https://facebook.com/${result.id}`,
        status: 'posted',
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      return socialPost;
    } catch (error) {
      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'facebook',
        content: message,
        imageUrl,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      throw error;
    }
  }

  private formatMessage(project: Project): string {
    return `🚀 New Project Alert: ${project.name}

${project.tagline}

${project.description.substring(0, 200)}${project.description.length > 200 ? '...' : ''}

🔗 Check it out: ${project.websiteUrl}
📝 More details: https://showyourproject.com/project/${project.shortId || project.id}

#startup #innovation #tech #showyourproject ${project.tags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')}`;
  }
}

// Twitter/X Service
export class TwitterService implements SocialMediaPlatformService {
  name = 'Twitter';

  isEnabled(): boolean {
    return !!(
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET
    );
  }

  validateConfig(): boolean {
    return this.isEnabled();
  }

  async post(project: Project): Promise<SocialMediaPost> {
    if (!this.isEnabled()) {
      throw new Error('Twitter configuration is incomplete');
    }

    const message = this.formatMessage(project);

    try {
      // Using Twitter API v2
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Twitter API error');
      }

      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'twitter',
        content: message,
        imageUrl: project.thumbnailUrl || project.logoUrl,
        postUrl: `https://twitter.com/i/web/status/${result.data.id}`,
        status: 'posted',
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      return socialPost;
    } catch (error) {
      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'twitter',
        content: message,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      throw error;
    }
  }

  private formatMessage(project: Project): string {
    const baseMessage = `🚀 ${project.name}: ${project.tagline}

${project.websiteUrl}

#startup #innovation #tech #showyourproject`;

    // Twitter has 280 character limit
    if (baseMessage.length <= 280) {
      return baseMessage;
    }

    // Truncate if too long
    const truncated = `🚀 ${project.name}: ${project.tagline.substring(0, 100)}...

${project.websiteUrl}

#startup #tech`;

    return truncated;
  }
}

// Discord Service (using webhooks - easiest)
export class DiscordService implements SocialMediaPlatformService {
  name = 'Discord';

  isEnabled(): boolean {
    return !!process.env.DISCORD_WEBHOOK_URL;
  }

  validateConfig(): boolean {
    return this.isEnabled();
  }

  async post(project: Project): Promise<SocialMediaPost> {
    if (!this.isEnabled()) {
      throw new Error('Discord webhook URL is not configured');
    }

    const embed = this.formatEmbed(project);

    try {
      const response = await fetch(process.env.DISCORD_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: '🚀 **New Project Submission!**',
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook error: ${response.status}`);
      }

      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'discord',
        content: embed.description || '',
        imageUrl: embed.thumbnail?.url,
        status: 'posted',
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      return socialPost;
    } catch (error) {
      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'discord',
        content: embed.description || '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      throw error;
    }
  }

  private formatEmbed(project: Project) {
    return {
      title: project.name,
      description: `**${project.tagline}**\n\n${project.description.substring(0, 300)}${project.description.length > 300 ? '...' : ''}`,
      url: `https://showyourproject.com/project/${project.shortId || project.id}`,
      color: 0x3b82f6, // Blue color
      thumbnail: {
        url: project.logoUrl || project.thumbnailUrl,
      },
      fields: [
        {
          name: '🌐 Website',
          value: project.websiteUrl,
          inline: true,
        },
        {
          name: '📂 Category',
          value: project.category,
          inline: true,
        },
        {
          name: '🏷️ Tags',
          value: project.tags.slice(0, 3).join(', '),
          inline: true,
        },
      ],
      footer: {
        text: 'ShowYourProject.com - Discover Amazing Projects',
        icon_url: 'https://showyourproject.com/favicon.ico',
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Reddit Service
export class RedditService implements SocialMediaPlatformService {
  name = 'Reddit';

  isEnabled(): boolean {
    return !!(
      process.env.REDDIT_CLIENT_ID &&
      process.env.REDDIT_CLIENT_SECRET &&
      process.env.REDDIT_USERNAME &&
      process.env.REDDIT_PASSWORD
    );
  }

  validateConfig(): boolean {
    return this.isEnabled();
  }

  async post(project: Project): Promise<SocialMediaPost> {
    if (!this.isEnabled()) {
      throw new Error('Reddit configuration is incomplete');
    }

    try {
      // First, get access token
      const accessToken = await this.getAccessToken();

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));

      const title = this.formatTitle(project);
      const text = this.formatText(project);
      const subreddit = process.env.REDDIT_SUBREDDIT || 'startups';

      // Create a self post exactly like PRAW does
      const submitData = new URLSearchParams({
        api_type: 'json',
        kind: 'self',
        sr: subreddit,
        title: title,
        text: text,
        resubmit: 'true',
        sendreplies: 'true',
        validate_on_submit: 'true'
      });

      const response = await fetch(`https://oauth.reddit.com/api/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': `${process.env.REDDIT_USER_AGENT || 'ShowYourProject/1.0.0'}`,
        },
        body: submitData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reddit API Error Response:', response.status, errorText);
        throw new Error(`Reddit API error (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();

      if (result.json?.errors?.length > 0) {
        throw new Error(result.json?.errors?.[0]?.[1] || 'Reddit API error');
      }

      const postUrl = result.json?.data?.url;

      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'reddit',
        content: `${title}\n\n${text}`,
        imageUrl: project.thumbnailUrl || project.logoUrl,
        postUrl,
        status: 'posted',
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      return socialPost;
    } catch (error) {
      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'reddit',
        content: this.formatTitle(project),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    console.log('🔐 Authenticating with Reddit API...');

    // Use the exact same approach as PRAW library
    const authString = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');

    // Configure proxy if available (for residential IP)
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ShowYourProject/1.0.0',
      },
      body: `grant_type=password&username=${encodeURIComponent(process.env.REDDIT_USERNAME!)}&password=${encodeURIComponent(process.env.REDDIT_PASSWORD!)}`,
    };

    // Add proxy if configured
    if (process.env.REDDIT_PROXY_URL) {
      console.log('🌐 Using proxy for Reddit API...');
      // Note: This would require a proxy agent library like 'https-proxy-agent'
      // fetchOptions.agent = new HttpsProxyAgent(process.env.REDDIT_PROXY_URL);
    }

    const response = await fetch('https://www.reddit.com/api/v1/access_token', fetchOptions);

    console.log('🔐 Reddit auth response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 Reddit auth error:', errorText);
      throw new Error(`Reddit authentication failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('🔐 Reddit authentication successful');

    return result.access_token;
  }

  private async addCommentToPost(accessToken: string, postUrl: string, text: string): Promise<void> {
    // Extract post ID from URL (format: https://www.reddit.com/r/subreddit/comments/postid/title/)
    const postIdMatch = postUrl.match(/\/comments\/([a-zA-Z0-9]+)\//);
    if (!postIdMatch) {
      throw new Error('Could not extract post ID from URL');
    }

    const postId = postIdMatch[1];
    const fullPostId = `t3_${postId}`; // Reddit requires t3_ prefix for link posts

    const response = await fetch('https://oauth.reddit.com/api/comment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': process.env.REDDIT_USER_AGENT || 'web:ShowYourProject.com:v1.0.0 (by /u/Southern-Bet8098)',
      },
      body: new URLSearchParams({
        api_type: 'json',
        thing_id: fullPostId,
        text: text,
      }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.json?.errors?.[0]?.[1] || 'Failed to add comment');
    }
  }

  private formatTitle(project: Project): string {
    return `🚀 ${project.name} - ${project.tagline}`;
  }

  private formatText(project: Project): string {
    return `${project.description}

**Website:** ${project.websiteUrl}
**Category:** ${project.category}
**Tags:** ${project.tags.join(', ')}

---
*This project was shared from [ShowYourProject.com](https://showyourproject.com) - a platform for discovering amazing startups and projects.*`;
  }
}

// Telegram Service
export class TelegramService implements SocialMediaPlatformService {
  name = 'Telegram';

  isEnabled(): boolean {
    return !!(
      process.env.TELEGRAM_BOT_TOKEN &&
      process.env.TELEGRAM_CHAT_ID
    );
  }

  validateConfig(): boolean {
    return this.isEnabled();
  }

  async post(project: Project): Promise<SocialMediaPost> {
    if (!this.isEnabled()) {
      throw new Error('Telegram configuration is incomplete');
    }

    const message = this.formatMessage(project);

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
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: false,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.description || 'Telegram API error');
      }

      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'telegram',
        content: message,
        status: 'posted',
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      return socialPost;
    } catch (error) {
      const socialPost: SocialMediaPost = {
        id: '',
        projectId: project.id,
        platform: 'telegram',
        content: message,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'socialMediaPosts'), socialPost);
      socialPost.id = docRef.id;

      throw error;
    }
  }

  private formatMessage(project: Project): string {
    return `🚀 *${project.name}*

*${project.tagline}*

${project.description.substring(0, 500)}${project.description.length > 500 ? '...' : ''}

🌐 [Visit Website](${project.websiteUrl})
📝 [More Details](https://showyourproject.com/project/${project.shortId || project.id})

📂 Category: ${project.category}
🏷️ Tags: ${project.tags.slice(0, 5).join(', ')}

#startup #innovation #tech #showyourproject`;
  }
}

// Main Social Media Manager
export class SocialMediaManager {
  private services: SocialMediaPlatformService[] = [
    new FacebookService(),
    new TwitterService(),
    new DiscordService(),
    // RedditService removed - now manual only via admin panel
    new TelegramService(),
  ];

  async shareProject(project: Project): Promise<SocialMediaPost[]> {
    const results: SocialMediaPost[] = [];
    const errors: string[] = [];

    // Check if auto-sharing is enabled
    if (process.env.SOCIAL_MEDIA_AUTO_SHARE !== 'true') {
      console.log('Social media auto-sharing is disabled');
      return results;
    }

    // Share on all enabled platforms
    for (const service of this.services) {
      if (service.isEnabled()) {
        try {
          console.log(`Sharing project "${project.name}" on ${service.name}...`);
          const post = await service.post(project);
          results.push(post);
          console.log(`✅ Successfully shared on ${service.name}`);

          // Add delay between posts to avoid rate limiting
          await this.delay(2000);
        } catch (error) {
          const errorMessage = `Failed to share on ${service.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`❌ ${errorMessage}`);
          errors.push(errorMessage);
        }
      } else {
        console.log(`⏭️ ${service.name} is not configured, skipping...`);
      }
    }

    // Log summary
    console.log(`\n📊 Social Media Sharing Summary for "${project.name}":`);
    console.log(`✅ Successful: ${results.length} platforms`);
    console.log(`❌ Failed: ${errors.length} platforms`);

    if (errors.length > 0) {
      console.log('Errors:', errors);
    }

    return results;
  }

  getEnabledPlatforms(): string[] {
    return this.services
      .filter(service => service.isEnabled())
      .map(service => service.name);
  }

  validateAllConfigurations(): { [key: string]: boolean } {
    const results: { [key: string]: boolean } = {};

    for (const service of this.services) {
      results[service.name.toLowerCase()] = service.validateConfig();
    }

    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const socialMediaManager = new SocialMediaManager();
