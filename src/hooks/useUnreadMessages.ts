"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagingService } from "@/lib/firebaseServices";
import type { Conversation, AdminConversation } from "@/types";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCounts = async () => {
    if (!user) {
      setUnreadCount(0);
      setAdminUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load regular conversations
      let regularUnread = 0;
      try {
        const conversations = await messagingService.getUserConversations(user.id);
        regularUnread = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
      } catch (error) {
        console.warn("Error loading regular conversations:", error);
      }

      // Load admin conversations (if user has any)
      let adminUnread = 0;
      try {
        const userAdminConv = await messagingService.getUserAdminConversation(user.id);
        adminUnread = userAdminConv?.unreadCount || 0;
      } catch (error) {
        console.warn("Error loading admin conversations:", error);
      }

      setUnreadCount(regularUnread);
      setAdminUnreadCount(adminUnread);
    } catch (error) {
      console.error("Error loading unread counts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUnreadCounts();
      
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCounts, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setAdminUnreadCount(0);
      setLoading(false);
    }
  }, [user]);

  const totalUnread = unreadCount + adminUnreadCount;

  return {
    unreadCount,
    adminUnreadCount,
    totalUnread,
    loading,
    refresh: loadUnreadCounts
  };
}
