"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagingService, userService } from "@/lib/firebaseServices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  Mail, 
  Shield, 
  Users, 
  Megaphone,
  Search,
  Plus,
  History
} from "lucide-react";
import type { AdminConversation, Message, User as UserType, BroadcastMessage } from "@/types";

export function AdminMessagingCenter() {
  const { user } = useAuth();
  const [adminConversations, setAdminConversations] = useState<AdminConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastMessage[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Access denied. Admin privileges required.
        </AlertDescription>
      </Alert>
    );
  }

  // Load admin conversations
  const loadAdminConversations = async () => {
    try {
      setLoading(true);
      const conversations = await messagingService.getAdminConversations();
      setAdminConversations(conversations);
    } catch (error) {
      console.error("Error loading admin conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load all users for new conversation
  const loadAllUsers = async () => {
    try {
      const users = await userService.getAllUsers();
      setAllUsers(users.filter(u => u.role !== 'admin')); // Exclude other admins
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Load broadcast history
  const loadBroadcastHistory = async () => {
    try {
      const history = await messagingService.getBroadcastMessages();
      setBroadcastHistory(history);
    } catch (error) {
      console.error("Error loading broadcast history:", error);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversation: AdminConversation) => {
    try {
      setLoadingMessages(true);
      const conversationMessages = await messagingService.getAdminConversationMessages(conversation.id);
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send direct message to user
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      await messagingService.sendAdminMessage(
        user.id,
        user.displayName || "Admin",
        user.email || "",
        selectedConversation.userId,
        selectedConversation.userName,
        selectedConversation.userEmail,
        newMessage
      );

      setNewMessage("");
      await loadMessages(selectedConversation);
      await loadAdminConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Start new conversation with user
  const handleStartNewConversation = async (targetUser: UserType) => {
    try {
      setSending(true);
      const conversation = await messagingService.startAdminConversation(
        user.id,
        user.displayName || "Admin",
        user.email || "",
        targetUser.id,
        targetUser.displayName || "User",
        targetUser.email
      );

      await loadAdminConversations();
      setSelectedConversation(conversation);
      setShowNewConversationDialog(false);
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert("Failed to start conversation. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Send broadcast message
  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastContent.trim() || !user) return;

    setSending(true);
    try {
      await messagingService.sendBroadcastMessage(
        user.id,
        user.displayName || "Admin",
        user.email || "",
        broadcastSubject,
        broadcastContent
      );

      setBroadcastSubject("");
      setBroadcastContent("");
      setShowBroadcastDialog(false);
      await loadBroadcastHistory();
      await loadAdminConversations();
      alert("Broadcast message sent successfully to all users!");
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert("Failed to send broadcast message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadAdminConversations();
    loadAllUsers();
    loadBroadcastHistory();
  }, []);

  // Filter users for search
  const filteredUsers = allUsers.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Messaging Center</h2>
          <p className="text-muted-foreground">Communicate with users directly or send broadcast messages</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
                <DialogDescription>
                  Select a user to start a direct conversation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="user-search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredUsers.map((targetUser) => (
                    <div
                      key={targetUser.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStartNewConversation(targetUser)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{targetUser.displayName || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{targetUser.email}</p>
                        </div>
                      </div>
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
            <DialogTrigger asChild>
              <Button>
                <Megaphone className="h-4 w-4 mr-2" />
                Broadcast Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Send Broadcast Message</DialogTitle>
                <DialogDescription>
                  Send a message to all users on the platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="broadcast-subject">Subject</Label>
                  <Input
                    id="broadcast-subject"
                    placeholder="Message subject..."
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="broadcast-content">Message</Label>
                  <Textarea
                    id="broadcast-content"
                    placeholder="Your message to all users..."
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    rows={6}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowBroadcastDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendBroadcast} disabled={sending || !broadcastSubject.trim() || !broadcastContent.trim()}>
                    {sending ? "Sending..." : "Send to All Users"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="conversations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="conversations">Direct Messages</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast History</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>User Conversations</span>
                </CardTitle>
                <CardDescription>
                  Direct messages with users
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {adminConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {adminConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          loadMessages(conversation);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{conversation.userName}</p>
                              <p className="text-sm text-muted-foreground truncate">{conversation.userEmail}</p>
                              {conversation.lastMessage && (
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {conversation.lastMessage}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-muted-foreground">
                                {conversation.lastMessageAt.toDate().toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>
                    {selectedConversation ? `Chat with ${selectedConversation.userName}` : 'Select a conversation'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedConversation ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a conversation to start messaging</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-80 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
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
                            className={`flex ${message.isAdminMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.isAdminMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border'
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`text-xs font-medium ${
                                  message.isAdminMessage ? 'text-blue-100' : 'text-gray-900'
                                }`}>
                                  {message.senderName}
                                </span>
                                {message.isAdminMessage && (
                                  <Shield className="h-3 w-3 text-blue-200" />
                                )}
                              </div>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.isAdminMessage ? 'text-blue-100' : 'text-muted-foreground'
                              }`}>
                                {message.createdAt.toDate().toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Type your message..."
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Broadcast Message History</span>
              </CardTitle>
              <CardDescription>
                Previously sent broadcast messages to all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {broadcastHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No broadcast messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {broadcastHistory.map((broadcast) => (
                    <div key={broadcast.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{broadcast.subject}</h4>
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              {broadcast.recipientCount} recipients
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{broadcast.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{broadcast.sentAt.toDate().toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>Sent by {broadcast.senderName}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
