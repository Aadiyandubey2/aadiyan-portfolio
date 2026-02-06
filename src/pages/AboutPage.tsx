import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Breadcrumb from '@/components/Breadcrumb';
import About from '@/components/About';
import PageWrapper from '@/components/PageWrapper';
import SEOHead from '@/components/SEOHead';

const AboutPage = () => {
  return (
    <PageWrapper>
      <SEOHead
        pageKey="about"
        fallbackTitle="About Aadiyan Dubey | Full Stack Developer at NIT Nagaland"
        fallbackDescription="Learn about Aadiyan Dubey - B.Tech CSE student at NIT Nagaland, Full Stack Developer with expertise in React, Node.js, and modern web development."
        canonical="/about"
        type="profile"
      />
      <main className="min-h-screen text-foreground">
        <Navbar />
        <article className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ScrollReveal animation="fade" delay={0.05}>
            <Breadcrumb />
          </ScrollReveal>
          <div className="mt-6">
            <ScrollReveal animation="focus" delay={0.1}>
              <About />
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

export default AboutPage;
