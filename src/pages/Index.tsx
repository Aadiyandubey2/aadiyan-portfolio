import { useEffect, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import AdminAccessButton from "@/components/AdminAccessButton";
import PageWrapper from "@/components/PageWrapper";

// Lazy load heavy components for better code splitting
const Hero3D = lazy(() => import("@/components/Hero3D"));
const ClementineSection = lazy(() => import("@/components/ClementineSection"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <PageWrapper>
      <main className="bg-background text-foreground overflow-x-hidden" style={{ minHeight: "calc(var(--vh) * 100)" }}>
        <Navbar />

        {/* Hero */}
        <div id="hero" className="relative" style={{ minHeight: "calc(var(--vh) * 100)" }}>
          <Suspense fallback={<div style={{ minHeight: "calc(var(--vh) * 100)" }} className="bg-background" />}>
            <Hero3D />
          </Suspense>
        </div>

        {/* Clementine AI Chat Section */}
        <Suspense fallback={<div className="py-12 sm:py-16 bg-background" />}>
          <ClementineSection />
        </Suspense>

        {/* Footer */}
        <Suspense fallback={null}>
          <Footer />
        </Suspense>

        {/* Admin Access Button */}
        <AdminAccessButton />
      </main>
    </PageWrapper>
  );
};

export default Index;
