import { useState, useEffect, useRef, ReactNode, memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnimation } from "@/contexts/AnimationContext";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = memo(({ children }: PageWrapperProps) => {
  const { theme, isLoading: themeLoading } = useTheme();
  const { duration, enabled, isMobile, isLowEnd } = useAnimation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Phase 1: Content mounted invisibly for pre-rendering
  // Phase 2: Content fully painted, loader fading
  // Phase 3: Loader gone, content visible
  const [phase, setPhase] = useState<1 | 2 | 3>(1);

  const isWaterTheme = theme === "water";

  useEffect(() => {
    if (themeLoading) return;

    let cancelled = false;

    const waitForFullRender = async () => {
      // Wait for fonts first
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {}

      // Give React time to mount content
      await new Promise(r => setTimeout(r, 50));

      // Wait for all images to load (with timeout)
      if (contentRef.current) {
        const images = contentRef.current.querySelectorAll('img');
        const imagePromises = Array.from(images).map((img) => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            // Timeout per image
            setTimeout(resolve, 1500);
          });
        });
        
        await Promise.all(imagePromises);
      }

      // Wait for next animation frame to ensure paint
      await new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      // Minimum polish time
      const minTime = isLowEnd ? 100 : isMobile ? 200 : 300;
      await new Promise(r => setTimeout(r, minTime));

      if (cancelled) return;

      // Phase 2: Start fading out loader
      setPhase(2);

      // Wait for loader fade-out then show content
      const fadeTime = enabled ? 250 : 0;
      await new Promise(r => setTimeout(r, fadeTime));

      if (cancelled) return;

      // Phase 3: Content visible
      setPhase(3);
    };

    waitForFullRender();

    return () => { cancelled = true; };
  }, [themeLoading, enabled, isMobile, isLowEnd]);

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
        ref={contentRef}
        style={{
          visibility: phase === 3 ? 'visible' : 'hidden',
          opacity: phase === 3 ? 1 : 0,
          position: phase === 3 ? 'relative' : 'absolute',
          top: phase === 3 ? 'auto' : 0,
          left: phase === 3 ? 'auto' : 0,
          width: '100%',
          minHeight: "calc(var(--vh, 1vh) * 100)",
          pointerEvents: phase === 3 ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </>
  );
});

PageWrapper.displayName = "PageWrapper";
export default PageWrapper;
