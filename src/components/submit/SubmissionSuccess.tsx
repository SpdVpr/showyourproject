"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Clock, Eye, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface SubmissionSuccessProps {
  projectName: string;
  submissionId: string;
}

export function SubmissionSuccess({ projectName, submissionId }: SubmissionSuccessProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>
            
            <CardTitle className="text-2xl text-green-900">
              Submission Successful! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              Thank you for submitting "{projectName}" to ShowYourProject.com
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg text-left">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                What happens next?
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                  <span>Our team will review your submission within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                  <span>You'll receive an email notification about the approval status</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                  <span>Once approved, your project will be featured on our homepage</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                  <span>Track your project's performance in your dashboard</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Submission ID:</strong> {submissionId}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Keep this ID for your records. You can use it to track your submission status.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild variant="outline" className="flex items-center">
                <Link href="/dashboard">
                  <Eye className="h-4 w-4 mr-2" />
                  View Dashboard
                </Link>
              </Button>
              
              <Button asChild className="flex items-center">
                <Link href="/submit">
                  <Share2 className="h-4 w-4 mr-2" />
                  Submit Another Project
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Want to increase your chances of approval?{" "}
                <Link href="/guidelines" className="text-blue-600 hover:underline">
                  Read our submission guidelines
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
