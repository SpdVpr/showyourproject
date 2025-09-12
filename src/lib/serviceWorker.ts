/**
 * Service Worker registration and management
 */

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      console.log('Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('New Service Worker installing...');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Service Worker installed, prompting for update...');
              
              // Show update notification to user
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        window.location.reload();
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

export function unregisterServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.unregister();
      console.log('Service Worker unregistered');
    })
    .catch((error) => {
      console.error('Service Worker unregistration failed:', error);
    });
}

/**
 * Check if app is running in standalone mode (PWA)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Prompt user to install PWA
 */
export function promptInstall(): void {
  if (typeof window === 'undefined') return;

  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install button or banner
    showInstallPrompt(deferredPrompt);
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
  });
}

function showInstallPrompt(deferredPrompt: any): void {
  // Create install banner
  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 16px;
    text-align: center;
    z-index: 1000;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
      <span style="font-size: 14px;">📱 Install ShowYourProject.com for faster access!</span>
      <div>
        <button id="install-btn" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          margin-right: 8px;
        ">Install</button>
        <button id="dismiss-btn" style="
          background: transparent;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
        ">×</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  // Handle install button click
  const installBtn = banner.querySelector('#install-btn');
  installBtn?.addEventListener('click', async () => {
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA install outcome:', outcome);
      
      banner.remove();
      deferredPrompt = null;
    } catch (error) {
      console.error('PWA install failed:', error);
    }
  });

  // Handle dismiss button click
  const dismissBtn = banner.querySelector('#dismiss-btn');
  dismissBtn?.addEventListener('click', () => {
    banner.remove();
    
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  });

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (banner.parentNode) {
      banner.remove();
    }
  }, 10000);
}

/**
 * Check if install prompt should be shown
 */
export function shouldShowInstallPrompt(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Don't show if already installed
  if (isStandalone()) return false;
  
  // Don't show if recently dismissed
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed);
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (dismissedTime > weekAgo) return false;
  }
  
  return true;
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;

  // Preload critical CSS
  const criticalCSS = [
    '/_next/static/css/app/layout.css',
    '/_next/static/css/app/page.css',
  ];

  criticalCSS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });

  // Preload critical JS
  const criticalJS = [
    '/_next/static/chunks/webpack.js',
    '/_next/static/chunks/main.js',
  ];

  criticalJS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Initialize performance optimizations
 */
export function initPerformanceOptimizations(): void {
  if (typeof window === 'undefined') return;

  // Register service worker
  registerServiceWorker();

  // Setup PWA install prompt
  if (shouldShowInstallPrompt()) {
    promptInstall();
  }

  // Preload critical resources
  preloadCriticalResources();

  // Add performance observer
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          console.log('Navigation timing:', {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            totalTime: entry.loadEventEnd - entry.fetchStart,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
  }
}
