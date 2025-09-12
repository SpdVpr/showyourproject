"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Shield, 
  Ban, 
  CheckCircle,
  MoreHorizontal,
  FileText
} from "lucide-react";

// Mock user data
const mockUsers = [
  {
    id: "user1",
    email: "sarah.johnson@email.com",
    displayName: "Sarah Johnson",
    role: "user",
    status: "active",
    joinedAt: new Date("2024-01-15"),
    projectsSubmitted: 3,
    lastActive: new Date("2024-02-16"),
    emailVerified: true,
  },
  {
    id: "user2",
    email: "alex.chen@email.com",
    displayName: "Alex Chen",
    role: "user",
    status: "active",
    joinedAt: new Date("2024-01-20"),
    projectsSubmitted: 1,
    lastActive: new Date("2024-02-15"),
    emailVerified: true,
  },
  {
    id: "user3",
    email: "mike.rodriguez@email.com",
    displayName: "Mike Rodriguez",
    role: "user",
    status: "suspended",
    joinedAt: new Date("2024-01-18"),
    projectsSubmitted: 0,
    lastActive: new Date("2024-02-10"),
    emailVerified: false,
  },
  {
    id: "user4",
    email: "emma.wilson@email.com",
    displayName: "Emma Wilson",
    role: "user",
    status: "active",
    joinedAt: new Date("2024-02-01"),
    projectsSubmitted: 2,
    lastActive: new Date("2024-02-16"),
    emailVerified: true,
  },
  {
    id: "admin1",
    email: "admin@showyourproject.com",
    displayName: "Admin User",
    role: "admin",
    status: "active",
    joinedAt: new Date("2024-01-01"),
    projectsSubmitted: 0,
    lastActive: new Date("2024-02-16"),
    emailVerified: true,
  },
];

export function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);

  const filteredUsers = mockUsers.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case "user":
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleSuspendUser = (user: typeof mockUsers[0]) => {
    console.log("Suspending user:", user.id);
    alert(`User ${user.displayName} has been suspended.`);
  };

  const handleActivateUser = (user: typeof mockUsers[0]) => {
    console.log("Activating user:", user.id);
    alert(`User ${user.displayName} has been activated.`);
  };

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{mockUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold">
                  {mockUsers.filter(u => u.status === "active").length}
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
                  {mockUsers.filter(u => u.role === "admin").length}
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
                <p className="text-sm font-medium">Total Projects</p>
                <p className="text-2xl font-bold">
                  {mockUsers.reduce((sum, u) => sum + u.projectsSubmitted, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, permissions, and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.displayName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{user.displayName}</h3>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                        {user.emailVerified && (
                          <CheckCircle className="h-4 w-4 text-green-600" title="Email verified" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {user.joinedAt.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {user.projectsSubmitted} projects
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      View Details
                    </Button>
                    
                    {user.role !== "admin" && (
                      <>
                        {user.status === "active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendUser(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateUser(user)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details: {selectedUser.displayName}</CardTitle>
            <CardDescription>
              Detailed information and activity history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {getStatusBadge(selectedUser.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Verified:</span>
                    <span>{selectedUser.emailVerified ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined:</span>
                    <span>{selectedUser.joinedAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Active:</span>
                    <span>{selectedUser.lastActive.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Activity Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projects Submitted:</span>
                    <span>{selectedUser.projectsSubmitted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projects Approved:</span>
                    <span>{Math.max(0, selectedUser.projectsSubmitted - 1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Votes Cast:</span>
                    <span>42</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
