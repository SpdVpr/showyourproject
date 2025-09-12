import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { projectService, userService } from "@/lib/firebaseServices";
import type { Project } from "@/types";

export function AdminStats() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingProjects: 0,
    approvedProjects: 0,
    rejectedProjects: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalViews: 0,
    totalClicks: 0,
    conversionRate: 0,
    avgApprovalTime: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load real statistics from Firebase
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        // Get all projects with fallback
        let allProjects: Project[] = [];
        try {
          allProjects = await projectService.getAllProjects();
        } catch (error) {
          console.warn("Error loading projects for stats:", error);
        }

        // Calculate project statistics
        const totalProjects = allProjects.length;
        const pendingProjects = allProjects.filter(p => p.status === 'pending').length;
        const approvedProjects = allProjects.filter(p => p.status === 'approved').length;
        const rejectedProjects = allProjects.filter(p => p.status === 'rejected').length;

        // Calculate total views and clicks
        const totalViews = allProjects.reduce((sum, p) => sum + (p.viewCount || 0), 0);
        const totalClicks = allProjects.reduce((sum, p) => sum + (p.clickCount || 0), 0);
        const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

        // Get user statistics (with fallback)
        let totalUsers = 0;
        try {
          const users = await userService.getAllUsers();
          totalUsers = users.length;
        } catch (error) {
          console.warn("Error loading users for stats:", error);
        }

        setStats({
          totalProjects,
          pendingProjects,
          approvedProjects,
          rejectedProjects,
          totalUsers,
          activeUsers: Math.floor(totalUsers * 0.7), // Estimate 70% active
          totalViews,
          totalClicks,
          conversionRate: Math.round(conversionRate * 10) / 10,
          avgApprovalTime: 18, // Mock for now
        });
      } catch (error) {
        console.error("Error loading admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {stats.pendingProjects} pending
              </Badge>
              <Badge className="bg-green-100 text-green-800 text-xs">
                {stats.approvedProjects} approved
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.activeUsers} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Views to clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-900">{stats.pendingProjects}</div>
              <div className="text-sm text-yellow-700">Pending Review</div>
              <div className="text-xs text-yellow-600 mt-1">
                Avg. {stats.avgApprovalTime}h to approve
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">{stats.approvedProjects}</div>
              <div className="text-sm text-green-700">Approved</div>
              <div className="text-xs text-green-600 mt-1">
                {((stats.approvedProjects / stats.totalProjects) * 100).toFixed(1)}% approval rate
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-900">{stats.rejectedProjects}</div>
              <div className="text-sm text-red-700">Rejected</div>
              <div className="text-xs text-red-600 mt-1">
                {((stats.rejectedProjects / stats.totalProjects) * 100).toFixed(1)}% rejection rate
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <MousePointer className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalClicks.toLocaleString()}</div>
              <div className="text-sm text-blue-700">Total Clicks</div>
              <div className="text-xs text-blue-600 mt-1">
                Generated for projects
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
