"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackWebVitals, pageview } from '@/lib/analytics';

export function WebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views
    pageview(pathname);
    
    // Track web vitals
    trackWebVitals();
  }, [pathname]);

  return null;
}
