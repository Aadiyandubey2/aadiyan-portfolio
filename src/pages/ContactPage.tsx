import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Breadcrumb from '@/components/Breadcrumb';
import Contact from '@/components/Contact';
import PageWrapper from '@/components/PageWrapper';

const ContactPage = () => {
  return (
    <PageWrapper>
      <main className="min-h-screen text-foreground">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Breadcrumb />
          <div className="mt-6">
            <ScrollReveal animation="scale-up" delay={0.1}>
              <Contact />
            </ScrollReveal>
          </div>
        </div>
        <Footer />
      </main>
    </PageWrapper>
  );
};

export default ContactPage;
