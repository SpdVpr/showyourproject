'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Facebook,
  Twitter,
  MessageCircle,
  Send,
  Linkedin,
  Eye,
  Copy,
  RefreshCw
} from "lucide-react";
import { Project } from "@/types";
import { toast } from "sonner";

interface SocialMediaPostPreviewProps {
  project?: Project;
}

// Mock project data for preview
const mockProject: Project = {
  id: 'mock-project',
  name: 'Amazing Startup',
  tagline: 'Revolutionary AI-powered productivity tool',
  description: 'Our innovative platform helps teams collaborate more effectively using cutting-edge artificial intelligence. With features like smart task management, automated workflows, and real-time insights, we\'re transforming how modern teams work together.',
  websiteUrl: 'https://amazingstartup.com',
  logoUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
  category: 'Productivity',
  tags: ['AI', 'Productivity', 'SaaS', 'Collaboration'],
  submitterId: 'user123',
  submitterEmail: 'founder@amazingstartup.com',
  submitterName: 'John Doe',
  status: 'approved',
  voteCount: 42,
  viewCount: 1250,
  clickCount: 89,
  submittedAt: new Date() as any,
  approvedAt: new Date() as any,
  socialLinks: {
    twitter: 'https://twitter.com/amazingstartup',
    github: 'https://github.com/amazingstartup',
  }
};

