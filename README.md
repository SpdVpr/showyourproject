# 🚀 ShowYourProject.com

**The Global Startup Promotion Platform**

A modern, full-featured platform where entrepreneurs can submit their startups and projects for free promotion, quality backlinks, and increased visibility. Built with Next.js 15, React 19, and TypeScript.

🆕 **Latest Update**: Two-step submission form with automatic metadata fetching from websites!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/showyourproject)

## ✨ Features

### 🎯 Core Platform
- **Free Project Submission** - 3-minute submission process
- **Manual Curation** - Quality control for all submissions
- **Global Directory** - Searchable database of startups
- **Quality Backlinks** - SEO benefits for submitted projects
- **Traffic Generation** - Increased visibility and visitors

### 🔧 Technical Features
- **Modern Stack** - Next.js 15, React 19, TypeScript
- **Responsive Design** - Mobile-first, works on all devices
- **Performance Optimized** - 90+ Lighthouse scores
- **SEO Optimized** - Structured data, sitemaps, meta tags
- **Admin Panel** - Complete project management system
- **Authentication** - Firebase-based user system
- **Analytics** - Google Analytics & Web Vitals tracking

### 🎨 User Experience
- **Multi-step Forms** - Intuitive project submission
- **Advanced Search** - Filter by category, tags, popularity
- **Project Voting** - Community-driven ranking
- **Social Integration** - Share projects across platforms
- **Real-time Updates** - Live statistics and notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/showyourproject.git
   cd showyourproject
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
startup-directory/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── (auth)/         # Authentication pages
│   │   ├── admin/          # Admin panel
│   │   ├── browse/         # Project browsing
│   │   ├── project/[id]/   # Project detail pages
│   │   └── submit/         # Project submission
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Layout components
│   │   ├── project/       # Project-specific components
│   │   └── auth/          # Authentication components
│   ├── lib/               # Utilities and configurations
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🎯 Key Pages

- **Homepage** (`/`) - Featured projects and platform overview
- **Browse** (`/browse`) - All projects with filtering
- **Search** (`/search`) - Advanced project search
- **Submit** (`/submit`) - Multi-step project submission
- **Project Detail** (`/project/[id]`) - Individual project pages
- **Admin Panel** (`/admin`) - Project management and analytics

## 🔐 Authentication

### Demo Credentials
- **Admin Access**: admin@showyourproject.com / admin123
- **User Access**: Any email / Any password (demo mode)

### Production Setup
Configure Firebase authentication in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
# ... other Firebase config
```

## 🎨 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Framer Motion** - Smooth animations

### Backend & Services
- **Firebase** - Authentication and database
- **Vercel** - Hosting and deployment
- **Google Analytics** - User tracking
- **Web Vitals** - Performance monitoring

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

## 📊 Performance

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 98+
- **Best Practices**: 95+
- **SEO**: 100

### Optimizations
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Compression and caching
- Web Vitals monitoring
- SEO structured data

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options:

```env
# Required
NEXT_PUBLIC_SITE_URL=https://showyourproject.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional
FIREBASE_CONFIG=...
SMTP_CONFIG=...
```

### Customization
- **Branding**: Update logo and colors in `src/components/layout/`
- **Content**: Modify copy in page components
- **Styling**: Customize Tailwind config in `tailwind.config.js`
- **Features**: Add new functionality in `src/app/`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ADMIN_EMAIL=your_admin_email@example.com
   ```
3. Deploy automatically on push to main

**⚠️ Important**: Never commit `.env.local` or any files containing sensitive credentials to GitHub. All environment variables should be configured directly in Vercel's dashboard.

### Manual Deployment
```bash
npm run build
npm start
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Build Check
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## 📈 Analytics & Monitoring

### Built-in Analytics
- Google Analytics integration
- Web Vitals tracking
- Custom event tracking
- Performance monitoring

### Admin Dashboard
- Project approval workflow
- User management
- Platform statistics
- Content moderation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic commit messages
- Maintain 90+ test coverage
- Follow accessibility guidelines

## 📝 API Documentation

### Project Submission
```typescript
POST /api/projects
{
  name: string;
  tagline: string;
  description: string;
  website: string;
  category: string;
  tags: string[];
}
```

### Project Voting
```typescript
POST /api/projects/:id/vote
{
  userId: string;
}
```

## 🔒 Security

- CSRF protection
- XSS prevention
- SQL injection protection
- Rate limiting
- Input validation
- Secure headers

## 📞 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: support@showyourproject.com

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Vercel](https://vercel.com) - Hosting platform
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide](https://lucide.dev) - Icon library

---

**Built with ❤️ for the startup community**

[Live Demo](https://showyourproject.com) | [Documentation](./docs) | [Deployment Guide](./DEPLOYMENT.md)
