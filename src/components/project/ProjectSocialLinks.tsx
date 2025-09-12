import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Linkedin, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/types";

interface ProjectSocialLinksProps {
  project: Project;
}

export function ProjectSocialLinks({ project }: ProjectSocialLinksProps) {
  const socialLinks = [
    {
      name: "Twitter",
      url: project.socialLinks?.twitter,
      icon: Twitter,
      color: "text-blue-500 hover:text-blue-600",
      bgColor: "hover:bg-blue-50",
    },
    {
      name: "GitHub",
      url: project.socialLinks?.github,
      icon: Github,
      color: "text-gray-700 hover:text-gray-900",
      bgColor: "hover:bg-gray-50",
    },
    {
      name: "Product Hunt",
      url: project.socialLinks?.producthunt,
      icon: ExternalLink,
      color: "text-orange-500 hover:text-orange-600",
      bgColor: "hover:bg-orange-50",
    },
  ].filter(link => link.url); // Only show links that exist

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Button
              key={link.name}
              variant="ghost"
              className={`w-full justify-start ${link.color} ${link.bgColor}`}
              asChild
            >
              <Link href={link.url!} target="_blank" rel="noopener noreferrer">
                <Icon className="h-4 w-4 mr-3" />
                {link.name}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
