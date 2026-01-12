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
        title="Showcase | Aadiyan Dubey - Creative Work & Demos"
        description="Creative showcase and demonstrations by Aadiyan Dubey. Explore interactive demos, design work, and innovative web development experiments."
        canonical="/showcase"
        keywords="web development showcase, creative portfolio, interactive demos, frontend developer work samples"
      />
      <main className="min-h-screen text-foreground">
        <Navbar />
        <article className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Breadcrumb />
          <div className="mt-6">
            <ScrollReveal animation="slide-up" delay={0.1}>
              <Showcase />
            </ScrollReveal>
          </div>
        </article>
        <Footer />
      </main>
    </PageWrapper>
  );
};

export default ShowcasePage;
