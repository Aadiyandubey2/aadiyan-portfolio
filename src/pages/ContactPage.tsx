import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Breadcrumb from '@/components/Breadcrumb';
import Contact from '@/components/Contact';
import PageWrapper from '@/components/PageWrapper';
import SEOHead from '@/components/SEOHead';

const ContactPage = () => {
  return (
    <PageWrapper>
      <SEOHead
        pageKey="contact"
        fallbackTitle="Contact Aadiyan Dubey | Hire Full Stack Developer"
        fallbackDescription="Get in touch with Aadiyan Dubey for web development projects, collaborations, or job opportunities."
        canonical="/contact"
      />
      <main className="min-h-screen text-foreground">
        <Navbar />
        <article className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ScrollReveal animation="fade" delay={0.05}>
            <Breadcrumb />
          </ScrollReveal>
          <div className="mt-6">
            <ScrollReveal animation="focus" delay={0.1}>
              <Contact />
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

export default ContactPage;
