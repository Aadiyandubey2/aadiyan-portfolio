import { useEffect, lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AnimationProvider } from "@/contexts/AnimationContext";
import NotFound from "./pages/NotFound";

// Lazy load non-critical components to reduce initial bundle
const WaterBackground = lazy(() => import("./components/WaterBackground"));

// Lazy load ALL pages including Index for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Admin = lazy(() => import("./pages/Admin"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SkillsPage = lazy(() => import("./pages/SkillsPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage"));
const ShowcasePage = lazy(() => import("./pages/ShowcasePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

// Configure query client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper component to access theme context
const AppContent = () => {

  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

  return (
    <>
      <TooltipProvider>
        <Sonner />
        <Suspense fallback={null}>
          <WaterBackground />
        </Suspense>

        <BrowserRouter>
          <Suspense fallback={<div style={{ minHeight: "calc(var(--vh) * 100)" }} className="bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/showcase" element={<ShowcasePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AnimationProvider>
          <AppContent />
        </AnimationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
