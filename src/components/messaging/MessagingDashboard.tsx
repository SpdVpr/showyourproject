"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagingService } from "@/lib/firebaseServices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Send, User, Clock, Mail, Shield } from "lucide-react";
import type { Conversation, Message, AdminConversation } from "@/types";

interface ExtendedConversation extends Conversation {
  isAdmin?: boolean;
}

export function MessagingDashboard() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ExtendedConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Load user's conversations (both regular and admin)
  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const allConversations: ExtendedConversation[] = [];

      // Load regular conversations
      try {
        const userConversations = await messagingService.getUserConversations(user.id);
        allConversations.push(...userConversations.map(conv => ({ ...conv, isAdmin: false })));
      } catch (error) {
        console.warn("Error loading regular conversations:", error);
      }

      // Load admin conversation
      try {
        const adminConversation = await messagingService.getUserAdminConversation(user.id);
        if (adminConversation) {
          // Convert admin conversation to regular conversation format
          const adminAsConversation: ExtendedConversation = {
            id: adminConversation.id,
            participants: [user.id, 'admin'],
            participantNames: [user.displayName || user.email || 'User', 'ShowYourProject Admin'],
            participantEmails: [user.email || '', 'admin@showyourproject.com'],
            projectId: '',
            projectName: 'Admin Support',
            lastMessage: adminConversation.lastMessage || '',
            lastMessageAt: adminConversation.lastMessageAt,
            unreadCount: adminConversation.unreadCount || 0,
            createdAt: adminConversation.createdAt,
            isAdmin: true
          };
          allConversations.push(adminAsConversation);
        }
      } catch (error) {
        console.warn("Error loading admin conversation:", error);
      }

      // Sort by last message time
      allConversations.sort((a, b) => {
        const aTime = a.lastMessageAt?.toDate?.() || new Date(0);
        const bTime = b.lastMessageAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      setConversations(allConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversation: ExtendedConversation) => {
    try {
      setLoadingMessages(true);
      let conversationMessages: Message[];

      if (conversation.isAdmin) {
        // Load admin messages
        conversationMessages = await messagingService.getUserAdminMessages(user.id);
      } else {
        // Load regular messages
        conversationMessages = await messagingService.getConversationMessages(conversation.id);
      }
      setMessages(conversationMessages);

      // Mark messages as read
      if (user) {
        await messagingService.markMessagesAsRead(conversation.id, user.id);

        // Update unread count locally instead of reloading all conversations
        setConversations(prevConversations =>
          prevConversations.map(conv => {
            if (conv.id === conversation.id) {
              if (conversation.isAdmin) {
                // Admin conversation has simple unreadCount number
                return { ...conv, unreadCount: 0 };
              } else {
                // Regular conversation has unreadCount object
                return { ...conv, unreadCount: { ...conv.unreadCount, [user.id]: 0 } };
              }
            }
            return conv;
          })
        );
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      if (selectedConversation.isAdmin) {
        // Send message to admin conversation
        await messagingService.sendMessage(
          selectedConversation.id,
          user.id,
          user.displayName || "User",
          user.email || "",
          newMessage
        );
      } else {
        // Send regular message
        await messagingService.sendMessage(
          selectedConversation.id,
          user.id,
          user.displayName || "User",
          user.email || "",
          newMessage
        );
      }

      setNewMessage("");
      // Reload messages and conversations
      await loadMessages(selectedConversation);
      await loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please sign in to view your messages</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </CardContent>
      </Card>
    );
  }

  // Show email verification requirement for unverified users
  if (!user.emailVerified) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <Shield className="h-12 w-12 text-orange-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Email Verification Required</h3>
            <p className="text-muted-foreground mb-4">
              You must verify your email address to send and receive messages.
            </p>
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <Mail className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Why verify your email?</strong><br />
              Email verification helps us prevent spam and ensures you receive important notifications about your conversations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Messages</span>
          </CardTitle>
          <CardDescription>
            Your project conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const isOwner = user.id === conversation.projectOwnerId;
                const otherPerson = conversation.isAdmin
                  ? 'ShowYourProject Admin'
                  : (isOwner ? conversation.contacterName : conversation.projectOwnerName);
                const unreadCount = conversation.isAdmin
                  ? conversation.unreadCount || 0
                  : conversation.unreadCount?.[user.id] || 0;

                return (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer transition-all duration-200 relative ${
                      selectedConversation?.id === conversation.id
                        ? conversation.isAdmin
                          ? 'bg-purple-50 border-purple-200 shadow-sm'
                          : 'bg-blue-50 border-blue-200 shadow-sm'
                        : unreadCount > 0
                          ? conversation.isAdmin
                            ? 'bg-purple-50 hover:bg-purple-100 border-l-4 border-l-purple-400'
                            : 'bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-400'
                          : conversation.isAdmin
                            ? 'hover:bg-purple-25 hover:shadow-sm'
                            : 'hover:bg-gray-50 hover:shadow-sm'
                    }`}
                    onClick={() => {
                      // Don't reload if already selected
                      if (selectedConversation?.id === conversation.id) return;

                      setSelectedConversation(conversation);
                      loadMessages(conversation);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {conversation.isAdmin ? (
                          <Shield className={`h-4 w-4 ${unreadCount > 0 ? 'text-purple-600' : 'text-purple-500'}`} />
                        ) : (
                          <User className={`h-4 w-4 ${unreadCount > 0 ? 'text-orange-600' : 'text-muted-foreground'}`} />
                        )}
                        <span className={`text-sm ${unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium'}`}>
                          {otherPerson}
                        </span>
                        {conversation.isAdmin && (
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                            Admin
                          </Badge>
                        )}
                        {unreadCount > 0 && (
                          <div className={`w-2 h-2 rounded-full animate-pulse ${
                            conversation.isAdmin ? 'bg-purple-500' : 'bg-orange-500'
                          }`}></div>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className={`text-xs ${
                          conversation.isAdmin
                            ? 'bg-purple-500 hover:bg-purple-600'
                            : 'bg-orange-500 hover:bg-orange-600'
                        }`}>
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {conversation.isAdmin ? 'Admin Support' : `Re: ${conversation.projectName}`}
                    </p>
                    {conversation.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    )}
                    {conversation.lastMessageAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {conversation.lastMessageAt.toDate().toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages View */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedConversation.projectName}
              </CardTitle>
              <CardDescription>
                Conversation with {
                  user.id === selectedConversation.projectOwnerId 
                    ? selectedConversation.contacterName 
                    : selectedConversation.projectOwnerName
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[480px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg relative">
                {loadingMessages && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  </div>
                )}
                {messages.length === 0 && !loadingMessages ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No messages yet</p>
                  </div>
                ) : null}

                {messages.length > 0 && messages.map((message) => {
                  const isFromUser = message.senderId === user.id;
                  const isFromAdmin = selectedConversation?.isAdmin && !isFromUser;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          isFromUser
                            ? 'bg-blue-600 text-white'
                            : isFromAdmin
                              ? 'bg-purple-100 border border-purple-200'
                              : 'bg-white border'
                        }`}
                      >
                        {isFromAdmin && (
                          <div className="flex items-center space-x-1 mb-1">
                            <Shield className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">Admin</span>
                          </div>
                        )}
                        <p className={`text-sm ${isFromAdmin ? 'text-purple-900' : ''}`}>
                          {message.content}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isFromUser
                            ? 'text-blue-100'
                            : isFromAdmin
                              ? 'text-purple-600'
                              : 'text-muted-foreground'
                        }`}>
                          {message.createdAt.toDate().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Send Message */}
              <div className="flex space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[60px] max-h-[120px]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="self-end"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
