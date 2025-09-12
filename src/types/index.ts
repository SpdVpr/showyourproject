import { Timestamp } from 'firebase/firestore';

// User interface
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  website?: string;
  bio?: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  points: number;
  tier: 'free' | 'premium';
  createdAt: Timestamp;
  emailVerified: boolean;
  role?: 'admin' | 'user';
  // Points system
  totalPointsEarned: number;
  totalPointsSpent: number;
  featuredPurchases: number; // How many times user bought featured spot
}

// Social Media Platform Configuration
export interface SocialMediaPlatform {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  webhookUrl?: string; // For Discord, Slack, etc.
  pageId?: string; // For Facebook Pages
  channelId?: string; // For Telegram, Discord channels
  subreddit?: string; // For Reddit
  lastPostAt?: Timestamp;
  postCount: number;
  errorCount: number;
  lastError?: string;
  rateLimitReset?: Timestamp;
}

// Social Media Configuration for Admin
export interface SocialMediaConfig {
  platforms: {
    facebook: SocialMediaPlatform;
    twitter: SocialMediaPlatform;
    reddit: SocialMediaPlatform;
    discord: SocialMediaPlatform;
    linkedin: SocialMediaPlatform;
    telegram: SocialMediaPlatform;
  };
  globalSettings: {
    autoShareEnabled: boolean;
    shareOnApproval: boolean;
    shareOnFeatured: boolean;
    maxPostsPerHour: number;
    postTemplate: {
      title: string;
      description: string;
      hashtags: string[];
    };
  };
}

// Social Media Post Data
export interface SocialMediaPost {
  id: string;
  projectId: string;
  platform: string;
  content: string;
  imageUrl?: string;
  postUrl?: string;
  status: 'pending' | 'posted' | 'failed';
  error?: string;
  postedAt?: Timestamp;
  createdAt: Timestamp;
}

// Project interface
export interface Project {
  id: string;
  shortId?: string; // Short ID for SEO-friendly URLs
  name: string;
  tagline: string; // max 160 chars for SEO
  description: string; // rich text, max 1500 chars
  websiteUrl: string;
  logoUrl?: string;
  screenshotUrl?: string;
  thumbnailUrl?: string; // Main project thumbnail
  galleryUrls?: string[]; // Additional project images
  category: string;
  tags: string[];
  submitterId: string;
  submitterEmail: string; // for notifications
  submitterName: string;
  status: 'pending' | 'approved' | 'rejected';
  voteCount: number;
  viewCount: number;
  clickCount: number;
  submittedAt: Timestamp;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  adminNotes?: string;
  socialMediaShared?: boolean; // Track if auto-shared
  socialMediaPosts?: string[]; // IDs of social media posts
  socialLinks: {
    twitter?: string;
    github?: string;
    producthunt?: string;
  };
  // Featured system
  featured: boolean;
  featuredUntil?: Timestamp; // When featured status expires
  featuredBy?: 'admin' | 'user'; // Who made it featured
  featuredPurchasedAt?: Timestamp; // When user purchased featured spot
  // New required fields
  teamSize: '1' | '2' | '3-5' | '5-10' | '10+';
  foundedYear: number; // 2000-2030
}

// Vote interface
export interface Vote {
  id: string; // format: ${userId}_${projectId}
  userId: string;
  projectId: string;
  createdAt: Timestamp;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  projectCount: number;
  order: number;
}

// Analytics interface
export interface DailyAnalytics {
  id: string; // format: ${projectId}_${date}
  projectId: string;
  date: string; // YYYY-MM-DD
  views: number;
  clicks: number;
  votes: number;
}

// Form submission types
export interface ProjectSubmission {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  category: string;
  tags: string[];
  teamSize: '1' | '2' | '3-5' | '5-10' | '10+';
  foundedYear: number;
  socialLinks?: {
    twitter?: string;
    github?: string;
    producthunt?: string;
  };
}

// Analytics dashboard types
export interface ProjectAnalytics {
  totalViews: number;
  totalClicks: number;
  totalVotes: number;
  clickThroughRate: number;
  dailyData: DailyAnalytics[];
  chartData: any[];
}

// Points system interfaces
export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent';
  action: 'like' | 'click' | 'featured_purchase' | 'admin_bonus';
  points: number;
  projectId?: string; // For like/click actions
  description: string;
  createdAt: Timestamp;
}

export interface FeaturedSlot {
  id: string;
  projectId: string;
  userId: string;
  purchasedAt: Timestamp;
  expiresAt: Timestamp;
  pointsSpent: number;
  status: 'active' | 'expired';
}

// Points configuration
export const POINTS_CONFIG = {
  LIKE_PROJECT: 5,
  CLICK_PROJECT: 10,
  FEATURED_COST: 500, // Points needed to buy featured spot
  FEATURED_DURATION_DAYS: 14, // How long featured lasts (changed to 14 days)
  MAX_FEATURED_SLOTS: 6, // Maximum featured projects at once
} as const;

// Messaging system interfaces
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  content: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface Conversation {
  id: string;
  projectId: string;
  projectName: string;
  projectOwnerId: string;
  projectOwnerName: string;
  projectOwnerEmail: string;
  contacterId: string;
  contacterName: string;
  contacterEmail: string;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
