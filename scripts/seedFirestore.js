const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDZhPtcwi3SPcV-53CURM3XSATRsTL1BKc",
  authDomain: "showyourproject-com.firebaseapp.com",
  projectId: "showyourproject-com",
  storageBucket: "showyourproject-com.firebasestorage.app",
  messagingSenderId: "852681799745",
  appId: "1:852681799745:web:389ae59e436a6e5e2e2ec0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample projects data
const sampleProjects = [
  {
    name: "TaskFlow Pro",
    tagline: "Streamline your workflow with intelligent task management",
    description: "TaskFlow Pro is a comprehensive project management tool that helps teams collaborate efficiently. With AI-powered task prioritization, real-time collaboration features, and intuitive dashboards, it's perfect for modern teams.",
    websiteUrl: "https://taskflow-pro.com",
    category: "Productivity",
    tags: ["productivity", "project-management", "collaboration", "AI"],
    submitterId: "demo-user-1",
    submitterEmail: "demo@taskflow.com",
    submitterName: "Sarah Johnson",
    status: "approved",
    voteCount: 42,
    viewCount: 1250,
    clickCount: 89,
    featured: true,
    createdAt: new Date("2024-01-15"),
    submittedAt: new Date("2024-01-15"),
    approvedAt: new Date("2024-01-16"),
    screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop",
    socialLinks: {
      twitter: "https://twitter.com/taskflowpro",
      github: "https://github.com/taskflow/pro"
    }
  },
  {
    name: "CodeSnap",
    tagline: "Beautiful code screenshots for developers",
    description: "Create stunning code screenshots with syntax highlighting, custom themes, and social media optimization. Perfect for sharing code snippets on Twitter, LinkedIn, and blogs.",
    websiteUrl: "https://codesnap.dev",
    category: "Developer Tools",
    tags: ["developer-tools", "code", "screenshots", "social-media"],
    submitterId: "demo-user-2",
    submitterEmail: "hello@codesnap.dev",
    submitterName: "Alex Chen",
    status: "approved",
    voteCount: 38,
    viewCount: 980,
    clickCount: 67,
    featured: true,
    createdAt: new Date("2024-01-20"),
    submittedAt: new Date("2024-01-20"),
    approvedAt: new Date("2024-01-21"),
    screenshot: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop",
    socialLinks: {
      twitter: "https://twitter.com/codesnapdev",
      github: "https://github.com/codesnap/app"
    }
  },
  {
    name: "MindMap Studio",
    tagline: "Visual thinking made simple",
    description: "Create beautiful mind maps, flowcharts, and diagrams with our intuitive drag-and-drop interface. Collaborate in real-time with your team and export to multiple formats.",
    websiteUrl: "https://mindmapstudio.io",
    category: "Design",
    tags: ["design", "mindmaps", "collaboration", "visualization"],
    submitterId: "demo-user-3",
    submitterEmail: "team@mindmapstudio.io",
    submitterName: "Maria Rodriguez",
    status: "approved",
    voteCount: 29,
    viewCount: 756,
    clickCount: 45,
    featured: false,
    createdAt: new Date("2024-01-25"),
    submittedAt: new Date("2024-01-25"),
    approvedAt: new Date("2024-01-26"),
    screenshot: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=100&h=100&fit=crop",
    socialLinks: {
      twitter: "https://twitter.com/mindmapstudio"
    }
  },
  {
    name: "EcoTracker",
    tagline: "Track your environmental impact",
    description: "Monitor your carbon footprint, set sustainability goals, and discover eco-friendly alternatives. Join a community of environmentally conscious individuals making a difference.",
    websiteUrl: "https://ecotracker.green",
    category: "Lifestyle",
    tags: ["environment", "sustainability", "tracking", "community"],
    submitterId: "demo-user-4",
    submitterEmail: "info@ecotracker.green",
    submitterName: "David Kim",
    status: "approved",
    voteCount: 35,
    viewCount: 892,
    clickCount: 58,
    featured: true,
    createdAt: new Date("2024-02-01"),
    submittedAt: new Date("2024-02-01"),
    approvedAt: new Date("2024-02-02"),
    screenshot: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop",
    socialLinks: {
      twitter: "https://twitter.com/ecotracker",
      instagram: "https://instagram.com/ecotracker"
    }
  },
  {
    name: "CryptoPortfolio",
    tagline: "Professional cryptocurrency portfolio management",
    description: "Track your crypto investments across multiple exchanges, analyze performance with advanced charts, and get real-time market insights. Built for serious crypto investors.",
    websiteUrl: "https://cryptoportfolio.pro",
    category: "Finance",
    tags: ["cryptocurrency", "portfolio", "finance", "tracking"],
    submitterId: "demo-user-5",
    submitterEmail: "support@cryptoportfolio.pro",
    submitterName: "Jennifer Walsh",
    status: "approved",
    voteCount: 51,
    viewCount: 1456,
    clickCount: 102,
    featured: true,
    createdAt: new Date("2024-02-05"),
    submittedAt: new Date("2024-02-05"),
    approvedAt: new Date("2024-02-06"),
    screenshot: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop",
    socialLinks: {
      twitter: "https://twitter.com/cryptoportfolio",
      linkedin: "https://linkedin.com/company/cryptoportfolio"
    }
  },
  {
    name: "StudyBuddy AI",
    tagline: "Your AI-powered study companion",
    description: "Enhance your learning with AI-generated flashcards, personalized study plans, and intelligent progress tracking. Perfect for students and lifelong learners.",
    websiteUrl: "https://studybuddy.ai",
    category: "Education",
    tags: ["education", "AI", "studying", "flashcards"],
    submitterId: "demo-user-6",
    submitterEmail: "hello@studybuddy.ai",
    submitterName: "Michael Brown",
    status: "approved",
    voteCount: 27,
    viewCount: 634,
    clickCount: 41,
    featured: false,
    createdAt: new Date("2024-02-10"),
    submittedAt: new Date("2024-02-10"),
    approvedAt: new Date("2024-02-11"),
    screenshot: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
    logo: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=100&fit=crop",
    socialLinks: {
      twitter: "https://twitter.com/studybuddyai"
    }
  }
];

