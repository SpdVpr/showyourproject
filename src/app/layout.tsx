import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { StructuredData } from "@/components/seo/StructuredData";
import { WebVitals } from "@/components/analytics/WebVitals";
import { PerformanceOptimizer } from "@/components/performance/PerformanceOptimizer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://showyourproject.com' : `http://localhost:${process.env.PORT || 3000}`),
  title: "ShowYourProject.com - Get Free Website Traffic & Quality Backlinks",
  description: "Submit your website for free promotion on ShowYourProject.com. Get discovered by thousands of visitors and earn valuable backlinks to boost your SEO.",
  keywords: [
    "startup promotion",
    "free backlinks",
    "startup directory",
    "project showcase",
    "entrepreneur platform",
    "startup marketing",
    "business promotion",
    "startup community",
    "product launch",
    "startup visibility",
    "website traffic",
    "SEO backlinks"
  ],
  authors: [{ name: "ShowYourProject Team" }],
  creator: "ShowYourProject",
  publisher: "ShowYourProject",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://showyourproject.com',
    siteName: 'ShowYourProject.com',
    title: 'ShowYourProject.com - Get Free Website Traffic & Quality Backlinks',
    description: 'Submit your website for free promotion on ShowYourProject.com. Get discovered by thousands of visitors and earn valuable backlinks to boost your SEO.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ShowYourProject.com - Global Startup Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShowYourProject.com - Get Free Website Traffic & Quality Backlinks',
    description: 'Submit your website for free promotion on ShowYourProject.com. Get discovered by thousands of visitors and earn valuable backlinks.',
    images: ['/og-image.jpg'],
    creator: '@showyourproject',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://showyourproject.com',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://firebaseinstallations.googleapis.com" />
        <link rel="preconnect" href="https://showyourproject-com.firebaseapp.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* DNS prefetch for additional domains */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Preload critical assets */}
        <link rel="preload" href="/syp-logo.png" as="image" type="image/png" />

        {/* Preload critical CSS */}
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />

        {/* Resource hints for better performance */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <StructuredData type="website" />
        <StructuredData type="organization" />
        <WebVitals />
        <PerformanceOptimizer />
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
