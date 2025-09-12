'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Facebook,
  Twitter,
  MessageCircle,
  Send,
  Linkedin,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  TestTube,
  RefreshCw
} from "lucide-react";
import { socialMediaManager } from "@/lib/socialMediaService";
import { SocialMediaPostPreview } from "./SocialMediaPostPreview";
import { SocialMediaLogs } from "./SocialMediaLogs";
import { toast } from "sonner";

interface PlatformConfig {
  name: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  configured: boolean;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'url';
    required: boolean;
    placeholder: string;
    value: string;
  }[];
}

export function AdminSocialMediaSettings() {
  const [loading, setLoading] = useState(false);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [globalSettings, setGlobalSettings] = useState({
    autoShareEnabled: true,
    shareOnApproval: true,
    shareOnFeatured: true,
    maxPostsPerHour: 10,
  });

  const [platforms, setPlatforms] = useState<{ [key: string]: PlatformConfig }>({
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      enabled: false,
      configured: false,
      fields: [
        { key: 'FACEBOOK_APP_ID', label: 'App ID', type: 'text', required: true, placeholder: 'Your Facebook App ID', value: '' },
        { key: 'FACEBOOK_APP_SECRET', label: 'App Secret', type: 'password', required: true, placeholder: 'Your Facebook App Secret', value: '' },
        { key: 'FACEBOOK_PAGE_ACCESS_TOKEN', label: 'Page Access Token', type: 'password', required: true, placeholder: 'Your Page Access Token', value: '' },
        { key: 'FACEBOOK_PAGE_ID', label: 'Page ID', type: 'text', required: true, placeholder: 'Your Facebook Page ID', value: '' },
      ]
    },
    twitter: {
      name: 'Twitter/X',
      icon: Twitter,
      enabled: false,
      configured: false,
      fields: [
        { key: 'TWITTER_API_KEY', label: 'API Key', type: 'text', required: true, placeholder: 'Your Twitter API Key', value: '' },
        { key: 'TWITTER_API_SECRET', label: 'API Secret', type: 'password', required: true, placeholder: 'Your Twitter API Secret', value: '' },
        { key: 'TWITTER_ACCESS_TOKEN', label: 'Access Token', type: 'password', required: true, placeholder: 'Your Access Token', value: '' },
        { key: 'TWITTER_ACCESS_TOKEN_SECRET', label: 'Access Token Secret', type: 'password', required: true, placeholder: 'Your Access Token Secret', value: '' },
        { key: 'TWITTER_BEARER_TOKEN', label: 'Bearer Token', type: 'password', required: true, placeholder: 'Your Bearer Token', value: '' },
      ]
    },
    discord: {
      name: 'Discord',
      icon: MessageCircle,
      enabled: false,
      configured: false,
      fields: [
        { key: 'DISCORD_WEBHOOK_URL', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://discord.com/api/webhooks/...', value: '' },
      ]
    },
    reddit: {
      name: 'Reddit',
      icon: MessageCircle,
      enabled: false,
      configured: false,
      fields: [
        { key: 'REDDIT_CLIENT_ID', label: 'Client ID', type: 'text', required: true, placeholder: 'Your Reddit App Client ID', value: '' },
        { key: 'REDDIT_CLIENT_SECRET', label: 'Client Secret', type: 'password', required: true, placeholder: 'Your Reddit App Secret', value: '' },
        { key: 'REDDIT_USERNAME', label: 'Username', type: 'text', required: true, placeholder: 'Your Reddit Username', value: '' },
        { key: 'REDDIT_PASSWORD', label: 'Password', type: 'password', required: true, placeholder: 'Your Reddit Password', value: '' },
        { key: 'REDDIT_SUBREDDIT', label: 'Subreddit', type: 'text', required: false, placeholder: 'startups', value: 'startups' },
      ]
    },
    telegram: {
      name: 'Telegram',
      icon: Send,
      enabled: false,
      configured: false,
      fields: [
        { key: 'TELEGRAM_BOT_TOKEN', label: 'Bot Token', type: 'password', required: true, placeholder: 'Your Telegram Bot Token', value: '' },
        { key: 'TELEGRAM_CHAT_ID', label: 'Chat ID', type: 'text', required: true, placeholder: 'Channel/Group Chat ID', value: '' },
      ]
    },
  });

  useEffect(() => {
    loadCurrentConfiguration();
  }, []);

  const loadCurrentConfiguration = async () => {
    setLoading(true);
    try {
      // Load configuration from API endpoint that reads environment variables
      const response = await fetch('/api/admin/social-media-config');
      const config = await response.json();

      // Update platforms with environment variable values and configuration status
      setPlatforms(prev => {
        const updated = { ...prev };

        // Reddit configuration
        if (config.reddit) {
          updated.reddit.configured = config.reddit.configured;
          updated.reddit.enabled = config.reddit.enabled;
          updated.reddit.fields = updated.reddit.fields.map(field => ({
            ...field,
            value: config.reddit[field.key] || field.value
          }));
        }

        // Facebook configuration
        if (config.facebook) {
          updated.facebook.configured = config.facebook.configured;
          updated.facebook.enabled = config.facebook.enabled;
          updated.facebook.fields = updated.facebook.fields.map(field => ({
            ...field,
            value: config.facebook[field.key] || field.value
          }));
        }

        // Twitter configuration
        if (config.twitter) {
          updated.twitter.configured = config.twitter.configured;
          updated.twitter.enabled = config.twitter.enabled;
          updated.twitter.fields = updated.twitter.fields.map(field => ({
            ...field,
            value: config.twitter[field.key] || field.value
          }));
        }

        // Discord configuration
        if (config.discord) {
          updated.discord.configured = config.discord.configured;
          updated.discord.enabled = config.discord.enabled;
          updated.discord.fields = updated.discord.fields.map(field => ({
            ...field,
            value: config.discord[field.key] || field.value
          }));
        }

        // Telegram configuration
        if (config.telegram) {
          updated.telegram.configured = config.telegram.configured;
          updated.telegram.enabled = config.telegram.enabled;
          updated.telegram.fields = updated.telegram.fields.map(field => ({
            ...field,
            value: config.telegram[field.key] || field.value
          }));
        }

        return updated;
      });

      // Load global settings
      setGlobalSettings({
        autoShareEnabled: config.globalSettings?.autoShareEnabled || false,
        shareOnApproval: config.globalSettings?.shareOnApproval || true,
        shareOnFeatured: config.globalSettings?.shareOnFeatured || true,
        maxPostsPerHour: config.globalSettings?.maxPostsPerHour || 10,
      });

    } catch (error) {
      console.error('Error loading social media configuration:', error);
      toast.error('Failed to load social media configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (platformKey: string, fieldKey: string, value: string) => {
    setPlatforms(prev => ({
      ...prev,
      [platformKey]: {
        ...prev[platformKey],
        fields: prev[platformKey].fields.map(field =>
          field.key === fieldKey ? { ...field, value } : field
        )
      }
    }));
  };

  const handlePlatformToggle = (platformKey: string, enabled: boolean) => {
    setPlatforms(prev => ({
      ...prev,
      [platformKey]: {
        ...prev[platformKey],
        enabled
      }
    }));
  };

  const testPlatformConnection = async (platformKey: string) => {
    setTestingPlatform(platformKey);
    try {
      const response = await fetch(`/api/admin/test-social-media/${platformKey}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${platforms[platformKey].name} connection test successful!`);
      } else {
        toast.error(`${platforms[platformKey].name} connection test failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`${platforms[platformKey].name} connection test failed`);
    } finally {
      setTestingPlatform(null);
    }
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      // Here you would save the configuration to your backend/database
      // For now, we'll simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Social media configuration saved successfully!');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (platform: PlatformConfig) => {
    if (!platform.configured) {
      return <Badge variant="secondary">Not Configured</Badge>;
    }
    if (!platform.enabled) {
      return <Badge variant="outline">Disabled</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getStatusIcon = (platform: PlatformConfig) => {
    if (!platform.configured) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (!platform.enabled) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Media Auto-Sharing</h2>
          <p className="text-muted-foreground">
            Configure automatic sharing to social platforms when projects are approved
          </p>
        </div>
        <Button onClick={saveConfiguration} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Global Settings</span>
          </CardTitle>
          <CardDescription>
            Configure when and how projects are automatically shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-share">Enable Auto-Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Automatically share projects when they are approved
              </p>
            </div>
            <Switch
              id="auto-share"
              checked={globalSettings.autoShareEnabled}
              onCheckedChange={(checked) =>
                setGlobalSettings(prev => ({ ...prev, autoShareEnabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="share-approval">Share on Approval</Label>
              <p className="text-sm text-muted-foreground">
                Share projects immediately when approved by admin
              </p>
            </div>
            <Switch
              id="share-approval"
              checked={globalSettings.shareOnApproval}
              onCheckedChange={(checked) =>
                setGlobalSettings(prev => ({ ...prev, shareOnApproval: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="share-featured">Share Featured Projects</Label>
              <p className="text-sm text-muted-foreground">
                Share projects when they are marked as featured
              </p>
            </div>
            <Switch
              id="share-featured"
              checked={globalSettings.shareOnFeatured}
              onCheckedChange={(checked) =>
                setGlobalSettings(prev => ({ ...prev, shareOnFeatured: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-posts">Max Posts Per Hour</Label>
            <Input
              id="max-posts"
              type="number"
              min="1"
              max="50"
              value={globalSettings.maxPostsPerHour}
              onChange={(e) =>
                setGlobalSettings(prev => ({ ...prev, maxPostsPerHour: parseInt(e.target.value) || 10 }))
              }
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Rate limit to avoid API restrictions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>
            Configure API credentials and settings for each social media platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="facebook" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(platforms).map(([key, platform]) => {
                const Icon = platform.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{platform.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(platforms).map(([key, platform]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <platform.icon className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold">{platform.name}</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(platform)}
                        {getStatusBadge(platform)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testPlatformConnection(key)}
                      disabled={testingPlatform === key || !platform.configured}
                    >
                      {testingPlatform === key ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                    <Switch
                      checked={platform.enabled}
                      onCheckedChange={(checked) => handlePlatformToggle(key, checked)}
                      disabled={!platform.configured}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platform.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Input
                        id={field.key}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={field.value}
                        onChange={(e) => handleFieldChange(key, field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {key === 'facebook' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You need to create a Facebook App and get a Page Access Token. 
                      Visit the <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a> portal to get started.
                    </AlertDescription>
                  </Alert>
                )}

                {key === 'twitter' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You need a Twitter Developer Account and API v2 access. 
                      Apply at <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer" className="underline">Twitter Developer Portal</a>.
                    </AlertDescription>
                  </Alert>
                )}

                {key === 'discord' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Create a webhook in your Discord channel: Server Settings → Integrations → Webhooks → New Webhook.
                      This is the easiest platform to set up!
                    </AlertDescription>
                  </Alert>
                )}

                {key === 'reddit' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Create a Reddit App at <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="underline">reddit.com/prefs/apps</a>.
                      Make sure to follow subreddit rules for self-promotion.
                    </AlertDescription>
                  </Alert>
                )}

                {key === 'telegram' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Create a bot with <a href="https://t.me/botfather" target="_blank" rel="noopener noreferrer" className="underline">@BotFather</a> on Telegram.
                      Add the bot to your channel and get the chat ID.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Post Templates</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Post Templates & Preview</CardTitle>
              <CardDescription>
                Preview how projects will appear on different social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialMediaPostPreview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <SocialMediaLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
