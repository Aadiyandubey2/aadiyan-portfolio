import { lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const Skills = lazy(() => import('@/components/Skills'));

const SectionLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const SkillsPage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24">
        <Suspense fallback={<SectionLoader />}>
          <ScrollReveal animation="slide-right" delay={0.1}>
            <Skills />
          </ScrollReveal>
        </Suspense>
      </div>
      <Footer />
    </main>
  );
};

export default SkillsPage;
