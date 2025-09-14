"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Plus, BarChart3, Eye, ExternalLink, Heart, Clock, CheckCircle, XCircle, AlertCircle, Coins, MessageCircle, TrendingUp, Trophy, Star, Info } from "lucide-react";
import { PointsSystem } from "@/components/dashboard/PointsSystem";
import { MessagingDashboard } from "@/components/messaging/MessagingDashboard";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { projectService, userService } from "@/lib/firebaseServices";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/types";

// Real user projects will be loaded from Firebase

function DashboardContent() {
  const { user, logout, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState("overview");
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Load user's projects from Firebase
  const loadUserProjects = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Loading projects for user:", user.id);

      try {
        // Try to get user's projects with index
        const userProjectsData = await userService.getUserProjects(user.id);
        console.log("Found user projects:", userProjectsData);
        setUserProjects(userProjectsData);
      } catch (indexError: any) {
        console.warn("Index not available, falling back to getAllProjects:", indexError);

        // Fallback: Get all projects and filter client-side
        const allProjects = await projectService.getAllProjects();
        const userProjectsFiltered = allProjects.filter(project => project.submitterId === user.id);

        // Sort by createdAt descending (newest first)
        userProjectsFiltered.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return bTime.getTime() - aTime.getTime();
        });

        console.log("Found user projects (fallback):", userProjectsFiltered);
        setUserProjects(userProjectsFiltered);
      }
    } catch (error) {
      console.error("Error loading user projects:", error);
      setUserProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProjects();
  }, [user?.id]);

  // Refresh user data when switching to points tab
  useEffect(() => {
    if (activeTab === "points" && user) {
      refreshUser();
    }
  }, [activeTab, user]); // Removed refreshUser from dependencies

  if (!user) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalViews = userProjects.reduce((sum, project) => sum + (project.viewCount || 0), 0);
  const totalClicks = userProjects.reduce((sum, project) => sum + (project.clickCount || 0), 0);
  const totalVotes = userProjects.reduce((sum, project) => sum + (project.voteCount || 0), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Helper function to format dates
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";

    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }

    // Handle regular Date
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }

    // Handle string dates
    return new Date(timestamp).toLocaleDateString();
  };

  // Calculate days remaining for featured projects
  const getDaysRemaining = (featuredUntil: any) => {
    if (!featuredUntil) return 0;

    const expirationDate = featuredUntil.toDate ? featuredUntil.toDate() : new Date(featuredUntil);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user.displayName}!</h1>
        <p className="text-muted-foreground">Manage your projects and track their performance on ShowYourProject.com</p>
      </div>

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="points" className="flex items-center space-x-2">
            <Coins className="h-4 w-4" />
            <span>Points & Featured</span>
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

          {/* Featured Promotion Banner */}
          <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Coins className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Get Featured & Boost Your Project!</h3>
                      <p className="text-white/90">Use your points to feature your project on the homepage</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <Eye className="h-4 w-4" />
                        <span className="font-semibold">More Visibility</span>
                      </div>
                      <p className="text-sm text-white/80">Featured on homepage for 14 days</p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-semibold">Higher Rankings</span>
                      </div>
                      <p className="text-sm text-white/80">Priority placement in listings</p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <Trophy className="h-4 w-4" />
                        <span className="font-semibold">Premium Badge</span>
                      </div>
                      <p className="text-sm text-white/80">Special featured project badge</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <Coins className="h-4 w-4" />
                          <span className="font-bold">{user?.points || 0} points</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-white/80">Featured costs: </span>
                        <span className="font-bold">500 points</span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveTab("points")}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Info className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveTab("points")}
                        className="bg-white text-purple-600 hover:bg-white/90 font-semibold"
                        disabled={(user?.points || 0) < 500}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        {(user?.points || 0) >= 500 ? 'Feature Project' : 'Earn More Points'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProjects.length}</div>
                <p className="text-xs text-muted-foreground">
                  {userProjects.filter(p => p.status === "approved").length} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Views across all projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClicks}</div>
                <p className="text-xs text-muted-foreground">
                  Clicks to your projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVotes}</div>
                <p className="text-xs text-muted-foreground">
                  Votes received
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-900">Your Points</CardTitle>
                <Coins className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{user?.points || 0}</div>
                <p className="text-xs text-purple-700">
                  {(user?.points || 0) >= 500 ? 'Ready to feature!' : `${500 - (user?.points || 0)} more needed`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your latest project submissions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProjects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No projects submitted yet</p>
                  <Button asChild>
                    <Link href="/submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Your First Project
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(project.status)}
                        <div>
                          <h4 className="font-semibold">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.tagline}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(project.status)}
                        <div className="text-right text-sm">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{project.viewCount || 0}</span>
                            <ExternalLink className="h-3 w-3" />
                            <span>{project.clickCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {userProjects.length > 0 && (
                <div className="mt-6 space-y-4">
                  {/* Points Earning Tip */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Coins className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900">💡 Earn Points with Every Interaction!</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Get <strong>+10 points</strong> for each like, <strong>+5 points</strong> for each click, and <strong>+2 points</strong> for each view.
                          Share your projects to earn more points and feature them on the homepage!
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("points")}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        View Points
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button asChild>
                      <Link href="/submit">
                        <Plus className="h-4 w-4 mr-2" />
                        Submit New Project
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>
                Manage all your submitted projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Plus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Submit your first project to get started on ShowYourProject.com
                  </p>
                  <Button asChild>
                    <Link href="/submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Your First Project
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            {getStatusBadge(project.status)}
                          </div>
                          <p className="text-muted-foreground mb-2">{project.tagline}</p>
                          <Badge variant="outline">{project.category}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {project.viewCount || 0}
                            </span>
                            <span className="flex items-center">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              {project.clickCount || 0}
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {project.voteCount || 0}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatDate(project.createdAt)}
                          </p>
                        </div>
                      </div>

                      {project.status === "approved" && project.updatedAt && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-800">
                            ✅ Approved on {formatDate(project.updatedAt)} - Your project is now live!
                          </p>
                        </div>
                      )}

                      {project.status === "pending" && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⏳ Under review - We'll notify you within 24-48 hours
                          </p>
                        </div>
                      )}

                      {project.status === "rejected" && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm text-red-800 mb-2">
                            ❌ Rejected - Please check your project and resubmit
                          </p>
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/submit">Resubmit Project</Link>
                          </Button>
                        </div>
                      )}

                      {project.featured && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-600 fill-current" />
                              <div>
                                <span className="text-sm font-semibold text-yellow-800">Currently Featured</span>
                                <div className="text-xs text-yellow-600">
                                  {project.featuredBy === 'admin'
                                    ? 'Featured by admin (permanent)'
                                    : (() => {
                                        const daysRemaining = getDaysRemaining(project.featuredUntil);
                                        return daysRemaining > 0
                                          ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
                                          : 'Expires today';
                                      })()
                                  }
                                </div>
                              </div>
                            </div>

                            {project.featuredBy !== 'admin' && (
                              <div className="text-right">
                                <div className="text-xs text-yellow-600">Expires</div>
                                <div className="text-xs font-medium text-yellow-800">
                                  {project.featuredUntil?.toDate?.()?.toLocaleDateString() || 'Soon'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <MessagingDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                Detailed performance metrics for your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and insights will be available in the next update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="space-y-6">
          <PointsSystem />
        </TabsContent>
      </Tabs>

      {/* Debug: Logout button */}
      <div className="mt-8 pt-8 border-t">
        <Button variant="outline" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
