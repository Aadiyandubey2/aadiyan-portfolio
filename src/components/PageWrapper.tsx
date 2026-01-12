import { useState, useEffect, ReactNode, memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnimation } from "@/contexts/AnimationContext";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = memo(({ children }: PageWrapperProps) => {
  const { theme, isLoading: themeLoading } = useTheme();
  const { enabled, isMobile, isLowEnd } = useAnimation();

  // Phase 1: Content mounted invisibly for pre-rendering
  // Phase 2: Content fully painted, loader fading
  // Phase 3: Loader gone, content visible
  const [phase, setPhase] = useState<1 | 2 | 3>(1);

  const isWaterTheme = theme === "water";

  useEffect(() => {
    if (themeLoading) return;

    let cancelled = false;

    const showContent = async () => {
      // Single rAF to ensure initial paint, then show content immediately
      requestAnimationFrame(() => {
        if (cancelled) return;
        setPhase(2);
        
        // Minimal fade time for smooth transition
        setTimeout(() => {
          if (cancelled) return;
          setPhase(3);
        }, 100);
      });
    };

    showContent();

    return () => { cancelled = true; };
  }, [themeLoading]);

  // Skip loader for low-end with reduced motion
  if (!enabled && isLowEnd) {
    return (
      <main style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}>
        {children}
      </main>
    );
  }

  return (
    <>
      {/* Loader overlay */}
      {phase < 3 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 2 ? 0 : 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`fixed inset-0 z-[9999] flex items-center justify-center
            ${isWaterTheme
              ? "bg-gradient-to-br from-[hsl(200,30%,98%)] via-[hsl(200,40%,95%)] to-[hsl(199,50%,90%)]"
              : "bg-[hsl(222,47%,4%)]"
            }`}
        >
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={isMobile ? undefined : { scale: [1, 1.03, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width={isMobile ? 60 : 80} height={isMobile ? 60 : 80} viewBox="0 0 140 140">
                <text x="30" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68"
                  fill={isWaterTheme ? "hsl(199,89%,48%)" : "hsl(187,100%,50%)"}>A</text>
                <text x="70" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68"
                  fill={isWaterTheme ? "hsl(199,89%,48%)" : "hsl(187,100%,50%)"}>D</text>
              </svg>
            </motion.div>
            <div className="flex gap-1.5">
              {(isMobile ? [0, 1] : [0, 1, 2]).map((i) => (
                <motion.span
                  key={i}
                  className={`w-2 h-2 rounded-full ${isWaterTheme ? "bg-[hsl(199,89%,48%)]" : "bg-[hsl(187,100%,50%)]"}`}
                  animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Content container - renders immediately but hidden until phase 3 */}
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
          transition: 'opacity 0.15s ease-out'
        }}
      >
        {children}
      </div>
    </>
  );
});

PageWrapper.displayName = "PageWrapper";
export default PageWrapper;
