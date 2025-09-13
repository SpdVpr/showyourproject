"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Mail, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";

export function EmailVerificationStatus() {
  const { user, firebaseUser, refreshUser } = useAuth();
  const [isResending, setIsResending] = useState(false);

  if (!user) return null;

  const handleResendVerification = async () => {
    if (!firebaseUser) return;
    
    setIsResending(true);
    try {
      await sendEmailVerification(firebaseUser, {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false
      });
      alert("Verification email sent! Check your inbox and spam folder.");
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      alert("Failed to send email. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!firebaseUser) return;
    
    try {
      await firebaseUser.reload();
      await refreshUser();
      
      if (firebaseUser.emailVerified) {
        alert("Email verified successfully! 🎉");
      } else {
        alert("Email not yet verified. Please check your inbox.");
      }
    } catch (error) {
      console.error("Failed to refresh verification status:", error);
      alert("Failed to check verification status.");
    }
  };

  if (user.emailVerified) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 cursor-pointer hover:bg-orange-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Unverified
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3 space-y-3">
          <div className="flex items-start space-x-2">
            <Mail className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Email not verified</p>
              <p className="text-xs text-muted-foreground">
                Some features are limited until you verify your email
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full text-xs"
            >
              {isResending ? "Sending..." : "Resend Email"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              className="w-full text-xs"
            >
              I've Verified
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
