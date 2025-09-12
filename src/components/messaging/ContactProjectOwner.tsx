"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagingService } from "@/lib/firebaseServices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { MessageCircle, Send, User } from "lucide-react";
import type { Project } from "@/types";

interface ContactProjectOwnerProps {
  project: Project;
  onMessageSent?: () => void;
}

export function ContactProjectOwner({ project, onMessageSent }: ContactProjectOwnerProps) {
  try {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    // Debug logging
    console.log('ContactProjectOwner render:', {
      user: user ? { id: user.id, displayName: user.displayName } : null,
      project: { id: project.id, submitterId: project.submitterId, name: project.name },
      isOwnProject: user && user.id === project.submitterId
    });

    // Don't show contact button for own projects
    if (user && user.id === project.submitterId) {
      console.log('ContactProjectOwner: Hiding for own project');
      return null;
    }

  // Show login prompt if not logged in
  if (!user) {
    console.log('ContactProjectOwner: Showing login prompt');
    return (
      <div className="w-full">
        <div className="p-4 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to contact the project owner
          </p>
          <Button variant="outline" asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    setSending(true);
    try {
      // Start or get conversation
      const conversation = await messagingService.startConversation(
        project.id,
        project.submitterId,
        user.id,
        user.displayName || "User",
        user.email || ""
      );

      // Send the message
      await messagingService.sendMessage(
        conversation.id,
        user.id,
        user.displayName || "User",
        user.email || "",
        message
      );

      // Reset form
      setMessage("");
      setIsOpen(false);
      
      if (onMessageSent) {
        onMessageSent();
      }

      alert("Message sent successfully! The project owner will see it in their dashboard.");

    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) {
    console.log('ContactProjectOwner: Showing contact button');
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full"
        variant="outline"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Contact Project Owner
      </Button>
    );
  }

  console.log('ContactProjectOwner: Showing contact form');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Contact Project Owner</span>
        </CardTitle>
        <CardDescription>
          Send a message to {project.submitterName} about "{project.name}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Sending as: {user?.displayName || "User"} ({user?.email})
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! I'm interested in your project..."
            className="min-h-[120px]"
            maxLength={1000}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {message.length}/1000 characters
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleSendMessage}
            disabled={sending || !message.trim()}
            className="flex-1"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={sending}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  } catch (error) {
    console.error('ContactProjectOwner error:', error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">
          Contact feature temporarily unavailable. Please try refreshing the page.
        </p>
      </div>
    );
  }
}