export function SocialMediaPostPreview({ project = mockProject }: SocialMediaPostPreviewProps) {
  const [customTemplates, setCustomTemplates] = useState({
    facebook: '',
    twitter: '',
    discord: '',
    reddit: '',
    telegram: '',
  });

  const generateFacebookPost = (proj: Project) => {
    return `🚀 New Project Alert: ${proj.name}

${proj.tagline}

${proj.description.substring(0, 200)}${proj.description.length > 200 ? '...' : ''}

🔗 Check it out: ${proj.websiteUrl}
📝 More details: https://showyourproject.com/project/${proj.id}

#startup #innovation #tech #showyourproject ${proj.tags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')}`;
  };

  const generateTwitterPost = (proj: Project) => {
    const baseMessage = `🚀 ${proj.name}: ${proj.tagline}

${proj.websiteUrl}

#startup #innovation #tech #showyourproject`;

    // Twitter has 280 character limit
    if (baseMessage.length <= 280) {
      return baseMessage;
    }

    // Truncate if too long
    return `🚀 ${proj.name}: ${proj.tagline.substring(0, 100)}...

${proj.websiteUrl}

#startup #tech`;
  };

  const generateDiscordEmbed = (proj: Project) => {
    return {
      title: proj.name,
      description: `**${proj.tagline}**\n\n${proj.description.substring(0, 300)}${proj.description.length > 300 ? '...' : ''}`,
      url: `https://showyourproject.com/project/${proj.id}`,
      color: 0x3b82f6,
      thumbnail: {
        url: proj.logoUrl || proj.thumbnailUrl,
      },
      fields: [
        {
          name: '🌐 Website',
          value: proj.websiteUrl,
          inline: true,
        },
        {
          name: '📂 Category',
          value: proj.category,
          inline: true,
        },
        {
          name: '🏷️ Tags',
          value: proj.tags.slice(0, 3).join(', '),
          inline: true,
        },
      ],
      footer: {
        text: 'ShowYourProject.com - Discover Amazing Projects',
        icon_url: 'https://showyourproject.com/favicon.ico',
      },
      timestamp: new Date().toISOString(),
    };
  };

  const generateRedditPost = (proj: Project) => {
    const title = `🚀 ${proj.name} - ${proj.tagline}`;
    const text = `${proj.description}

**Website:** ${proj.websiteUrl}
**Category:** ${proj.category}
**Tags:** ${proj.tags.join(', ')}

Check out more details at: https://showyourproject.com/project/${proj.id}

---
*This project was shared from [ShowYourProject.com](https://showyourproject.com) - a platform for discovering amazing startups and projects.*`;

    return { title, text };
  };

  const generateTelegramPost = (proj: Project) => {
    return `🚀 *${proj.name}*

*${proj.tagline}*

${proj.description.substring(0, 500)}${proj.description.length > 500 ? '...' : ''}

🌐 [Visit Website](${proj.websiteUrl})
📝 [More Details](https://showyourproject.com/project/${proj.id})

📂 Category: ${proj.category}
🏷️ Tags: ${proj.tags.slice(0, 5).join(', ')}

#startup #innovation #tech #showyourproject`;
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${platform} post copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      content: generateFacebookPost(project),
      limit: 'No strict limit',
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: 'text-black',
      bgColor: 'bg-gray-50',
      content: generateTwitterPost(project),
      limit: '280 characters',
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: MessageCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      content: JSON.stringify(generateDiscordEmbed(project), null, 2),
      limit: 'Embed format',
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: MessageCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      content: (() => {
        const reddit = generateRedditPost(project);
        return `Title: ${reddit.title}\n\nText:\n${reddit.text}`;
      })(),
      limit: 'Title: 300 chars',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Send,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      content: generateTelegramPost(project),
      limit: '4096 characters',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Social Media Post Templates</h3>
          <p className="text-sm text-muted-foreground">
            Preview how your project will appear on different social platforms
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Eye className="h-3 w-3" />
          <span>Preview Mode</span>
        </Badge>
      </div>

      {/* Project Info */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Preview Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <img
              src={project.logoUrl || '/placeholder-logo.png'}
              alt={project.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{project.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{project.tagline}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">{project.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {project.tags.slice(0, 2).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Previews */}
      <Tabs defaultValue="facebook" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <TabsTrigger key={platform.id} value={platform.id} className="flex items-center space-x-2">
                <Icon className={`h-4 w-4 ${platform.color}`} />
                <span className="hidden sm:inline">{platform.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {platforms.map((platform) => (
          <TabsContent key={platform.id} value={platform.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <platform.icon className={`h-5 w-5 ${platform.color}`} />
                    <CardTitle>{platform.name} Post</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {platform.limit}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(platform.content, platform.name)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Preview of how your project will appear on {platform.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Platform-specific preview */}
                <div className={`p-4 rounded-lg ${platform.bgColor} border`}>
                  {platform.id === 'discord' ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Discord Embed Preview:</div>
                      <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
                        <div className="font-semibold text-indigo-600">{project.name}</div>
                        <div className="text-sm mt-1">
                          <strong>{project.tagline}</strong>
                        </div>
                        <div className="text-sm mt-2 text-gray-600">
                          {project.description.substring(0, 300)}...
                        </div>
                        <div className="flex items-center space-x-4 mt-3 text-xs">
                          <span>🌐 {project.websiteUrl}</span>
                          <span>📂 {project.category}</span>
                        </div>
                      </div>
                    </div>
                  ) : platform.id === 'reddit' ? (
                    <div className="space-y-2">
                      <div className="font-semibold text-orange-600">
                        🚀 {project.name} - {project.tagline}
                      </div>
                      <div className="text-sm whitespace-pre-line">
                        {generateRedditPost(project).text.substring(0, 300)}...
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-line">
                      {platform.content.length > 500 
                        ? platform.content.substring(0, 500) + '...'
                        : platform.content
                      }
                    </div>
                  )}
                </div>

                {/* Character count for Twitter */}
                {platform.id === 'twitter' && (
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Character count: {platform.content.length}/280</span>
                    <Badge 
                      variant={platform.content.length > 280 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {platform.content.length > 280 ? "Too long" : "OK"}
                    </Badge>
                  </div>
                )}

                {/* Full content textarea */}
                <div className="space-y-2">
                  <Label htmlFor={`${platform.id}-content`}>Full Content</Label>
                  <Textarea
                    id={`${platform.id}-content`}
                    value={customTemplates[platform.id as keyof typeof customTemplates] || platform.content}
                    onChange={(e) => setCustomTemplates(prev => ({
                      ...prev,
                      [platform.id]: e.target.value
                    }))}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
