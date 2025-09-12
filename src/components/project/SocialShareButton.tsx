"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy, Check } from "lucide-react";

interface SocialShareButtonProps {
  projectId: string;
  projectName: string;
  projectUrl: string;
  projectDescription?: string;
  compact?: boolean;
}

export function SocialShareButton({ 
  projectId, 
  projectName, 
  projectUrl, 
  projectDescription = "",
  compact = false
}: SocialShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Check out this amazing project: ${projectName}`;

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(projectUrl)}&text=${encodeURIComponent(shareText)}&hashtags=startup,innovation,tech,showyourproject`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${projectUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(projectUrl)}&text=${encodeURIComponent(shareText)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(projectUrl)}&title=${encodeURIComponent(shareText)}`,
  };

  const handleSocialShare = (platform: keyof typeof shareUrls) => {
    const url = shareUrls[platform];
    
    // Open in a popup window for better UX
    const popup = window.open(
      url,
      `share-${platform}`,
      'width=600,height=400,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no'
    );

    // Focus the popup window
    if (popup) {
      popup.focus();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = projectUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-3 rounded-full font-medium bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
            Share on Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
            <Twitter className="h-4 w-4 mr-2 text-blue-400" />
            Share on Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
            <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
            Share on LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
            Share on WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('telegram')}>
            <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
            Share on Telegram
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('reddit')}>
            <MessageCircle className="h-4 w-4 mr-2 text-orange-600" />
            Share on Reddit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Link Copied!" : "Copy Link"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          <Share2 className="h-4 w-4 mr-2" />
          Share on Social Media
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('telegram')}>
          <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
          Share on Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('reddit')}>
          <MessageCircle className="h-4 w-4 mr-2 text-orange-600" />
          Share on Reddit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          {copied ? "Link Copied!" : "Copy Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
