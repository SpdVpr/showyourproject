"use client";

import { useState, useEffect } from "react";
import { messagingService } from "@/lib/firebaseServices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Users, TrendingUp, Clock, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Conversation, Message } from "@/types";

export function AdminMessaging() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    todayMessages: 0,
    uniqueMessagingUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load all messaging data
  const loadMessagingData = async () => {
    try {
      setLoading(true);
      const [allConversations, allMessages, messagingStats] = await Promise.all([
        messagingService.getAllConversations(),
        messagingService.getAllMessages(),
        messagingService.getMessagingStats()
      ]);

      setConversations(allConversations);
      setMessages(allMessages);
      setStats(messagingStats);
    } catch (error) {
      console.error("Error loading messaging data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadConversationMessages = async (conversation: Conversation) => {
    try {
      setLoadingMessages(true);
      const messages = await messagingService.getConversationMessages(conversation.id);
      setConversationMessages(messages);
    } catch (error) {
      console.error("Error loading conversation messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMessagingData();
  }, []);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.projectOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contacterName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messaging data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messaging Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Conversations</p>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active (7 days)</p>
                <p className="text-2xl font-bold">{stats.activeConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Today's Messages</p>
                <p className="text-2xl font-bold">{stats.todayMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold">{stats.uniqueMessagingUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="conversations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="conversations">All Conversations</TabsTrigger>
          <TabsTrigger value="messages">Recent Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>All user conversations</CardDescription>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => {
                      const totalUnread = Object.values(conversation.unreadCount || {}).reduce((sum, count) => sum + count, 0);
                      
                      return (
                        <div
                          key={conversation.id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            loadConversationMessages(conversation);
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{conversation.projectName}</span>
                            {totalUnread > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {totalUnread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {conversation.projectOwnerName} ↔ {conversation.contacterName}
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
                      Conversation between {selectedConversation.projectOwnerName} and {selectedConversation.contacterName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[400px] overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
                      {loadingMessages ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Loading messages...</p>
                        </div>
                      ) : conversationMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No messages yet</p>
                        </div>
                      ) : (
                        conversationMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === selectedConversation.projectOwnerId ? 'justify-start' : 'justify-end'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.senderId === selectedConversation.projectOwnerId
                                  ? 'bg-white border'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`text-xs font-medium ${
                                  message.senderId === selectedConversation.projectOwnerId ? 'text-gray-900' : 'text-blue-100'
                                }`}>
                                  {message.senderName}
                                </span>
                                {!message.read && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === selectedConversation.projectOwnerId ? 'text-muted-foreground' : 'text-blue-100'
                              }`}>
                                {message.createdAt.toDate().toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a conversation to view messages</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest messages across all conversations</CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages found</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {messages.slice(0, 50).map((message) => (
                    <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{message.senderName}</span>
                          <Badge variant="outline" className="text-xs">
                            {message.senderEmail}
                          </Badge>
                          {!message.read && (
                            <Badge variant="destructive" className="text-xs">Unread</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {message.createdAt.toDate().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                      <p className="text-xs text-muted-foreground">
                        Conversation ID: {message.conversationId}
                      </p>
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
