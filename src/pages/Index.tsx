import { useEffect, lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Hero3D from '@/components/Hero3D';
import AdminAccessButton from '@/components/AdminAccessButton';

// Only load ClementineSection on home page
const ClementineSection = lazy(() => import('@/components/ClementineSection'));

// Loading fallback
const SectionLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

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
      
      <Suspense fallback={<SectionLoader />}>
        <ClementineSection />
      </Suspense>

      {/* Admin Access Button */}
      <AdminAccessButton />
    </main>
  );
};

export default Index;
