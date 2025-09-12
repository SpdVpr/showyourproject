import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectVoting } from "@/components/project/ProjectVoting";
import { ProjectStats } from "@/components/project/ProjectStats";
import { ProjectSocialLinks } from "@/components/project/ProjectSocialLinks";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { ProjectViewTracker } from "@/components/project/ProjectViewTracker";
import { ProjectVisitButton } from "@/components/project/ProjectVisitButton";
import { SocialShareButton } from "@/components/project/SocialShareButton";
import { ReportIssue } from "@/components/project/ReportIssue";
import { ContactProjectOwner } from "@/components/messaging/ContactProjectOwner";
import { serializeProject } from "@/lib/utils/serialization";
import { HtmlContent } from "@/components/ui/html-content";
import { ClickableTag } from "@/components/project/ClickableTag";
import { projectService } from "@/lib/firebaseServices";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, User, Eye, MousePointer } from "lucide-react";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to format dates
function formatDate(timestamp: any) {
  if (!timestamp) return "Unknown";

  // Handle Firestore Timestamp
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }

  // Handle regular Date
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString();
  }

  // Handle string dates
  return new Date(timestamp).toLocaleDateString();
}

// Helper function to parse slug (name-shortId format)
function parseSlug(slug: string) {
  const parts = slug.split('-');
  if (parts.length < 2) return null;

  const shortId = parts[parts.length - 1];
  const name = parts.slice(0, -1).join('-');

  return { name, shortId };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  // Parse slug to get shortId
  const slugData = parseSlug(id);
  let project;
  let relatedProjects = [];

  try {
    if (slugData) {
      // Try to find project by shortId first
      project = await projectService.getProjectByShortId(slugData.shortId);
    }

    if (!project) {
      // Fallback: try to get by full ID (for old URLs)
      project = await projectService.getProject(id);
    }

    // Get related projects in the same category (optimized)
    if (project) {
      try {
        // Use cached new projects and filter by category
        const newProjects = await projectService.getNewProjects();
        relatedProjects = newProjects
          .filter(p => p.category === project.category && p.id !== project.id)
          .slice(0, 3);

        // If not enough related projects, get from featured projects
        if (relatedProjects.length < 3) {
          const featuredProjects = await projectService.getFeaturedProjects();
          const additionalProjects = featuredProjects
            .filter(p => p.category === project.category && p.id !== project.id &&
                    !relatedProjects.some(rp => rp.id === p.id))
            .slice(0, 3 - relatedProjects.length);

          relatedProjects = [...relatedProjects, ...additionalProjects];
        }
      } catch (error) {
        console.error('Error loading related projects:', error);
        relatedProjects = [];
      }
    }
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }

  if (!project) {
    notFound();
  }

  // Convert Firestore Timestamps to plain objects for Client Components
  const serializedProject = {
    ...project,
    createdAt: project.createdAt?.toDate?.() || new Date(project.createdAt || Date.now()),
    approvedAt: project.approvedAt?.toDate?.() || null,
    updatedAt: project.updatedAt?.toDate?.() || null,
    featuredPurchasedAt: project.featuredPurchasedAt?.toDate?.() || null,
    featuredUntil: project.featuredUntil?.toDate?.() || null,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Track page view */}
      <ProjectViewTracker
        projectId={project.id}
        projectName={project.name}
      />

      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                  <p className="text-lg text-muted-foreground mb-3">{project.tagline}</p>

                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Launched {formatDate(project.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      By {project.submitterName}
                    </span>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary">{project.category}</Badge>
                    {project.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Gallery */}
          <ProjectGallery
            mainImage={project.screenshotUrl || '/placeholder-screenshot.png'}
            galleryImages={project.galleryUrls || []}
            projectName={project.name}
          />

          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle>About {project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <HtmlContent
                  content={project.description}
                  className="text-muted-foreground leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {project.tags.map((tag, index) => (
                  <ClickableTag
                    key={tag}
                    tag={tag}
                    index={index}
                    size="lg"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Primary Actions Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
              {/* Visit Website - Primary Action */}
              <div>
                <ProjectVisitButton
                  projectId={project.id}
                  projectName={project.name}
                  websiteUrl={project.websiteUrl}
                  className="w-full"
                  size="lg"
                />
              </div>

              {/* Vote for Project */}
              <div className="flex items-center justify-center pt-2">
                <ProjectVoting project={serializedProject} />
              </div>
            </CardContent>
          </Card>

          {/* Contact Project Owner */}
          <Card>
            <CardContent className="p-4">
              <ContactProjectOwner project={serializedProject} />
            </CardContent>
          </Card>

          {/* Project Stats */}
          <ProjectStats project={serializedProject} />

          {/* Social Links */}
          <ProjectSocialLinks project={serializedProject} />

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Team Size</span>
                </div>
                <span className="text-sm font-medium">
                  {project.teamSize === '1' ? '1 person (Solo)' :
                   project.teamSize === '2' ? '2 people' :
                   project.teamSize === '3-5' ? '3-5 people' :
                   project.teamSize === '5-10' ? '5-10 people' :
                   project.teamSize === '10+' ? '10+ people' : project.teamSize}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Founded</span>
                </div>
                <span className="text-sm font-medium">{project.foundedYear}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SocialShareButton
                projectId={project.id}
                projectName={project.name}
                projectUrl={`${process.env.NODE_ENV === 'production' ? 'https://showyourproject.com' : 'http://localhost:3001'}/project/${project.shortId ? projectService.generateSlug(project.name, project.shortId) : project.id}`}
                projectDescription={project.description}
              />

              <ReportIssue
                project={serializeProject(project)}
              />
            </CardContent>
          </Card>

          {/* Related Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Related Projects</CardTitle>
              <CardDescription>
                Other projects in {project.category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatedProjects.length > 0 ? relatedProjects.map((relatedProject) => {
                  const relatedProjectUrl = relatedProject.shortId
                    ? `/project/${projectService.generateSlug(relatedProject.name, relatedProject.shortId)}`
                    : `/project/${relatedProject.id}`;

                  return (
                    <Link
                      key={relatedProject.id}
                      href={relatedProjectUrl}
                      className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Image
                          src={relatedProject.logoUrl || '/placeholder-logo.png'}
                          alt={`${relatedProject.name} logo`}
                          width={32}
                          height={32}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {relatedProject.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {relatedProject.tagline}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                }) : (
                    <p className="text-muted-foreground text-sm">No related projects found.</p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO (cached)
export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params;

  // Parse slug to get shortId
  const slugData = parseSlug(id);
  let project;

  try {
    if (slugData) {
      // Try to find project by shortId first (now cached)
      project = await projectService.getProjectByShortId(slugData.shortId);
    }

    if (!project) {
      // Fallback: try to get by full ID (now cached)
      project = await projectService.getProject(id);
    }
  } catch (error) {
    console.error('Error loading project for metadata:', error);
  }

  if (!project) {
    return {
      title: 'Project Not Found - ShowYourProject.com',
      description: 'The requested project could not be found.',
    };
  }

  return {
    title: `${project.name} - ${project.tagline} | ShowYourProject.com`,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.tagline,
      images: [project.screenshotUrl || '/placeholder-screenshot.png'],
    },
  };
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    // Get approved projects from Firebase
    const projects = await projectService.getProjects(50);
    return projects.map((project) => {
      // Generate SEO-friendly slug if shortId exists
      if (project.shortId) {
        return {
          id: projectService.generateSlug(project.name, project.shortId),
        };
      }
      // Fallback to regular ID for old projects
      return {
        id: project.id,
      };
    });
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array if Firebase fails
    return [];
  }
}
