import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Search, Home } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardHeader>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">Project Not Found</CardTitle>
            <CardDescription className="text-lg">
              The project you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This could happen if:
            </p>
            <ul className="text-left text-muted-foreground space-y-1 max-w-md mx-auto">
              <li>• The project was removed by the owner</li>
              <li>• The project was rejected during review</li>
              <li>• You followed an incorrect or outdated link</li>
              <li>• There was a typo in the URL</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
              <Button asChild variant="outline">
                <Link href="/" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Homepage
                </Link>
              </Button>
              
              <Button asChild>
                <Link href="/search" className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Search All Projects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
