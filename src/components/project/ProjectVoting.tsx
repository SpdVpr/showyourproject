"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { voteService, pointsService } from "@/lib/firebaseServices";
import { POINTS_CONFIG } from "@/types";
import type { Project } from "@/types";

interface ProjectVotingProps {
  project: Project;
}

export function ProjectVoting({ project }: ProjectVotingProps) {
  const { user, refreshUser } = useAuth();
  const [isVoted, setIsVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(project.voteCount);
  const [isVoting, setIsVoting] = useState(false);

  // Load user's vote status when component mounts
  useEffect(() => {
    const loadVoteStatus = async () => {
      if (user && project.id) {
        try {
          const voted = await voteService.hasUserVoted(project.id, user.id);
          setIsVoted(voted);
        } catch (error) {
          console.error('Error loading vote status:', error);
        }
      }
    };

    loadVoteStatus();
  }, [user, project.id]);

  const handleVote = async () => {
    if (!user) {
      alert("Please sign in to vote for projects");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      // Toggle vote in Firebase
      const isNowVoted = await voteService.voteForProject(project.id, user.id);

      // Update local state
      setIsVoted(isNowVoted);
      setVoteCount(prev => isNowVoted ? prev + 1 : prev - 1);

      // Award points only when adding a vote (not removing)
      if (isNowVoted) {
        try {
          await pointsService.awardPoints(user.id, 'like', project.id, POINTS_CONFIG.LIKE_PROJECT);
          console.log(`Awarded ${POINTS_CONFIG.LIKE_PROJECT} points to user for liking project`);
          // Refresh user data immediately to show updated points
          refreshUser();
        } catch (error) {
          console.error('Error awarding like points:', error);
          // Don't block the vote if points fail
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant={isVoted ? "default" : "outline"}
          size="sm"
          onClick={handleVote}
          disabled={isVoting}
          className={`flex flex-col items-center px-4 py-3 h-auto rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
            isVoted
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
              : "bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 border-2 border-red-200 hover:border-red-300"
          }`}
        >
          <motion.div
            animate={isVoted ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`h-5 w-5 mb-1 ${isVoted ? "fill-current" : ""}`}
            />
          </motion.div>
          <span className="text-sm font-bold">
            {isVoting ? "..." : voteCount}
          </span>
          <span className="text-xs font-medium opacity-80">
            {isVoted ? "Liked" : "Like"}
          </span>
        </Button>
      </motion.div>

      <p className="text-xs text-muted-foreground text-center">
        {isVoted ? "Thanks for voting!" : "Vote if you like it"}
      </p>
    </div>
  );
}
