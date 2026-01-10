import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero3D from "@/components/Hero3D";
import AdminAccessButton from "@/components/AdminAccessButton";
import ClementineSection from "@/components/ClementineSection";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <main className="bg-background text-foreground overflow-x-hidden" style={{ minHeight: "calc(var(--vh) * 100)" }}>
      <Navbar />

      {/* Hero */}
      <div id="hero" className="relative" style={{ minHeight: "calc(var(--vh) * 100)" }}>
        <Hero3D />
      </div>

      {/* Clementine AI Chat Section */}
      <ClementineSection />

      {/* Footer */}
      <Footer />

      {/* Admin Access Button */}
      <AdminAccessButton />
    </main>
  );
};

export default Index;
