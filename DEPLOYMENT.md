# ShowYourProject.com - Deployment Guide

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/showyourproject)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account (recommended)
- Firebase project (for production auth)
- Google Analytics account (optional)

## 🔧 Environment Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required variables:**
   - `NEXT_PUBLIC_SITE_URL`: Your domain (e.g., https://showyourproject.com)
   - `NEXT_PUBLIC_GA_ID`: Google Analytics tracking ID
   - Firebase configuration (if using real auth)

## 🏗️ Build & Deploy

### Option 1: Vercel (Recommended)

1. **Connect to Vercel:**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add all variables from `.env.example`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Manual Build

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

## 🔐 Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure Firebase security rules
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Configure CSP headers
- [ ] Set up monitoring (Sentry)

## 📊 Performance Optimization

- [ ] Enable Vercel Analytics
- [ ] Set up Google Analytics
- [ ] Configure image optimization
- [ ] Enable compression
- [ ] Set up CDN for static assets

## 🧪 Testing

1. **Run tests:**
   ```bash
   npm test
   ```

2. **Check build:**
   ```bash
   npm run build
   ```

3. **Lighthouse audit:**
   - Performance: 90+
   - Accessibility: 95+
   - Best Practices: 95+
   - SEO: 95+

## 🌐 Domain Setup

1. **Add custom domain in Vercel:**
   - Go to project settings
   - Add your domain
   - Configure DNS records

2. **SSL Certificate:**
   - Automatically handled by Vercel
   - Verify HTTPS is working

## 📈 Monitoring

1. **Set up error tracking:**
   - Configure Sentry DSN
   - Test error reporting

2. **Performance monitoring:**
   - Enable Vercel Analytics
   - Set up Google Analytics
   - Monitor Web Vitals

## 🔄 CI/CD Pipeline

The project includes automatic deployment on:
- Push to `main` branch
- Pull request previews
- Automatic builds on Vercel

## 🐛 Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check Node.js version (18+)
   - Clear `.next` folder
   - Run `npm install` again

2. **Environment variables not working:**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side
   - Restart development server
   - Check Vercel dashboard settings

3. **Images not loading:**
   - Verify `next.config.ts` image domains
   - Check image URLs are accessible
   - Ensure proper image optimization

## 📞 Support

For deployment issues:
1. Check the [Next.js deployment docs](https://nextjs.org/docs/deployment)
2. Review [Vercel documentation](https://vercel.com/docs)
3. Open an issue in the repository

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Custom domain set up
- [ ] SSL certificate active
- [ ] Analytics tracking working
- [ ] Error monitoring enabled
- [ ] Performance optimized
- [ ] SEO metadata complete
- [ ] Social media previews working
- [ ] Admin panel accessible
- [ ] Form submissions working
- [ ] Image optimization enabled
- [ ] Security headers configured

## 📝 Post-Deployment

1. **Test all functionality:**
   - User registration/login
   - Project submission
   - Admin panel access
   - Search functionality
   - Mobile responsiveness

2. **Submit to search engines:**
   - Google Search Console
   - Bing Webmaster Tools
   - Submit sitemap.xml

3. **Monitor performance:**
   - Check Web Vitals
   - Monitor error rates
   - Track user engagement

---

**🎉 Your ShowYourProject.com platform is now live!**
