"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagingService } from "@/lib/firebaseServices";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Conversation, AdminConversation, Message } from "@/types";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const previousTotalRef = useRef(0);
  const lastMessageTimestampRef = useRef<Date | null>(null);
  const isInitializedRef = useRef(false);
  const userConversationsRef = useRef<string[]>([]);

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
        regularUnread = conversations.reduce((total, conv) => {
          // Regular conversations have unreadCount as object {userId: number}
          const userUnreadCount = conv.unreadCount?.[user.id] || 0;
          return total + userUnreadCount;
        }, 0);

        // Store conversation IDs for message filtering
        userConversationsRef.current = conversations.map(conv => conv.id);
      } catch (error) {
        console.warn("Error loading regular conversations:", error);
      }

      // Load admin conversations (if user has any)
      let adminUnread = 0;
      try {
        const userAdminConv = await messagingService.getUserAdminConversation(user.id);
        adminUnread = userAdminConv?.unreadCount || 0;

        // Add admin conversation ID if it exists
        if (userAdminConv) {
          userConversationsRef.current.push(`admin_${user.id}`);
        }
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
        isInitializedRef.current = true;
      });

      // Set up real-time listener for new messages
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        limit(50) // Listen to last 50 messages to catch new ones
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        if (!isInitializedRef.current) return; // Skip initial load

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const message = { id: change.doc.id, ...change.doc.data() } as Message;

            // Check if this message is relevant to current user
            const isRelevantMessage =
              // Message is in user's conversation (they are not the sender)
              message.senderId !== user.id &&
              // And it's in one of user's conversations
              userConversationsRef.current.includes(message.conversationId);

            if (isRelevantMessage) {
              // Check if this is a truly new message (created after last known timestamp)
              const messageTime = message.createdAt?.toDate?.() || new Date(message.createdAt);

              if (!lastMessageTimestampRef.current || messageTime > lastMessageTimestampRef.current) {
                lastMessageTimestampRef.current = messageTime;

                // Show notification for new message
                const senderName = message.senderName || 'Someone';
                const isFromAdmin = message.conversationId.startsWith('admin_');
                const notificationText = isFromAdmin
                  ? `New message from Admin: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`
                  : `New message from ${senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`;

                showNotification(notificationText);

                // Refresh unread counts
                loadUnreadCounts();
              }
            }
          }
        });
      });

      // Refresh every 30 seconds as backup
      const interval = setInterval(loadUnreadCounts, 30000);

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    } else {
      setUnreadCount(0);
      setAdminUnreadCount(0);
      setLoading(false);
      previousTotalRef.current = 0;
      lastMessageTimestampRef.current = null;
      isInitializedRef.current = false;
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
