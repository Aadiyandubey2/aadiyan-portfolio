import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Breadcrumb from '@/components/Breadcrumb';
import Certificates from '@/components/Certificates';
import PageWrapper from '@/components/PageWrapper';
import SEOHead from '@/components/SEOHead';

const CertificatesPage = () => {
  return (
    <PageWrapper>
      <SEOHead
        title="Certificates & Achievements | Aadiyan Dubey"
        description="Professional certifications and achievements of Aadiyan Dubey. View verified certificates in web development, programming, and software engineering."
        canonical="/certificates"
        keywords="developer certifications, web development certificates, programming achievements, software engineering credentials"
      />
      <main className="min-h-screen text-foreground">
        <Navbar />
        <article className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ScrollReveal animation="fade" delay={0.05}>
            <Breadcrumb />
          </ScrollReveal>
          <div className="mt-6">
            <ScrollReveal animation="focus" delay={0.1}>
              <Certificates />
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

export default CertificatesPage;
