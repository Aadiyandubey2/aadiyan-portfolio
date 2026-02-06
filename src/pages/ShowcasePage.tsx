import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Breadcrumb from '@/components/Breadcrumb';
import Showcase from '@/components/Showcase';
import PageWrapper from '@/components/PageWrapper';
import SEOHead from '@/components/SEOHead';

const ShowcasePage = () => {
  return (
    <PageWrapper>
      <SEOHead
        pageKey="showcase"
        fallbackTitle="Showcase | Aadiyan Dubey - Creative Work & Demos"
        fallbackDescription="Creative showcase and demonstrations by Aadiyan Dubey. Explore interactive demos and innovative web development experiments."
        canonical="/showcase"
      />
      <main className="min-h-screen text-foreground">
        <Navbar />
        <article className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ScrollReveal animation="fade" delay={0.05}>
            <Breadcrumb />
          </ScrollReveal>
          <div className="mt-6">
            <ScrollReveal animation="focus" delay={0.1}>
              <Showcase />
            </ScrollReveal>
          </div>
        </article>
        <ScrollReveal animation="fade" delay={0.2}>
          <Footer />
        </ScrollReveal>
      </main>
    </PageWrapper>
  );
};

export default ShowcasePage;
