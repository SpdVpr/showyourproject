import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/types";
import { 
  Globe, 
  Smartphone, 
  Brain, 
  Code, 
  ShoppingCart, 
  Zap, 
  Palette, 
  DollarSign,
  LucideIcon
} from "lucide-react";

interface CategoryCardProps {
  category: Category;
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  Brain,
  Code,
  ShoppingCart,
  Zap,
  Palette,
  DollarSign,
};

// Color mapping for Tailwind classes
const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'group-hover:bg-blue-200' },
  green: { bg: 'bg-green-100', text: 'text-green-600', hover: 'group-hover:bg-green-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'group-hover:bg-purple-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', hover: 'group-hover:bg-orange-200' },
  red: { bg: 'bg-red-100', text: 'text-red-600', hover: 'group-hover:bg-red-200' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', hover: 'group-hover:bg-yellow-200' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600', hover: 'group-hover:bg-pink-200' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', hover: 'group-hover:bg-emerald-200' },
};

export function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon] || Globe;
  const colors = colorMap[category.color] || colorMap.blue;

  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
        <CardContent className="p-0 flex flex-col items-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-xl ${colors.bg} ${colors.hover} flex items-center justify-center transition-colors duration-300`}>
            <IconComponent className={`h-8 w-8 ${colors.text}`} />
          </div>
          
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {category.description}
          </p>
          
          <div className="text-xs text-muted-foreground font-medium">
            {category.projectCount} projects
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
