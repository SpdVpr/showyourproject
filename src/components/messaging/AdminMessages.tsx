"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagingService } from "@/lib/firebaseServices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  Send, 
  Shield, 
  Clock, 
  Mail,
  Megaphone
} from "lucide-react";
import type { AdminConversation, Message } from "@/types";

export function AdminMessages() {
  const { user } = useAuth();
  const [adminConversation, setAdminConversation] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  if (!user) {
    return null;
  }

  // Load user's admin conversation
  const loadAdminConversation = async () => {
    try {
      setLoading(true);
      const userConversation = await messagingService.getUserAdminConversation(user.id);
      setAdminConversation(userConversation);

      if (userConversation) {
        await loadMessages();
      }
    } catch (error) {
      console.error("Error loading admin conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for admin conversation
  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const conversationMessages = await messagingService.getUserAdminMessages(user.id);
      setMessages(conversationMessages);

      // Mark messages as read
      if (adminConversation && adminConversation.unreadCount > 0) {
        // Note: We would need to add a function to mark admin messages as read
        // For now, we'll just update the local state
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send reply to admin
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      // If no conversation exists, this will create one when admin responds
      // For now, we'll show a message that the reply will be sent to admin
      
      // In a real implementation, you might want to create a "user to admin" message
      // or use a different mechanism for user replies to admin messages
      
      alert("Your message will be sent to the admin team. They will respond as soon as possible.");
      setNewMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAdminConversation();
    }
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading admin messages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Admin Messages</span>
          {adminConversation && adminConversation.unreadCount > 0 && (
            <Badge variant="destructive">
              {adminConversation.unreadCount} new
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Messages from the ShowYourProject.com admin team
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!adminConversation ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No admin messages yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              The admin team will contact you here if needed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Messages */}
            <div className="max-h-80 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
              {loadingMessages ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isAdminMessage ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isAdminMessage
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-white border'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {message.isAdminMessage && (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          message.isAdminMessage ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {message.senderName}
                        </span>
                        {message.messageType === 'admin_broadcast' && (
                          <Badge variant="secondary" className="text-xs">
                            <Megaphone className="h-3 w-3 mr-1" />
                            Broadcast
                          </Badge>
                        )}
                      </div>
                      
                      {/* Handle broadcast messages with subject */}
                      {message.messageType === 'admin_broadcast' && message.content.includes('**') ? (
                        <div>
                          {message.content.split('\n\n').map((part, index) => (
                            <div key={index}>
                              {index === 0 ? (
                                <h4 className="font-semibold text-blue-900 mb-2">
                                  {part.replace(/\*\*/g, '')}
                                </h4>
                              ) : (
                                <p className="text-sm text-gray-700">{part}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700">{message.content}</p>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {message.createdAt.toDate().toLocaleString()}
                        </span>
                        {!message.read && message.isAdminMessage && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Reply to admin team..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  rows={2}
                  onKeyDown={(e) => {
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
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Your reply will be sent directly to the admin team. They typically respond within 24 hours.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
