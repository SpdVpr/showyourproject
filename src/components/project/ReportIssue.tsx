"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagingService } from "@/lib/firebaseServices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Send, X } from "lucide-react";
import type { Project } from "@/types";

interface ReportIssueProps {
  project: Project;
  onReportSent?: () => void;
}

const ISSUE_TYPES = [
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "spam", label: "Spam or Fake Project" },
  { value: "copyright", label: "Copyright Violation" },
  { value: "broken", label: "Broken Links or Images" },
  { value: "misleading", label: "Misleading Information" },
  { value: "other", label: "Other Issue" },
];



export function ReportIssue({ project, onReportSent }: ReportIssueProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Show login prompt if not logged in
  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to report an issue
          </p>
          <Button variant="outline" asChild>
            <a href="/login">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSendReport = async () => {
    if (!issueType) {
      alert("Please select an issue type");
      return;
    }

    if (!message.trim()) {
      alert("Please describe the issue");
      return;
    }

    setSending(true);
    try {
      // Create a report message to admin
      const reportMessage = `🚨 ISSUE REPORT

Project: ${project.name}
Project URL: ${process.env.NODE_ENV === 'production' ? 'https://showyourproject.com' : 'http://localhost:3001'}/project/${project.shortId || project.id}
Issue Type: ${ISSUE_TYPES.find(t => t.value === issueType)?.label}

Reported by: ${user.displayName || user.email}
User ID: ${user.id}

Description:
${message}

---
This is an automated report. Please review the project and take appropriate action.`;

      // For now, we'll use a fixed admin user ID. In production, you should find the admin user by email
      // or have a dedicated admin user ID in your environment variables
      const ADMIN_USER_ID = "admin"; // This should be replaced with actual admin user ID

      // Start or get conversation with admin (use actual project ID)
      const conversation = await messagingService.startConversation(
        project.id, // Use actual project ID
        ADMIN_USER_ID,
        user.id,
        user.displayName || "User",
        user.email || ""
      );

      // Send the report message
      await messagingService.sendMessage(
        conversation.id,
        user.id,
        user.displayName || "User",
        user.email || "",
        reportMessage
      );

      // Reset form
      setIssueType("");
      setMessage("");
      setIsOpen(false);
      
      if (onReportSent) {
        onReportSent();
      }

      alert("Report sent successfully! Our team will review it shortly.");

    } catch (error) {
      console.error("Error sending report:", error);
      alert("Failed to send report. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full"
        variant="outline"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        Report Issue
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Report Issue</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Report inappropriate content, spam, or other issues with this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="issue-type">Issue Type</Label>
          <Select value={issueType} onValueChange={setIssueType}>
            <SelectTrigger>
              <SelectValue placeholder="Select issue type" />
            </SelectTrigger>
            <SelectContent>
              {ISSUE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-message">Description</Label>
          <Textarea
            id="report-message"
            placeholder="Please describe the issue in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            onClick={handleSendReport}
            disabled={sending || !issueType || !message.trim()}
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
                Send Report
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
}
