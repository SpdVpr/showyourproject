"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">Something went wrong!</CardTitle>
            <CardDescription className="text-lg">
              We encountered an unexpected error. Our team has been notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Error Details:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <Button onClick={reset} className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Try again</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Go home</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
