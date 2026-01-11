import { useState, useEffect, ReactNode, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnimation } from "@/contexts/AnimationContext";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = memo(({ children }: PageWrapperProps) => {
  const { theme, isLoading: themeLoading } = useTheme();
  const { duration, enabled, isMobile, isLowEnd } = useAnimation();

  const [isReady, setIsReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const isWaterTheme = theme === "water";

  // Minimum load time based on device
  const minLoadTime = isLowEnd ? 150 : isMobile ? 300 : 400;

  const checkReadiness = useCallback(async () => {
    try {
      // Wait for fonts
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // Wait for all images in the viewport to load
      const images = document.querySelectorAll('img');
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      await Promise.race([
        Promise.all(imagePromises),
        new Promise((resolve) => setTimeout(resolve, 2500)), // Max wait 2.5s for images
      ]);

      // Minimum loader time for polish
      await new Promise((r) => setTimeout(r, minLoadTime));
    } catch {
      await new Promise((r) => setTimeout(r, minLoadTime));
    }

    // First hide loader, then show content
    setIsReady(true);
  }, [minLoadTime]);

  useEffect(() => {
    if (!themeLoading) {
      checkReadiness();
    }
  }, [themeLoading, checkReadiness]);

  // When ready, wait for loader fade-out before showing content
  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, enabled ? 300 : 0); // Wait for loader fade-out animation
      return () => clearTimeout(timer);
    }
  }, [isReady, enabled]);

  // Skip loader animation on low-end devices with reduced motion
  if (!enabled && isLowEnd) {
    return (
      <main style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}>
        {children}
      </main>
    );
  }

  return (
    <>
      {/* Loader overlay - always on top, fades out when ready */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isReady ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ 
          pointerEvents: isReady ? "none" : "auto",
          display: showContent ? "none" : "flex"
        }}
        className={`fixed inset-0 z-[9999] items-center justify-center
          ${isWaterTheme
            ? "bg-gradient-to-br from-[hsl(200,30%,98%)] via-[hsl(200,40%,95%)] to-[hsl(199,50%,90%)]"
            : "bg-[hsl(222,47%,4%)]"
          }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center gap-3"
        >
          {/* Simplified logo for mobile */}
          <motion.div
            animate={isMobile ? undefined : { scale: [1, 1.03, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width={isMobile ? 60 : 80} height={isMobile ? 60 : 80} viewBox="0 0 140 140">
              <text
                x="30"
                y="95"
                fontFamily="Inter, system-ui"
                fontWeight="900"
                fontSize="68"
                fill={isWaterTheme ? "hsl(199,89%,48%)" : "hsl(187,100%,50%)"}
              >
                A
              </text>
              <text
                x="70"
                y="95"
                fontFamily="Inter, system-ui"
                fontWeight="900"
                fontSize="68"
                fill={isWaterTheme ? "hsl(199,89%,48%)" : "hsl(187,100%,50%)"}
              >
                D
              </text>
            </svg>
          </motion.div>

          {/* Simple loading dots - fewer on mobile */}
          <div className="flex gap-1.5">
            {(isMobile ? [0, 1] : [0, 1, 2]).map((i) => (
              <motion.span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  isWaterTheme ? "bg-[hsl(199,89%,48%)]" : "bg-[hsl(187,100%,50%)]"
                }`}
                animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Content - only render and show after loader is gone */}
      {showContent && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration * 0.4, ease: "easeOut" }}
          style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}
        >
          {children}
        </motion.main>
      )}
    </>
  );
});

PageWrapper.displayName = "PageWrapper";
export default PageWrapper;
