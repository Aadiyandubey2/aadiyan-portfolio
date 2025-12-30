import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Hero3D from '@/components/Hero3D';
import ClementineSection from '@/components/ClementineSection';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ClementineCompanion from '@/components/ClementineCompanion';
import AdminAccessButton from '@/components/AdminAccessButton';

// Smooth section wrapper with framer-motion
const SmoothSection = memo(({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 0.6, 
      delay,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
  >
    {children}
  </motion.div>
));

SmoothSection.displayName = 'SmoothSection';

const Index = () => {
  const [currentSection, setCurrentSection] = useState('hero');
  const [showCompanion, setShowCompanion] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const clementineSectionRef = useRef<HTMLDivElement>(null);

  // Mark as loaded after initial render
  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
    <AnimatePresence mode="wait">
      <motion.main 
        className="min-h-screen bg-background text-foreground overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Navbar />
        
        <div id="hero">
          <Hero3D />
        </div>
        
        <SmoothSection>
          <div ref={clementineSectionRef}>
            <ClementineSection />
          </div>
        </SmoothSection>
        
        <SmoothSection delay={0.05}>
          <About />
        </SmoothSection>
        
        <SmoothSection delay={0.05}>
          <Skills />
        </SmoothSection>
        
        <SmoothSection delay={0.05}>
          <Projects />
        </SmoothSection>
        
        <SmoothSection delay={0.05}>
          <Contact />
        </SmoothSection>
        
        <SmoothSection>
          <Footer />
        </SmoothSection>

        {/* Floating Clementine Companion */}
        <AnimatePresence>
          {showCompanion && isLoaded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <ClementineCompanion 
                currentSection={currentSection} 
                onChatOpen={scrollToClementine}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Access Button */}
        <AdminAccessButton />
      </motion.main>
    </AnimatePresence>
  );
};

export default Index;