// Sample categories
const sampleCategories = [
  { name: "Productivity", description: "Tools to boost your productivity", icon: "⚡", color: "#3B82F6" },
  { name: "Developer Tools", description: "Essential tools for developers", icon: "💻", color: "#10B981" },
  { name: "Design", description: "Creative design tools and resources", icon: "🎨", color: "#F59E0B" },
  { name: "Marketing", description: "Marketing and growth tools", icon: "📈", color: "#EF4444" },
  { name: "Finance", description: "Financial management tools", icon: "💰", color: "#8B5CF6" },
  { name: "Education", description: "Learning and educational resources", icon: "📚", color: "#06B6D4" },
  { name: "Health", description: "Health and wellness applications", icon: "🏥", color: "#84CC16" },
  { name: "Lifestyle", description: "Apps for everyday life", icon: "🌟", color: "#F97316" }
];

async function seedFirestore() {
  try {
    console.log('🌱 Starting Firestore seeding...');

    // Add categories
    console.log('📁 Adding categories...');
    for (const category of sampleCategories) {
      await addDoc(collection(db, 'categories'), category);
      console.log(`✅ Added category: ${category.name}`);
    }

    // Add projects
    console.log('🚀 Adding projects...');
    for (const project of sampleProjects) {
      await addDoc(collection(db, 'projects'), project);
      console.log(`✅ Added project: ${project.name}`);
    }

    console.log('🎉 Firestore seeding completed successfully!');
    console.log(`📊 Added ${sampleCategories.length} categories and ${sampleProjects.length} projects`);
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
  }
}

// Run the seeding
seedFirestore();
