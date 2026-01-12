import { useEffect, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import AdminAccessButton from "@/components/AdminAccessButton";
import ClementineSection from "@/components/ClementineSection";
import Footer from "@/components/Footer";
import PageWrapper from "@/components/PageWrapper";

// Lazy load Hero3D since it contains heavy Three.js code
const Hero3D = lazy(() => import("@/components/Hero3D"));

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
        <ClementineSection />

        {/* Footer */}
        <Footer />

        {/* Admin Access Button */}
        <AdminAccessButton />
      </main>
    </PageWrapper>
  );
};

export default Index;
