import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero3D from '@/components/Hero3D';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import AIChatbot from '@/components/AIChatbot';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* SEO Meta handled in index.html */}
      
      <Navbar />
      
      <Hero3D />
      
      <About />
      
      <Skills />
      
      <Projects />
      
      <Contact />
      
      <Footer />
      
      <AIChatbot />
    </main>
  );
};

export default Index;
