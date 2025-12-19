import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero3D from '@/components/Hero3D';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import AIChatbot from '@/components/AIChatbot';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

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
      
      <Hero3D />
      
      <ScrollReveal animation="slide-up">
        <About />
      </ScrollReveal>
      
      <ScrollReveal animation="slide-right" delay={0.1}>
        <Skills />
      </ScrollReveal>
      
      <ScrollReveal animation="slide-left" delay={0.1}>
        <Projects />
      </ScrollReveal>
      
      <ScrollReveal animation="scale-up" delay={0.1}>
        <Contact />
      </ScrollReveal>
      
      <ScrollReveal animation="slide-up">
        <Footer />
      </ScrollReveal>
      
      <AIChatbot />
    </main>
  );
};

export default Index;
