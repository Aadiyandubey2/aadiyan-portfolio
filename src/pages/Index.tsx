import { useEffect, lazy, Suspense, memo } from "react";
import Navbar from "@/components/Navbar";
import AdminAccessButton from "@/components/AdminAccessButton";
import PageWrapper from "@/components/PageWrapper";
import SEOHead from "@/components/SEOHead";
import ScrollReveal from "@/components/ScrollReveal";

// Lazy load heavy components for better code splitting
const Hero3D = lazy(() => import("@/components/Hero3D"));
const PageGallery = lazy(() => import("@/components/PageGallery"));
const ClementineSection = lazy(() => import("@/components/ClementineSection"));
const Footer = lazy(() => import("@/components/Footer"));
// Minimal loading fallback
const LoadingFallback = memo(() => (
  <div className="min-h-[50vh] bg-background" aria-busy="true" />
));
LoadingFallback.displayName = 'LoadingFallback';

const Index = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <PageWrapper>
      <SEOHead
        pageKey="home"
        fallbackTitle="Aadiyan Dubey | Full Stack Developer & React Expert Portfolio"
        fallbackDescription="Aadiyan Dubey is a Full Stack Developer from NIT Nagaland specializing in React, TypeScript, Node.js & AI integration."
        canonical="/"
        type="profile"
      />
      <main className="bg-background text-foreground overflow-x-hidden" style={{ minHeight: "calc(var(--vh) * 100)" }}>
        <Navbar />

        {/* Hero Section */}
        <section id="hero" className="relative" style={{ minHeight: "calc(var(--vh) * 100)" }} aria-label="Hero introduction">
          <Suspense fallback={<div style={{ minHeight: "calc(var(--vh) * 100)" }} className="bg-background" aria-busy="true" />}>
            <Hero3D />
          </Suspense>
        </section>

        {/* Page Gallery Navigation */}
        <Suspense fallback={<LoadingFallback />}>
          <ScrollReveal animation="fade" delay={0.1}>
            <PageGallery />
          </ScrollReveal>
        </Suspense>

        {/* Clementine AI Chat Section with Focus Animation */}
        <Suspense fallback={<LoadingFallback />}>
          <ScrollReveal animation="focus" delay={0.1}>
            <ClementineSection />
          </ScrollReveal>
        </Suspense>

        {/* Footer */}
        <Suspense fallback={null}>
          <ScrollReveal animation="fade" delay={0.05}>
            <Footer />
          </ScrollReveal>
        </Suspense>

        {/* Admin Access Button */}
        <AdminAccessButton />
      </main>
    </PageWrapper>
  );
};

export default Index;
