import { lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const Certificates = lazy(() => import('@/components/Certificates'));

const SectionLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const CertificatesPage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24">
        <Suspense fallback={<SectionLoader />}>
          <ScrollReveal animation="fade" delay={0.1}>
            <Certificates />
          </ScrollReveal>
        </Suspense>
      </div>
      <Footer />
    </main>
  );
};

export default CertificatesPage;
