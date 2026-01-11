import { useEffect, memo, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AnimationProvider } from "@/contexts/AnimationContext";
import PageLoader from "./components/PageLoader";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WaterBackground from "./components/WaterBackground";

const Admin = lazy(() => import("./pages/Admin"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SkillsPage = lazy(() => import("./pages/SkillsPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage"));
const ShowcasePage = lazy(() => import("./pages/ShowcasePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const MemoizedWaterBackground = memo(WaterBackground);

const App = () => {
  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AnimationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <MemoizedWaterBackground />

            <PageLoader>
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
            </PageLoader>
          </TooltipProvider>
        </AnimationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
