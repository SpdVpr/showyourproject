import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Users, Zap, Heart, Target, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About ShowYourProject.com</h1>
          <p className="text-xl text-muted-foreground mb-6">
            The premier platform for discovering and promoting innovative websites and startups
          </p>
          <Badge variant="secondary" className="text-sm">
            Connecting entrepreneurs worldwide since 2025
          </Badge>
        </div>

        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-blue-600" />
              <span>Our Mission</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              ShowYourProject.com exists to bridge the gap between innovative creators and their potential audience. 
              We believe every great project deserves visibility, and every entrepreneur deserves a chance to shine. 
              Our platform provides free promotion, quality backlinks, and genuine traffic to help startups and 
              projects reach their full potential.
            </p>
          </CardContent>
        </Card>

        {/* What We Offer */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span>Free Promotion</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Submit your project for free and get discovered by thousands of visitors. 
                No hidden fees, no premium requirements - just genuine exposure for your work.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Quality Backlinks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Boost your SEO with high-quality backlinks from our platform. 
                Every approved project gets a permanent link that helps improve search rankings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Community Driven</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Join a community of entrepreneurs, developers, and innovators. 
                Connect with like-minded individuals and discover amazing projects.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                <span>Innovation Focus</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We curate and showcase the most innovative projects across various categories, 
                from AI and tech to creative and social impact initiatives.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How ShowYourProject.com Works</CardTitle>
            <CardDescription>Simple steps to get your project featured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Submit Your Project</h3>
                <p className="text-sm text-muted-foreground">
                  Fill out our simple submission form with your project details, screenshots, and description.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Review Process</h3>
                <p className="text-sm text-muted-foreground">
                  Our team reviews your submission to ensure quality and compliance with our guidelines.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Get Featured</h3>
                <p className="text-sm text-muted-foreground">
                  Once approved, your project goes live and starts receiving traffic and backlinks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-red-600" />
              <span>Our Values</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Transparency</h4>
                <p className="text-sm text-muted-foreground">
                  Clear guidelines, honest reviews, and transparent processes for all users.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Quality</h4>
                <p className="text-sm text-muted-foreground">
                  We maintain high standards to ensure only the best projects are featured.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Community</h4>
                <p className="text-sm text-muted-foreground">
                  Building connections and fostering collaboration among entrepreneurs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Innovation</h4>
                <p className="text-sm text-muted-foreground">
                  Celebrating creativity and supporting groundbreaking ideas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Show Your Project?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of entrepreneurs who have already showcased their projects on our platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Link href="/submit">Submit Your Project</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/categories">Browse Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
