import { lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const Showcase = lazy(() => import('@/components/Showcase'));

const SectionLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const ShowcasePage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24">
        <Suspense fallback={<SectionLoader />}>
          <ScrollReveal animation="slide-up" delay={0.1}>
            <Showcase />
          </ScrollReveal>
        </Suspense>
      </div>
      <Footer />
    </main>
  );
};

export default ShowcasePage;
