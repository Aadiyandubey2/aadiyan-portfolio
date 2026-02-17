import { useState, useEffect, ReactNode, memo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnimation } from "@/contexts/AnimationContext";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = memo(({ children }: PageWrapperProps) => {
  const { theme, isLoading: themeLoading } = useTheme();
  const { enabled, isMobile, isLowEnd } = useAnimation();
  const [ready, setReady] = useState(false);
  const isWaterTheme = theme === "water";

  useEffect(() => {
    if (themeLoading) return;
    requestAnimationFrame(() => setReady(true));
  }, [themeLoading]);

  // Skip loader entirely for low-end devices
  if (!enabled && isLowEnd) {
    return (
      <main style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}>
        {children}
      </main>
    );
  }

  const accentColor = isWaterTheme ? "hsl(199,89%,48%)" : "hsl(187,100%,50%)";
  const bgGradient = isWaterTheme
    ? "bg-gradient-to-br from-[hsl(200,30%,98%)] via-[hsl(200,40%,95%)] to-[hsl(199,50%,90%)]"
    : "bg-[hsl(222,47%,4%)]";

  return (
    <>
      {!ready && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center ${bgGradient}`}
        >
          <div className="flex flex-col items-center gap-2.5">
            <svg 
              width={isMobile ? 56 : 72} 
              height={isMobile ? 56 : 72} 
              viewBox="0 0 140 140"
            >
              <text x="30" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68" fill={accentColor}>A</text>
              <text x="70" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68" fill={accentColor}>D</text>
            </svg>
            {/* CSS-only loading dots — avoids pulling framer-motion (39KB) into critical path */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: accentColor,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          opacity: ready ? 1 : 0,
          minHeight: "calc(var(--vh, 1vh) * 100)",
          transition: 'opacity 0.15s ease-out',
        }}
      >
        {children}
      </div>
    </>
  );
});

PageWrapper.displayName = "PageWrapper";
export default PageWrapper;
