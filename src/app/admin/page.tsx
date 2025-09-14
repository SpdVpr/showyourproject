"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { projectService, pointsService, userService } from "@/lib/firebaseServices";
import type { Project, FeaturedSlot, PointsTransaction, User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminProjectReview } from "@/components/admin/AdminProjectReview";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminSocialMediaSettings } from "@/components/admin/AdminSocialMediaSettings";
import { AdminMessaging } from "@/components/admin/AdminMessaging";
import { AdminMessagingCenter } from "@/components/admin/AdminMessagingCenter";
import { AdminSettings } from "@/components/admin/AdminSettings";
import Link from "next/link";
import { Shield, Users, FileText, BarChart3, Settings, AlertTriangle, Search, Star, MessageCircle, Clock } from "lucide-react";



export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [approvedProjects, setApprovedProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<string>("");

  // Featured projects state
  const [featuredSlots, setFeaturedSlots] = useState<FeaturedSlot[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [featuredStats, setFeaturedStats] = useState({
    activeSlots: 0,
    pointsSpentThisMonth: 0,
    activeUsers: 0
  });
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Load pending projects
  const loadPendingProjects = async () => {
    try {
      setLoadingProjects(true);

      try {
        // Try to get pending projects with index
        const projects = await projectService.getPendingProjects();
        console.log("Loaded pending projects:", projects);
        setPendingProjects(projects);
      } catch (indexError: any) {
        console.warn("Index not available for pending projects, falling back to getAllProjects:", indexError);

        // Fallback: Get all projects and filter client-side
        const allProjects = await projectService.getAllProjects();
        const pendingProjectsFiltered = allProjects.filter(project => project.status === 'pending');

        // Sort by createdAt descending (newest first)
        pendingProjectsFiltered.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return bTime.getTime() - aTime.getTime();
        });

        console.log("Loaded pending projects (fallback):", pendingProjectsFiltered);
        setPendingProjects(pendingProjectsFiltered);
      }
    } catch (error) {
      console.error('Error loading pending projects:', error);
      setPendingProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load approved projects
  const loadApprovedProjects = async () => {
    try {
      setLoadingApproved(true);

      try {
        // Try to get approved projects with index
        const projects = await projectService.getProjects(100); // Get more approved projects
        console.log("Loaded approved projects:", projects);
        setApprovedProjects(projects);
      } catch (indexError: any) {
        console.warn("Index not available for approved projects, falling back to getAllProjects:", indexError);

        // Fallback: Get all projects and filter client-side
        const allProjects = await projectService.getAllProjects();
        const approvedProjectsFiltered = allProjects.filter(project => project.status === 'approved');

        // Sort by createdAt descending (newest first)
        approvedProjectsFiltered.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return bTime.getTime() - aTime.getTime();
        });

        console.log("Loaded approved projects (fallback):", approvedProjectsFiltered);
        setApprovedProjects(approvedProjectsFiltered);
      }
    } catch (error) {
      console.error('Error loading approved projects:', error);
      setApprovedProjects([]);
    } finally {
      setLoadingApproved(false);
    }
  };

  // Migration function to add shortId to existing projects
  const migrateProjectsToSEO = async () => {
    try {
      setMigrationStatus("Starting migration...");

      // Get all projects
      const allProjects = await projectService.getAllProjects();
      setMigrationStatus(`Found ${allProjects.length} projects to check`);

      let updatedCount = 0;
      let skippedCount = 0;

      for (const project of allProjects) {
        if (!project.shortId) {
          const shortId = projectService.generateShortId();
          await projectService.updateProject(project.id, { shortId });
          setMigrationStatus(`Updated "${project.name}" with shortId: ${shortId}`);
          updatedCount++;
        } else {
          skippedCount++;
        }
      }

      setMigrationStatus(`Migration completed! Updated: ${updatedCount}, Skipped: ${skippedCount}`);

      // Refresh project lists
      loadApprovedProjects();
      loadPendingProjects();

    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus(`Migration failed: ${error}`);
    }
  };

  // Load featured projects data
  const loadFeaturedData = async () => {
    try {
      setLoadingFeatured(true);

      // Get active featured slots
      const slots = await pointsService.getActiveFeaturedSlots();
      setFeaturedSlots(slots);

      // Get featured projects
      const featured = await projectService.getFeaturedProjects();
      setFeaturedProjects(featured);

      // Calculate stats - simplified for now
      setFeaturedStats({
        activeSlots: slots.length,
        pointsSpentThisMonth: slots.reduce((sum, slot) => sum + (slot.pointsSpent || 500), 0),
        activeUsers: new Set(slots.map(s => s.userId)).size
      });

    } catch (error) {
      console.error('Error loading featured data:', error);
    } finally {
      setLoadingFeatured(false);
    }
  };

  // Load users data
  const loadUsersData = async () => {
    try {
      setLoadingUsers(true);
      const allUsers = await userService.getAllUsers();

      // Sort users by registration date (newest first)
      const sortedUsers = allUsers.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user && (user.email === "admin@showyourproject.com" || user.tier === "admin" || user.role === "admin" || user.isAdmin === true)) {
      loadPendingProjects();
      loadApprovedProjects();
      loadFeaturedData();
      loadUsersData();
    }
  }, [user]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-900">Admin Login Required</CardTitle>
              <CardDescription className="text-lg">
                Please sign in with admin credentials to access the admin panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                You need to be logged in as an administrator to access this area.
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/login?redirect=/admin">Sign In as Admin</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Return to Homepage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user is admin (multiple ways to verify)
  const isAdmin = user.email === "admin@showyourproject.com" ||
                  user.tier === "admin" ||
                  user.role === "admin" ||
                  user.isAdmin === true;

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-900">Access Denied</CardTitle>
              <CardDescription className="text-lg">
                You don't have permission to access the admin panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Debug Information:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Tier:</strong> {user.tier || 'not set'}</p>
                  <p><strong>Role:</strong> {user.role || 'not set'}</p>
                  <p><strong>IsAdmin:</strong> {user.isAdmin ? 'true' : 'false'}</p>
                  <p><strong>Expected Admin Email:</strong> admin@showyourproject.com</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                This area is restricted to administrators only. If you believe you should have access, please contact support.
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/login?redirect=/admin">Try Admin Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Return to Homepage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Badge className="bg-blue-100 text-blue-800">Administrator</Badge>
        </div>
        <p className="text-muted-foreground">
          Manage projects, users, and platform settings for ShowYourProject.com
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Review</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Approved</span>
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Featured</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="admin-messaging" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Admin Chat</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Social Media</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminStats />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab("projects")}
                >
                  <FileText className="h-6 w-6" />
                  <span>Review Projects</span>
                  <Badge variant="destructive" className="text-xs">
                    {pendingProjects.length} pending
                  </Badge>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                  <Badge variant="secondary" className="text-xs">
                    {users.length} total
                  </Badge>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab("featured")}
                >
                  <Star className="h-6 w-6" />
                  <span>Featured Projects</span>
                  <Badge variant="secondary" className="text-xs">
                    {featuredProjects.length} active
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProjects || loadingApproved ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Recent approved projects */}
                  {approvedProjects.slice(0, 2).map((project) => (
                    <div key={`approved-${project.id}`} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Project "{project.name}" approved</p>
                        <p className="text-xs text-muted-foreground">
                          {project.approvedAt ?
                            new Date(project.approvedAt.toDate()).toLocaleDateString() :
                            'Recently'
                          }
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Recent pending projects */}
                  {pendingProjects.slice(0, 2).map((project) => (
                    <div key={`pending-${project.id}`} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New project "{project.name}" submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {project.submittedAt ?
                            new Date(project.submittedAt.toDate()).toLocaleDateString() :
                            'Recently'
                          }
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Featured projects activity */}
                  {featuredProjects.slice(0, 1).map((project) => (
                    <div key={`featured-${project.id}`} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Project "{project.name}" featured</p>
                        <p className="text-xs text-muted-foreground">
                          {project.featuredPurchasedAt ?
                            new Date(project.featuredPurchasedAt.toDate()).toLocaleDateString() :
                            'Recently'
                          }
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Show message if no activity */}
                  {pendingProjects.length === 0 && approvedProjects.length === 0 && featuredProjects.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {loadingProjects ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading pending projects...</p>
              </CardContent>
            </Card>
          ) : (
            <AdminProjectReview
              projects={pendingProjects}
              onProjectUpdate={loadPendingProjects}
            />
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          {loadingApproved ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading approved projects...</p>
              </CardContent>
            </Card>
          ) : (
            <AdminProjectReview
              projects={approvedProjects}
              onProjectUpdate={() => {
                loadApprovedProjects();
                loadPendingProjects(); // Refresh both lists
              }}
              isApprovedView={true}
            />
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Featured Projects Management</span>
              </CardTitle>
              <CardDescription>
                Manage featured projects and monitor the points-based featured system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Featured System Stats */}
                {loadingFeatured ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-lg border animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Active Featured</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-900 mt-1">{featuredStats.activeSlots}</div>
                      <div className="text-sm text-yellow-600">of 6 slots used</div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Points Spent</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900 mt-1">{featuredStats.pointsSpentThisMonth.toLocaleString()}</div>
                      <div className="text-sm text-blue-600">this month</div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Active Users</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900 mt-1">{featuredStats.activeUsers}</div>
                      <div className="text-sm text-green-600">earning points</div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-800">Featured Cost</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900 mt-1">500</div>
                      <div className="text-sm text-purple-600">points for 7 days</div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-16 flex flex-col space-y-1">
                      <Star className="h-5 w-5" />
                      <span>Manually Feature Project</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col space-y-1">
                      <Settings className="h-5 w-5" />
                      <span>Adjust Points Settings</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col space-y-1">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Cleanup Expired Slots</span>
                    </Button>
                  </div>
                </div>

                {/* Featured Projects List */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Current Featured Projects</h3>
                  {loadingFeatured ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : featuredProjects.length > 0 ? (
                    <div className="space-y-3">
                      {featuredProjects.map((project) => {
                        const slot = featuredSlots.find(s => s.projectId === project.id);
                        return (
                          <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold">{project.name}</h4>
                                  <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                                  {project.featuredBy === 'admin' && (
                                    <Badge variant="outline">Admin Featured</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{project.tagline}</p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span>❤️ {project.voteCount || 0} likes</span>
                                  <span>👁️ {project.viewCount || 0} views</span>
                                  {slot && (
                                    <span>⏰ Expires: {slot.expiresAt.toDate().toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/project/${project.id}`, '_blank')}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    if (confirm(`Remove "${project.name}" from featured?`)) {
                                      // TODO: Implement remove featured
                                      console.log('Remove featured:', project.id);
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No featured projects at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {loadingUsers ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Total Users</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Active Users</p>
                        <p className="text-2xl font-bold">
                          {users.filter(u => !u.disabled).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Admins</p>
                        <p className="text-2xl font-bold">
                          {users.filter(u => u.role === "admin" || u.isAdmin).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">With Projects</p>
                        <p className="text-2xl font-bold">
                          {users.filter(u => (u.projectsSubmitted || 0) > 0).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {users.length > 0 ? (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-semibold">{user.displayName || 'No name'}</h3>
                                  {(user.role === "admin" || user.isAdmin) && (
                                    <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                                  )}
                                  {user.disabled ? (
                                    <Badge className="bg-red-100 text-red-800">Disabled</Badge>
                                  ) : (
                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                  )}
                                  {user.emailVerified && (
                                    <Badge variant="outline" className="text-green-600">✓ Verified</Badge>
                                  )}
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>{user.email}</span>
                                  {user.createdAt && (
                                    <span>Joined {user.createdAt.toDate().toLocaleDateString()} at {user.createdAt.toDate().toLocaleTimeString()}</span>
                                  )}
                                  <span>{user.projectsSubmitted || 0} projects</span>
                                  {user.points && (
                                    <span>{user.points} points</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/dashboard?user=${user.id}`, '_blank')}
                              >
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Reports</CardTitle>
              <CardDescription>
                User reports and content moderation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports</h3>
                <p className="text-muted-foreground">
                  No content reports at this time. Great job keeping the platform clean!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdminSettings />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <AdminSocialMediaSettings />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Tools</CardTitle>
              <CardDescription>
                Manage SEO-friendly URLs and project optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">SEO-Friendly URLs</h3>
                  <p className="text-muted-foreground mb-4">
                    Convert existing project URLs to SEO-friendly format (e.g., /project/my-awesome-project-ABC123)
                  </p>

                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={migrateProjectsToSEO}
                      disabled={migrationStatus.includes("Starting")}
                    >
                      {migrationStatus.includes("Starting") ? "Migrating..." : "Add SEO URLs to Projects"}
                    </Button>

                    {migrationStatus && (
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Status: {migrationStatus}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">URL Format</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Old format:</strong> <code>/project/EvDXdpq5Xh7P2joYU0nS</code></p>
                    <p><strong>New format:</strong> <code>/project/my-awesome-project-ABC123</code></p>
                    <p className="text-muted-foreground">
                      Old URLs will continue to work as fallbacks. New projects automatically get SEO-friendly URLs.
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Migration Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {approvedProjects.filter(p => p.shortId).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Projects with SEO URLs</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {approvedProjects.filter(p => !p.shortId).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Projects needing migration</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {approvedProjects.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Total approved projects</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <AdminMessaging />
        </TabsContent>

        <TabsContent value="admin-messaging" className="space-y-6">
          <AdminMessagingCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
