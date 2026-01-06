import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero3D from '@/components/Hero3D';
import AdminAccessButton from '@/components/AdminAccessButton';
import ClementineSection from '@/components/ClementineSection';
import PageSlideshow from '@/components/PageSlideshow';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <div id="hero">
        <Hero3D />
      </div>
      
      {/* 3D Page Navigation Slideshow */}
      <PageSlideshow />
      
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
