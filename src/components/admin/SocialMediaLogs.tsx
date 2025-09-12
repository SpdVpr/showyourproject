'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  ExternalLink,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SocialMediaPost } from '@/types';
import { toast } from "sonner";

interface SocialMediaError {
  id: string;
  projectId: string;
  projectName: string;
  type?: string;
  error: string;
  timestamp: Timestamp;
}

export function SocialMediaLogs() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [errors, setErrors] = useState<SocialMediaError[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'posted' | 'failed' | 'pending'>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  useEffect(() => {
    loadSocialMediaData();
  }, []);

  const loadSocialMediaData = async () => {
    setLoading(true);
    try {
      // Load social media posts
      const postsRef = collection(db, 'socialMediaPosts');
      const postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(100));
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SocialMediaPost[];
      setPosts(postsData);

      // Load social media errors
      const errorsRef = collection(db, 'socialMediaErrors');
      const errorsQuery = query(errorsRef, orderBy('timestamp', 'desc'), limit(50));
      const errorsSnapshot = await getDocs(errorsQuery);
      const errorsData = errorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SocialMediaError[];
      setErrors(errorsData);

    } catch (error) {
      console.error('Error loading social media data:', error);
      toast.error('Failed to load social media logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Posted</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors = {
      facebook: 'bg-blue-100 text-blue-800',
      twitter: 'bg-gray-100 text-gray-800',
      discord: 'bg-indigo-100 text-indigo-800',
      reddit: 'bg-orange-100 text-orange-800',
      telegram: 'bg-blue-100 text-blue-800',
    };

    return (
      <Badge className={colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Badge>
    );
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.projectId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.error.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    totalPosts: posts.length,
    successfulPosts: posts.filter(p => p.status === 'posted').length,
    failedPosts: posts.filter(p => p.status === 'failed').length,
    pendingPosts: posts.filter(p => p.status === 'pending').length,
    totalErrors: errors.length,
  };

  const exportLogs = () => {
    const data = {
      posts: filteredPosts,
      errors: filteredErrors,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-media-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Logs exported successfully');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading social media logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Media Logs</h2>
          <p className="text-muted-foreground">
            Monitor social media posting activity and troubleshoot issues
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadSocialMediaData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successfulPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalErrors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts or projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="posted">Posted</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter/X</option>
                <option value="discord">Discord</option>
                <option value="reddit">Reddit</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts ({filteredPosts.length})</TabsTrigger>
          <TabsTrigger value="errors">Errors ({filteredErrors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Posts</CardTitle>
              <CardDescription>
                History of all social media posts and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No posts found matching your filters
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getPlatformBadge(post.platform)}
                            {getStatusBadge(post.status)}
                            <span className="text-sm text-muted-foreground">
                              Project ID: {post.projectId}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {post.createdAt && new Date(post.createdAt.seconds * 1000).toLocaleString()}
                          </div>
                        </div>
                        {post.postUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Post
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-sm">
                        <div className="font-medium mb-1">Content:</div>
                        <div className="bg-gray-50 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                          {post.content.substring(0, 300)}
                          {post.content.length > 300 && '...'}
                        </div>
                      </div>

                      {post.error && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>Error:</strong> {post.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Errors</CardTitle>
              <CardDescription>
                Errors and issues encountered during social media posting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredErrors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No errors found - great job! 🎉
                  </div>
                ) : (
                  filteredErrors.map((error) => (
                    <Alert key={error.id} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <strong>{error.projectName}</strong>
                            <span className="text-xs">
                              {error.timestamp && new Date(error.timestamp.seconds * 1000).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <strong>Project ID:</strong> {error.projectId}
                          </div>
                          {error.type && (
                            <div className="text-sm">
                              <strong>Type:</strong> {error.type}
                            </div>
                          )}
                          <div className="text-sm">
                            <strong>Error:</strong> {error.error}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
