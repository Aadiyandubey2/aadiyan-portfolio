// Register service worker for caching
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              console.log('New content available, please refresh.');
            }
          });
        }
      });
      
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Preload critical assets
export const preloadCriticalAssets = (): void => {
  const criticalFonts = [
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
  ];
  
  criticalFonts.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
};

// Prefetch next likely pages
export const prefetchPages = (paths: string[]): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      paths.forEach((path) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = path;
        document.head.appendChild(link);
      });
    });
  }
};
