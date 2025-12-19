import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ClementineHero from '@/components/ClementineHero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
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
      
      <ClementineHero />
      
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
    </main>
  );
};

export default Index;
