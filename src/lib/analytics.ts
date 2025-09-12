// Analytics and performance monitoring utilities

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Custom events for our platform
export const trackProjectView = (projectId: string, projectName: string) => {
  event({
    action: 'view_project',
    category: 'engagement',
    label: `${projectId}:${projectName}`,
  });
};

export const trackProjectVote = (projectId: string, projectName: string) => {
  event({
    action: 'vote_project',
    category: 'engagement',
    label: `${projectId}:${projectName}`,
  });
};

export const trackProjectVisit = (projectId: string, projectName: string) => {
  event({
    action: 'visit_project',
    category: 'conversion',
    label: `${projectId}:${projectName}`,
  });
};

export const trackSubmission = (step: string) => {
  event({
    action: 'submission_step',
    category: 'conversion',
    label: step,
  });
};

export const trackSearch = (query: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'engagement',
    label: query,
    value: resultsCount,
  });
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    // Log performance metrics
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    // Track slow operations
    if (duration > 1000) {
      event({
        action: 'slow_operation',
        category: 'performance',
        label: name,
        value: Math.round(duration),
      });
    }
  } else {
    fn();
  }
};

// Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window !== 'undefined') {
    import('web-vitals').then((webVitals) => {
      // Check if the functions exist before calling them
      if (webVitals.onCLS) {
        webVitals.onCLS((metric) => {
          event({
            action: 'web_vitals',
            category: 'performance',
            label: 'CLS',
            value: Math.round(metric.value * 1000),
          });
        });
      }

      if (webVitals.onFID) {
        webVitals.onFID((metric) => {
          event({
            action: 'web_vitals',
            category: 'performance',
            label: 'FID',
            value: Math.round(metric.value),
          });
        });
      }

      if (webVitals.onFCP) {
        webVitals.onFCP((metric) => {
          event({
            action: 'web_vitals',
            category: 'performance',
            label: 'FCP',
            value: Math.round(metric.value),
          });
        });
      }

      if (webVitals.onLCP) {
        webVitals.onLCP((metric) => {
          event({
            action: 'web_vitals',
            category: 'performance',
            label: 'LCP',
            value: Math.round(metric.value),
          });
        });
      }

      if (webVitals.onTTFB) {
        webVitals.onTTFB((metric) => {
          event({
            action: 'web_vitals',
            category: 'performance',
            label: 'TTFB',
            value: Math.round(metric.value),
          });
        });
      }
    }).catch((error) => {
      console.warn('Failed to load web-vitals:', error);
    });
  }
};

// Error tracking
export const trackError = (error: Error, context?: string) => {
  console.error('Tracked error:', error, context);
  
  event({
    action: 'error',
    category: 'error',
    label: `${context || 'unknown'}: ${error.message}`,
  });
};

// User engagement tracking
export const trackUserEngagement = (action: string, details?: any) => {
  event({
    action: action,
    category: 'user_engagement',
    label: details ? JSON.stringify(details) : undefined,
  });
};
