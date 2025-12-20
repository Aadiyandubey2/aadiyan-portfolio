import { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Hero3D from '@/components/Hero3D';
import ClementineSection from '@/components/ClementineSection';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import ClementineCompanion from '@/components/ClementineCompanion';
import AdminAccessButton from '@/components/AdminAccessButton';

const Index = () => {
  const [currentSection, setCurrentSection] = useState('hero');
  const [showCompanion, setShowCompanion] = useState(true);
  const clementineSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Track current section
  useEffect(() => {
    const sections = ['hero', 'clementine', 'about', 'skills', 'projects', 'contact'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id || 'hero';
            setCurrentSection(sectionId);
            // Hide companion when in clementine chat section
            setShowCompanion(sectionId !== 'clementine');
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Also observe hero section by first child
    const heroEl = document.querySelector('main > div:first-of-type');
    if (heroEl) {
      heroEl.id = 'hero';
      observer.observe(heroEl);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToClementine = useCallback(() => {
    clementineSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <div id="hero">
        <Hero3D />
      </div>
      
      <ScrollReveal animation="scale-up">
        <div ref={clementineSectionRef}>
          <ClementineSection />
        </div>
      </ScrollReveal>
      
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

      {/* Floating Clementine Companion */}
      {showCompanion && (
        <ClementineCompanion 
          currentSection={currentSection} 
          onChatOpen={scrollToClementine}
        />
      )}

      {/* Admin Access Button */}
      <AdminAccessButton />
    </main>
  );
};

export default Index;
