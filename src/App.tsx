import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AboutPage from "./pages/AboutPage";
import SkillsPage from "./pages/SkillsPage";
import ProjectsPage from "./pages/ProjectsPage";
import CertificatesPage from "./pages/CertificatesPage";
import ShowcasePage from "./pages/ShowcasePage";
import ContactPage from "./pages/ContactPage";
import WaterBackground from "./components/WaterBackground";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <WaterBackground />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/showcase" element={<ShowcasePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
