import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Lightbulb } from "lucide-react";

export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Submission Guidelines</h1>
          <p className="text-muted-foreground text-lg">
            Follow these guidelines to increase your chances of getting approved on ShowYourProject.com
          </p>
        </div>

        <div className="grid gap-6">
          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <CheckCircle className="h-5 w-5 mr-2" />
                Requirements
              </CardTitle>
              <CardDescription>
                Your project must meet these basic requirements to be considered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Live and Accessible:</strong> Your project must be live and accessible via a public URL
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Original Content:</strong> Must be your own project or you must have permission to submit it
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Functional:</strong> The website/app should be fully functional, not just a landing page
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>English Content:</strong> Primary content should be in English for our global audience
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Professional Quality:</strong> Well-designed, user-friendly interface
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Lightbulb className="h-5 w-5 mr-2" />
                Best Practices
              </CardTitle>
              <CardDescription>
                Follow these tips to make your submission stand out
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Project Information</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Write a clear, compelling tagline (under 100 characters)</li>
                    <li>• Provide a detailed description explaining the problem you solve</li>
                    <li>• Use relevant, specific tags (avoid generic terms like "app" or "website")</li>
                    <li>• Choose the most appropriate category</li>
                    <li>• Include social media links if available</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Visual Assets</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Upload a high-quality logo (512x512px recommended)</li>
                    <li>• Provide a clear screenshot showing your product in action</li>
                    <li>• Ensure images are well-lit and professional</li>
                    <li>• Avoid cluttered or confusing screenshots</li>
                    <li>• Use consistent branding across all assets</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What We Look For */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-purple-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                What We Look For
              </CardTitle>
              <CardDescription>
                Our review team evaluates submissions based on these criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Innovation</h4>
                  <p className="text-sm text-muted-foreground">
                    Unique solutions, creative approaches, or novel implementations
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">User Value</h4>
                  <p className="text-sm text-muted-foreground">
                    Clear value proposition and practical utility for users
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional design, smooth functionality, and attention to detail
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Not Allowed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <XCircle className="h-5 w-5 mr-2" />
                Not Allowed
              </CardTitle>
              <CardDescription>
                These types of submissions will be automatically rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="destructive" className="mb-2">Content Issues</Badge>
                  <ul className="space-y-1 text-sm">
                    <li>• Adult or explicit content</li>
                    <li>• Gambling or betting platforms</li>
                    <li>• Illegal activities or services</li>
                    <li>• Hate speech or discriminatory content</li>
                    <li>• Spam or low-quality content</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Badge variant="destructive" className="mb-2">Technical Issues</Badge>
                  <ul className="space-y-1 text-sm">
                    <li>• Broken or non-functional websites</li>
                    <li>• Under construction pages</li>
                    <li>• Redirect-only domains</li>
                    <li>• Malware or security threats</li>
                    <li>• Copyright infringement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Process */}
          <Card>
            <CardHeader>
              <CardTitle>Review Process</CardTitle>
              <CardDescription>
                Understanding our review timeline and process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Initial Review (0-24 hours)</h4>
                    <p className="text-sm text-muted-foreground">
                      Automated checks for basic requirements and content guidelines
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Manual Review (24-48 hours)</h4>
                    <p className="text-sm text-muted-foreground">
                      Our team evaluates quality, innovation, and user value
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Decision & Notification</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email with the decision and next steps
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> During high-volume periods, reviews may take up to 72 hours. 
                  We appreciate your patience and will notify you as soon as possible.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
