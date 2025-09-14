"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagingService } from "@/lib/firebaseServices";
import type { Conversation, AdminConversation } from "@/types";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const previousTotalRef = useRef(0);

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

      const newTotal = regularUnread + adminUnread;
      const previousTotal = previousTotalRef.current;

      // Show notification if there are new messages
      if (newTotal > previousTotal && previousTotal > 0) {
        const newMessages = newTotal - previousTotal;
        showNotification(`You have ${newMessages} new message${newMessages > 1 ? 's' : ''}!`);
      }

      setUnreadCount(regularUnread);
      setAdminUnreadCount(adminUnread);
      previousTotalRef.current = newTotal;
    } catch (error) {
      console.error("Error loading unread counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string) => {
    // Check if browser supports notifications
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("showyourproject.com", {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico"
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("showyourproject.com", {
              body: message,
              icon: "/favicon.ico",
              badge: "/favicon.ico"
            });
          }
        });
      }
    }
  };

  useEffect(() => {
    if (user) {
      // Initialize previous total on first load
      loadUnreadCounts().then(() => {
        previousTotalRef.current = unreadCount + adminUnreadCount;
      });

      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCounts, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setAdminUnreadCount(0);
      setLoading(false);
      previousTotalRef.current = 0;
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
