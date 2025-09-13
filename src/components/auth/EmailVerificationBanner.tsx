"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, X, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function EmailVerificationBanner() {
  const { user, firebaseUser, refreshUser } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // Don't show if user is verified, not logged in, or dismissed
  if (!user || user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    if (!firebaseUser) return;
    
    setIsResending(true);
    setResendMessage("");
    
    try {
      await sendEmailVerification(firebaseUser, {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false
      });
      setResendMessage("Verification email sent! Check your inbox and spam folder.");
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      setResendMessage("Failed to send email. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!firebaseUser) return;
    
    try {
      // Reload the Firebase user to get latest emailVerified status
      await firebaseUser.reload();
      // Refresh our user data
      await refreshUser();
      
      if (firebaseUser.emailVerified) {
        setResendMessage("Email verified successfully! 🎉");
      } else {
        setResendMessage("Email not yet verified. Please check your inbox.");
      }
    } catch (error) {
      console.error("Failed to refresh verification status:", error);
      setResendMessage("Failed to check verification status.");
    }
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <Mail className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium mb-2">
              Please verify your email address
            </p>
            <p className="text-sm mb-3">
              We sent a verification email to <strong>{user.email}</strong>. 
              Click the link in the email to verify your account and unlock all features.
            </p>
            
            {resendMessage && (
              <p className="text-sm mb-3 p-2 bg-orange-100 rounded border border-orange-200">
                {resendMessage}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResending}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-3 w-3 mr-1" />
                    Resend Email
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStatus}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                I've Verified
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-orange-600 hover:bg-orange-100 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
