"use client";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface ClickableTagProps {
  tag: string;
  index?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ClickableTag({ tag, index = 0, className = "", size = "md" }: ClickableTagProps) {
  const router = useRouter();

  const handleTagClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to search page with tag filter
    const searchParams = new URLSearchParams();
    searchParams.set('tags', tag);
    router.push(`/search?${searchParams.toString()}`);
  };

  const getColorClass = (index: number) => {
    const colors = [
      'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
      'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
    ];
    return colors[index % colors.length];
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-1";
      case "lg":
        return "text-sm px-4 py-2";
      default:
        return "text-xs px-3 py-1";
    }
  };

  return (
    <Badge
      variant="outline"
      onClick={handleTagClick}
      className={`
        ${getSizeClass(size)} rounded-full font-medium transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer border-2
        ${getColorClass(index)}
        ${className}
      `}
    >
      {tag}
    </Badge>
  );
}
