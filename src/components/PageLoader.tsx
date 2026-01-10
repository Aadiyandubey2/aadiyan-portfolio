import { useState, useEffect, ReactNode, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface PageLoaderProps {
  children: ReactNode;
  minLoadTime?: number;
}

const PageLoader = memo(({ children, minLoadTime = 300 }: PageLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const { theme, isLoading: themeLoading } = useTheme();
  
  useEffect(() => {
    // Wait for fonts and critical resources
    const loadResources = async () => {
      try {
        // Wait for document fonts to be ready
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        
        // Ensure minimum load time for smooth experience
        await new Promise(resolve => setTimeout(resolve, minLoadTime));
        
        setContentReady(true);
      } catch {
        // If something fails, still show content after timeout
        setTimeout(() => setContentReady(true), minLoadTime);
      }
    };

    loadResources();
  }, [minLoadTime]);

  useEffect(() => {
    // Only hide loader when both theme and content are ready
    if (contentReady && !themeLoading) {
      // Small delay to ensure everything is painted
      const timer = setTimeout(() => setIsLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [contentReady, themeLoading]);

  const isWaterTheme = theme === 'water';

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className={`fixed inset-0 z-[100] flex items-center justify-center ${
              isWaterTheme 
                ? 'bg-gradient-to-br from-[hsl(200,30%,98%)] via-[hsl(200,40%,95%)] to-[hsl(199,50%,90%)]' 
                : 'bg-[hsl(222,47%,4%)]'
            }`}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4"
            >
              {/* Animated Logo */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
              >
                <svg width="80" height="80" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="loaderGlass" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                      <feOffset dx="2" dy="3" result="offset" />
                      <feMerge>
                        <feMergeNode in="offset" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <text 
                    x="30" 
                    y="95" 
                    fontFamily="Inter, system-ui" 
                    fontWeight="900" 
                    fontSize="68" 
                    fill={isWaterTheme ? 'hsl(199, 89%, 48%)' : 'hsl(187, 100%, 50%)'}
                    filter="url(#loaderGlass)"
                  >
                    A
                  </text>
                  <text 
                    x="70" 
                    y="95" 
                    fontFamily="Inter, system-ui" 
                    fontWeight="900" 
                    fontSize="68" 
                    fill={isWaterTheme ? 'hsl(199, 89%, 48%)' : 'hsl(187, 100%, 50%)'}
                    filter="url(#loaderGlass)"
                  >
                    D
                  </text>
                </svg>
              </motion.div>

              {/* Loading indicator */}
              <motion.div 
                className={`flex gap-1.5`}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      isWaterTheme 
                        ? 'bg-[hsl(199,89%,48%)]' 
                        : 'bg-[hsl(187,100%,50%)]'
                    }`}
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </>
  );
});

PageLoader.displayName = 'PageLoader';

export default PageLoader;
