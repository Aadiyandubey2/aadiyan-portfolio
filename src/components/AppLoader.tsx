import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface AppLoaderProps {
  children: React.ReactNode;
  minLoadTime?: number;
}

// Preload critical fonts
const preloadFonts = async (): Promise<void> => {
  try {
    await document.fonts.ready;
    // Give fonts a moment to render properly
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch {
    // Fonts API not supported, continue anyway
  }
};

// Check if critical images are loaded
const preloadImages = (): Promise<void[]> => {
  const criticalImages = document.querySelectorAll('img[src]');
  const promises: Promise<void>[] = [];
  
  criticalImages.forEach((img) => {
    if (!(img as HTMLImageElement).complete) {
      promises.push(
        new Promise((resolve) => {
          (img as HTMLImageElement).onload = () => resolve();
          (img as HTMLImageElement).onerror = () => resolve();
        })
      );
    }
  });
  
  return Promise.all(promises);
};

const AppLoader = memo(({ children, minLoadTime = 600 }: AppLoaderProps) => {
  const [isReady, setIsReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const { isLoading: themeLoading } = useTheme();

  const initializeApp = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      // Wait for theme to load
      if (themeLoading) return;
      
      // Preload fonts and wait for layout
      await preloadFonts();
      
      // Wait for any critical images
      await preloadImages();
      
      // Ensure minimum load time for smooth experience
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadTime - elapsed);
      
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
      
      // Mark as ready
      setIsReady(true);
      
      // Small delay before hiding loader for smooth transition
      setTimeout(() => setShowLoader(false), 200);
    } catch (error) {
      console.error('Error during app initialization:', error);
      setIsReady(true);
      setShowLoader(false);
    }
  }, [themeLoading, minLoadTime]);

  useEffect(() => {
    if (!themeLoading) {
      initializeApp();
    }
  }, [themeLoading, initializeApp]);

  // Cache the ready state in sessionStorage for faster subsequent loads
  useEffect(() => {
    if (isReady) {
      sessionStorage.setItem('app-initialized', 'true');
    }
  }, [isReady]);

  // Check for cached ready state on mount
  useEffect(() => {
    const wasInitialized = sessionStorage.getItem('app-initialized');
    if (wasInitialized === 'true' && !themeLoading) {
      setIsReady(true);
      setShowLoader(false);
    }
  }, [themeLoading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoader && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Animated logo/spinner */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-2 border-primary/20"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 rounded-full border border-secondary/30"
                />
              </motion.div>
              
              {/* Loading text */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-sm font-mono text-muted-foreground"
              >
                Loading...
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content with fade-in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={isReady ? '' : 'invisible'}
      >
        {children}
      </motion.div>
    </>
  );
});

AppLoader.displayName = 'AppLoader';

export default AppLoader;
