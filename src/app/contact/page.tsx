import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Clock, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Send us a Message</span>
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Get in Touch</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-muted-foreground">admin@showyourproject.com</p>
                    <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Response Time</h4>
                    <p className="text-muted-foreground">Within 24 hours</p>
                    <p className="text-sm text-muted-foreground">Monday - Friday, 9 AM - 6 PM UTC</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How long does project review take?</h4>
                  <p className="text-sm text-muted-foreground">
                    Most projects are reviewed within 2-3 business days. Complex submissions may take up to a week.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Is submission really free?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Basic project submission is completely free. We also offer optional featured placement for enhanced visibility.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Can I edit my project after submission?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can edit your project details through your dashboard after it's been approved.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong>All Inquiries:</strong> admin@showyourproject.com
                </p>
                <p className="text-sm text-muted-foreground">
                  For general questions, technical support, partnerships, press inquiries, and all other matters, please use our main support email address.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Getting Started?</h2>
          <p className="text-muted-foreground mb-6">
            Check out our submission guidelines or browse existing projects for inspiration.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <a href="/guidelines">Submission Guidelines</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/categories">Browse Projects</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
