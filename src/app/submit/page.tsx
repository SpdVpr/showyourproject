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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Submit Your Project</h1>
          <p className="text-muted-foreground mb-8">
            Join thousands of entrepreneurs showcasing their projects to the world
          </p>

          <Card className="p-8">
            <CardContent className="space-y-6">
              <div className="text-center">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Ready to get started?</h2>
                <p className="text-muted-foreground mb-6">
                  Sign in to submit your project on ShowYourProject.com and start getting traffic and backlinks
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-center">Submit Your Project</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Join thousands of entrepreneurs showcasing their projects to the world
          </p>

          {/* Email Verification Banner */}
          <EmailVerificationBanner />

          <Card className="p-8">
            <CardContent className="space-y-6">
              <div className="text-center">
                <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Email Verification Required</h2>
                <p className="text-muted-foreground mb-6">
                  To maintain quality and prevent spam, you must verify your email address before submitting projects.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-orange-800 mb-1">Why verify your email?</h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Ensures you receive important notifications about your projects</li>
                      <li>• Helps us maintain a high-quality community</li>
                      <li>• Prevents spam and fake submissions</li>
                      <li>• Required for all project-related communications</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button variant="outline" asChild>
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Submit Your Project</h1>
          <p className="text-muted-foreground">
            Get your project in front of thousands of potential users on ShowYourProject.com and earn quality backlinks
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Free Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Get discovered by thousands of visitors actively looking for new tools and solutions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Quality Backlinks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Earn high-quality backlinks that boost your SEO and search engine rankings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Quick Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Our team reviews submissions within 24 hours to ensure quality and relevance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submission Form */}
        <SubmissionForm />

        {/* Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Submission Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
