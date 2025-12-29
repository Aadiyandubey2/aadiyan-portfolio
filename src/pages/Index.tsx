import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Hero3D from '@/components/Hero3D';
import ScrollReveal from '@/components/ScrollReveal';
import AdminAccessButton from '@/components/AdminAccessButton';

// Lazy load heavy components for better initial load time
const ClementineSection = lazy(() => import('@/components/ClementineSection'));
const About = lazy(() => import('@/components/About'));
const Skills = lazy(() => import('@/components/Skills'));
const Projects = lazy(() => import('@/components/Projects'));
const Contact = lazy(() => import('@/components/Contact'));
const Footer = lazy(() => import('@/components/Footer'));
const ClementineCompanion = lazy(() => import('@/components/ClementineCompanion'));

// Loading fallback
const SectionLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

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

  // Track current section with optimized observer
  useEffect(() => {
    const sections = ['hero', 'clementine', 'about', 'skills', 'projects', 'contact'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id || 'hero';
            setCurrentSection(sectionId);
            setShowCompanion(sectionId !== 'clementine');
          }
        });
      },
      { threshold: 0.3, rootMargin: '-50px' }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

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
      
      <Suspense fallback={<SectionLoader />}>
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
      </Suspense>

      {/* Admin Access Button */}
      <AdminAccessButton />
    </main>
  );
};

export default Index;
