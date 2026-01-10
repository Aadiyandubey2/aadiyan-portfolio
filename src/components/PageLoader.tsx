import { useState, useEffect, ReactNode, memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface PageLoaderProps {
  children: ReactNode;
  minLoadTime?: number;
}

const PageLoader = memo(({ children, minLoadTime = 300 }: PageLoaderProps) => {
  const { theme, isLoading: themeLoading } = useTheme();

  const [showLoader, setShowLoader] = useState(true);
  const [canMountContent, setCanMountContent] = useState(false);

  const isWaterTheme = theme === "water";

  /* -----------------------------
     1. Freeze viewport height
  ------------------------------*/
  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

  /* -----------------------------
     2. Wait for stable layout
  ------------------------------*/
  useEffect(() => {
    let cancelled = false;

    const prepare = async () => {
      try {
        // Wait for fonts
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }

        // Minimum loader time (polish only)
        await new Promise((r) => setTimeout(r, minLoadTime));
      } catch {
        await new Promise((r) => setTimeout(r, minLoadTime));
      }

      if (!cancelled) {
        setCanMountContent(true);
        setTimeout(() => setShowLoader(false), 80); // micro delay
      }
    };

    if (!themeLoading) prepare();

    return () => {
      cancelled = true;
    };
  }, [themeLoading, minLoadTime]);

  return (
    <>
      {/* -----------------------------
           Loader (NO AnimatePresence)
      ------------------------------*/}
      {showLoader && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300
            ${
              isWaterTheme
                ? "bg-gradient-to-br from-[hsl(200,30%,98%)] via-[hsl(200,40%,95%)] to-[hsl(199,50%,90%)]"
                : "bg-[hsl(222,47%,4%)]"
            }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            {/* Logo */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="80" height="80" viewBox="0 0 140 140">
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

            {/* Dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    isWaterTheme ? "bg-[hsl(199,89%,48%)]" : "bg-[hsl(187,100%,50%)]"
                  }`}
                  animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* -----------------------------
           Mount content ONLY when ready
      ------------------------------*/}
      {canMountContent && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ minHeight: "calc(var(--vh) * 100)" }}
        >
          {children}
        </motion.main>
      )}
    </>
  );
});

PageLoader.displayName = "PageLoader";
export default PageLoader;
