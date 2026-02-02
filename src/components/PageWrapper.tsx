import { useState, useEffect, ReactNode, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnimation } from "@/contexts/AnimationContext";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = memo(({ children }: PageWrapperProps) => {
  const { theme, isLoading: themeLoading } = useTheme();
  const { enabled, isMobile, isLowEnd } = useAnimation();
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const isWaterTheme = theme === "water";

  // Memoized transition handler
  const handleTransition = useCallback(() => {
    if (themeLoading) return;

    // Use RAF for smooth paint
    requestAnimationFrame(() => {
      setPhase(2);
      // Minimal delay for fade
      setTimeout(() => setPhase(3), 80);
    });
  }, [themeLoading]);

  useEffect(() => {
    handleTransition();
  }, [handleTransition]);

  // Skip loader entirely for mobile and low-end devices - immediate content paint
  if (isMobile || (isLowEnd && !enabled)) {
    return (
      <main style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}>
        {children}
      </main>
    );
  }

  // Primary color for loader
  const accentColor = isWaterTheme ? "hsl(199,89%,48%)" : "hsl(187,100%,50%)";
  const bgGradient = isWaterTheme
    ? "bg-gradient-to-br from-[hsl(200,30%,98%)] via-[hsl(200,40%,95%)] to-[hsl(199,50%,90%)]"
    : "bg-[hsl(222,47%,4%)]";

  return (
    <>
      {/* Optimized Loader */}
      {phase < 3 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 2 ? 0 : 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`fixed inset-0 z-[9999] flex items-center justify-center ${bgGradient}`}
          style={{ willChange: 'opacity' }}
        >
          <div className="flex flex-col items-center gap-2.5">
            {/* Logo - simplified for performance */}
            <motion.svg 
              width={isMobile ? 56 : 72} 
              height={isMobile ? 56 : 72} 
              viewBox="0 0 140 140"
              animate={!isMobile && !isLowEnd ? { scale: [1, 1.02, 1] } : undefined}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <text x="30" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68" fill={accentColor}>A</text>
              <text x="70" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68" fill={accentColor}>D</text>
            </motion.svg>
            
            {/* Loading dots - minimal */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                  animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Content - immediate render, visibility controlled */}
      <div
        style={{
          visibility: phase === 3 ? 'visible' : 'hidden',
          opacity: phase === 3 ? 1 : 0,
          position: phase === 3 ? 'relative' : 'absolute',
          top: phase === 3 ? 'auto' : 0,
          left: phase === 3 ? 'auto' : 0,
          width: '100%',
          minHeight: "calc(var(--vh, 1vh) * 100)",
          pointerEvents: phase === 3 ? 'auto' : 'none',
          transition: 'opacity 0.12s ease-out',
          willChange: phase < 3 ? 'opacity' : 'auto',
        }}
      >
        {children}
      </div>
    </>
  );
});

PageWrapper.displayName = "PageWrapper";
export default PageWrapper;
