"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { pointsService } from "@/lib/firebaseServices";
import { Button } from "@/components/ui/button";
import {
  Star,
  Trophy,
  CheckCircle
} from "lucide-react";
import { POINTS_CONFIG, type Project } from "@/types";

interface FeaturedPurchaseProps {
  project: Project;
  onPurchaseSuccess?: () => void;
}

export function FeaturedPurchase({ project, onPurchaseSuccess }: FeaturedPurchaseProps) {
  const { user } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!user) return null;

  const currentPoints = user.points || 0;
  const canAffordFeatured = currentPoints >= POINTS_CONFIG.FEATURED_COST;
  const pointsNeeded = POINTS_CONFIG.FEATURED_COST - currentPoints;
  const progressToFeatured = Math.min((currentPoints / POINTS_CONFIG.FEATURED_COST) * 100, 100);

  const handlePurchaseFeatured = async () => {
    if (!user || !canAffordFeatured) return;

    setPurchasing(true);
    try {
      await pointsService.purchaseFeaturedSpot(user.id, project.id);
      
      setShowConfirmation(false);
      
      // Show success message
      alert(`🎉 Success! "${project.name}" is now featured for ${POINTS_CONFIG.FEATURED_DURATION_DAYS} days!`);
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      let errorMessage = 'Failed to purchase featured spot. Please try again.';
      if (error.message.includes('Insufficient points')) {
        errorMessage = 'You don\'t have enough points for this purchase.';
      } else if (error.message.includes('already featured')) {
        errorMessage = 'This project is already featured.';
      } else if (error.message.includes('No featured slots')) {
        errorMessage = 'All featured slots are currently occupied. Please try again later.';
      }
      
      alert(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  // If project is already featured
  if (project.featured) {
    return (
      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-600 fill-current" />
          <div>
            <div className="font-semibold text-yellow-800">Currently Featured</div>
            <div className="text-sm text-yellow-600">
              {project.featuredBy === 'admin'
                ? 'Featured by admin'
                : `Expires ${project.featuredUntil?.toDate?.()?.toLocaleDateString() || 'soon'}`
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate color based on progress percentage
  const getButtonColor = (progress: number) => {
    if (progress >= 100) return "bg-green-600 hover:bg-green-700 border-green-600";
    if (progress >= 75) return "bg-lime-600 hover:bg-lime-700 border-lime-600";
    if (progress >= 50) return "bg-yellow-600 hover:bg-yellow-700 border-yellow-600";
    if (progress >= 25) return "bg-orange-600 hover:bg-orange-700 border-orange-600";
    return "bg-red-600 hover:bg-red-700 border-red-600";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-lime-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Featured Progress</span>
          <span className="font-semibold">
            {Math.round(progressToFeatured)}% ({currentPoints.toLocaleString()}/{POINTS_CONFIG.FEATURED_COST.toLocaleString()})
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressToFeatured)}`}
            style={{ width: `${Math.min(progressToFeatured, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Purchase Button */}
      {!showConfirmation ? (
        <Button
          onClick={() => canAffordFeatured ? setShowConfirmation(true) : null}
          disabled={!canAffordFeatured || purchasing}
          className={`w-full transition-all duration-300 ${getButtonColor(progressToFeatured)}`}
          size="lg"
        >
          <Star className="h-4 w-4 mr-2" />
          {canAffordFeatured
            ? `Feature Project (${POINTS_CONFIG.FEATURED_COST.toLocaleString()} points)`
            : `Need ${pointsNeeded.toLocaleString()} more points`
          }
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Confirm:</strong> Feature "{project.name}" for {POINTS_CONFIG.FEATURED_DURATION_DAYS} days ({POINTS_CONFIG.FEATURED_COST.toLocaleString()} points)
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handlePurchaseFeatured}
              disabled={purchasing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {purchasing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowConfirmation(false)}
              variant="outline"
              disabled={purchasing}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
