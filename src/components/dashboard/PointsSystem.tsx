"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { pointsService, userService } from "@/lib/firebaseServices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Heart, 
  MousePointer, 
  Trophy, 
  Coins, 
  TrendingUp,
  Gift,
  Clock,
  Info
} from "lucide-react";
import { POINTS_CONFIG, type PointsTransaction, type Project } from "@/types";
import { FeaturedPurchase } from "./FeaturedPurchase";

export function PointsSystem() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (!user) return;

    try {
      const userTransactions = await pointsService.getUserTransactions(user.id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadUserProjects = useCallback(async () => {
    if (!user) return;

    try {
      setProjectsLoading(true);
      const projects = await userService.getUserProjects(user.id);
      // Filter only approved projects for featured purchase
      const approvedProjects = projects.filter(p => p.status === 'approved');
      setUserProjects(approvedProjects);
    } catch (error) {
      console.error('Error loading user projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadUserProjects();
    }
  }, [user?.id]); // Only depend on user ID, not the functions

  // Refresh data when window gets focus or becomes visible (user returns from another tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refreshUser();
        loadTransactions();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        refreshUser();
        loadTransactions();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]); // Only depend on user ID



  if (!user) return null;

  const currentPoints = user.points || 0;
  const totalEarned = user.totalPointsEarned || 0;
  const totalSpent = user.totalPointsSpent || 0;
  const featuredPurchases = user.featuredPurchases || 0;
  
  const progressToFeatured = Math.min((currentPoints / POINTS_CONFIG.FEATURED_COST) * 100, 100);
  const canAffordFeatured = currentPoints >= POINTS_CONFIG.FEATURED_COST;

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <Coins className="h-4 w-4 mr-2" />
              Current Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{currentPoints.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalEarned.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
              <Gift className="h-4 w-4 mr-2" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Featured Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{featuredPurchases}</div>
          </CardContent>
        </Card>
      </div>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <span>How to Earn Points</span>
          </CardTitle>
          <CardDescription>
            Interact with other projects to earn points and boost your own visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
              <Heart className="h-8 w-8 text-pink-600" />
              <div>
                <div className="font-semibold text-pink-800">Like a Project</div>
                <div className="text-sm text-pink-600">+{POINTS_CONFIG.LIKE_PROJECT} points</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <MousePointer className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-800">Visit Project Website</div>
                <div className="text-sm text-blue-600">+{POINTS_CONFIG.CLICK_PROJECT} points</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Your Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>Feature Your Projects</span>
          </CardTitle>
          <CardDescription>
            Purchase featured spots for your approved projects ({POINTS_CONFIG.FEATURED_COST} points for {POINTS_CONFIG.FEATURED_DURATION_DAYS} days)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress and Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <div className="font-semibold text-yellow-800">Your Points</div>
                <div className="text-sm text-yellow-600">
                  {currentPoints.toLocaleString()} / {POINTS_CONFIG.FEATURED_COST.toLocaleString()} points
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {currentPoints.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress to Featured Spot</span>
                <span className={canAffordFeatured ? "text-green-600 font-semibold" : "text-gray-600"}>
                  {Math.round(progressToFeatured)}%
                </span>
              </div>
              <Progress value={progressToFeatured} className="h-2" />
            </div>

            {canAffordFeatured ? (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Ready to Feature!</span>
                </div>
                <p className="text-sm text-green-600">
                  You have enough points. Choose a project below to feature:
                </p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-800">Keep Earning!</span>
                </div>
                <p className="text-sm text-gray-600">
                  You need {(POINTS_CONFIG.FEATURED_COST - currentPoints).toLocaleString()} more points.
                  Like and visit other projects to earn points faster!
                </p>
              </div>
            )}
          </div>

          {/* Projects List */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Your Approved Projects</h3>
            {projectsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your projects...</p>
              </div>
            ) : userProjects.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No approved projects yet</p>
                <p className="text-sm text-gray-500">Submit and get your projects approved to feature them here!</p>
              </div>
            ) : (
            <div className="space-y-4">
              {userProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-muted-foreground text-sm">{project.tagline}</p>
                      <Badge variant="outline" className="mt-2">{project.category}</Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {project.voteCount || 0}
                        </span>
                        <span className="flex items-center">
                          <MousePointer className="h-4 w-4 mr-1" />
                          {project.clickCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <FeaturedPurchase
                    project={project}
                    onPurchaseSuccess={() => {
                      // Refresh data after successful purchase
                      loadTransactions();
                      loadUserProjects();
                    }}
                  />
                </div>
              ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest points transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions yet. Start earning points by interacting with projects!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {transaction.action === 'like' && <Heart className="h-4 w-4 text-pink-600" />}
                    {transaction.action === 'click' && <MousePointer className="h-4 w-4 text-blue-600" />}
                    {transaction.action === 'featured_purchase' && <Star className="h-4 w-4 text-yellow-600" />}
                    {transaction.action === 'admin_bonus' && <Gift className="h-4 w-4 text-purple-600" />}
                    
                    <div>
                      <div className="font-medium text-sm">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </div>
                    </div>
                  </div>
                  
                  <Badge 
                    variant={transaction.type === 'earned' ? 'default' : 'secondary'}
                    className={transaction.type === 'earned' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
