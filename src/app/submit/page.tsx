"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { SubmissionForm } from "@/components/submit/SubmissionForm";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import Link from "next/link";
import { Plus, CheckCircle, Clock, Zap, Mail, Shield } from "lucide-react";

export default function SubmitPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Submit Your Project</h1>
          <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
            Join thousands of entrepreneurs showcasing their projects to the world
          </p>

          <Card className="p-4 md:p-8">
            <CardContent className="space-y-4 md:space-y-6">
              <div className="text-center">
                <Plus className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                <h2 className="text-lg md:text-xl font-semibold mb-2">Ready to get started?</h2>
                <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                  Sign in to submit your project on ShowYourProject.com and start getting traffic and backlinks
                </p>
              </div>

              <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:justify-center">
                <Button asChild className="w-full md:w-auto">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild className="w-full md:w-auto">
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show email verification requirement for unverified users
  if (!user.emailVerified) {
    return (
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-center">Submit Your Project</h1>
          <p className="text-muted-foreground mb-6 md:mb-8 text-center text-sm md:text-base">
            Join thousands of entrepreneurs showcasing their projects to the world
          </p>

          {/* Email Verification Banner */}
          <EmailVerificationBanner />

          <Card className="p-4 md:p-8">
            <CardContent className="space-y-4 md:space-y-6">
              <div className="text-center">
                <Shield className="h-10 w-10 md:h-12 md:w-12 text-orange-500 mx-auto mb-3 md:mb-4" />
                <h2 className="text-lg md:text-xl font-semibold mb-2">Email Verification Required</h2>
                <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                  To maintain quality and prevent spam, you must verify your email address before submitting projects.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-orange-800 mb-1 text-sm md:text-base">Why verify your email?</h3>
                    <ul className="text-xs md:text-sm text-orange-700 space-y-1">
                      <li>• Ensures you receive important notifications about your projects</li>
                      <li>• Helps us maintain a high-quality community</li>
                      <li>• Prevents spam and fake submissions</li>
                      <li>• Required for all project-related communications</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button variant="outline" asChild className="w-full md:w-auto">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Submit Your Project</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Get your project in front of thousands of potential users on ShowYourProject.com and earn quality backlinks
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="text-center pb-3 md:pb-6">
              <Zap className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-base md:text-lg">Free Traffic</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Get discovered by thousands of visitors actively looking for new tools and solutions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3 md:pb-6">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-base md:text-lg">Quality Backlinks</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Earn high-quality backlinks that boost your SEO and search engine rankings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3 md:pb-6">
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-base md:text-lg">Quick Review</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                Our team reviews submissions within 24 hours to ensure quality and relevance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submission Form */}
        <SubmissionForm />

        {/* Guidelines */}
        <Card className="mt-6 md:mt-8">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Submission Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li>• Your project must be live and accessible via a public URL</li>
              <li>• Provide a clear, compelling description of what your project does</li>
              <li>• Include relevant tags to help users discover your project</li>
              <li>• Use a high-quality logo and screenshot if available</li>
              <li>• Ensure your project offers genuine value to users</li>
              <li>• No spam, adult content, or illegal activities</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
