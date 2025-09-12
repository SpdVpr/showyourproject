"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagingService } from "@/lib/firebaseServices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, Clock, Mail } from "lucide-react";
import type { Conversation, Message } from "@/types";

export function MessagingDashboard() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Load user's conversations
  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log("messagingService:", messagingService);
      console.log("getUserConversations method:", messagingService?.getUserConversations);

      if (!messagingService || !messagingService.getUserConversations) {
        throw new Error("messagingService or getUserConversations method is not available");
      }

      const userConversations = await messagingService.getUserConversations(user.id);
      setConversations(userConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversation: Conversation) => {
    try {
      setLoadingMessages(true);
      const conversationMessages = await messagingService.getConversationMessages(conversation.id);
      setMessages(conversationMessages);

      // Mark messages as read
      if (user) {
        await messagingService.markMessagesAsRead(conversation.id, user.id);

        // Update unread count locally instead of reloading all conversations
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === conversation.id
              ? { ...conv, unreadCount: { ...conv.unreadCount, [user.id]: 0 } }
              : conv
          )
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
      await messagingService.sendMessage(
        selectedConversation.id,
        user.id,
        user.displayName || "User",
        user.email || "",
        newMessage
      );

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
                const otherPerson = isOwner ? conversation.contacterName : conversation.projectOwnerName;
                const unreadCount = conversation.unreadCount?.[user.id] || 0;

                return (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer transition-all duration-200 relative ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : unreadCount > 0
                          ? 'bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-400'
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
                        <User className={`h-4 w-4 ${unreadCount > 0 ? 'text-orange-600' : 'text-muted-foreground'}`} />
                        <span className={`text-sm ${unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium'}`}>
                          {otherPerson}
                        </span>
                        {unreadCount > 0 && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs bg-orange-500 hover:bg-orange-600">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Re: {conversation.projectName}
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

                {messages.length > 0 && messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === user.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user.id ? 'text-blue-100' : 'text-muted-foreground'
                        }`}>
                          {message.createdAt.toDate().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}

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
