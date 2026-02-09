import { ReactNode, memo } from "react";

interface PageLoaderProps {
  children: ReactNode;
  minLoadTime?: number;
}

/**
 * PageLoader now renders children immediately to minimize TTI.
 * The per-page PageWrapper handles any entrance animation.
 */
const PageLoader = memo(({ children }: PageLoaderProps) => {
  return (
    <main style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}>
      {children}
    </main>
  );
});

PageLoader.displayName = "PageLoader";
export default PageLoader;
