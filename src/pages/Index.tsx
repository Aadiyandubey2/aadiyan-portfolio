import { useEffect, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import AdminAccessButton from "@/components/AdminAccessButton";
import PageWrapper from "@/components/PageWrapper";
import SEOHead from "@/components/SEOHead";

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
      <SEOHead
        title="Aadiyan Dubey | Full Stack Developer & React Developer Portfolio"
        description="Portfolio of Aadiyan Dubey - Full Stack Developer specializing in React, Node.js, and modern web technologies. B.Tech CSE student at NIT Nagaland. Explore projects, skills, and get in touch."
        canonical="/"
        type="profile"
        keywords="software developer portfolio, web developer portfolio, frontend developer, React developer, full stack developer, Aadiyan Dubey, NIT Nagaland"
      />
      <main className="bg-background text-foreground overflow-x-hidden" style={{ minHeight: "calc(var(--vh) * 100)" }}>
        <Navbar />

        {/* Hero Section */}
        <section id="hero" className="relative" style={{ minHeight: "calc(var(--vh) * 100)" }} aria-label="Hero introduction">
          <Suspense fallback={<div style={{ minHeight: "calc(var(--vh) * 100)" }} className="bg-background" aria-busy="true" />}>
            <Hero3D />
          </Suspense>
        </section>

        {/* Clementine AI Chat Section */}
        <Suspense fallback={<div className="py-12 sm:py-16 bg-background" aria-busy="true" />}>
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
