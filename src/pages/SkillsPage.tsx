import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Breadcrumb from '@/components/Breadcrumb';
import Skills from '@/components/Skills';
import PageWrapper from '@/components/PageWrapper';
import SEOHead from '@/components/SEOHead';

const SkillsPage = () => {
  return (
    <PageWrapper>
      <SEOHead
        pageKey="skills"
        fallbackTitle="Skills & Technologies | Aadiyan Dubey - Full Stack Developer"
        fallbackDescription="Technical skills and expertise of Aadiyan Dubey. Proficient in React, TypeScript, Node.js, Express, and modern frontend technologies."
        canonical="/skills"
      />
      <main className="min-h-screen text-foreground">
        <Navbar />
        <article className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ScrollReveal animation="fade" delay={0.05}>
            <Breadcrumb />
          </ScrollReveal>
          <div className="mt-6">
            <ScrollReveal animation="fade" delay={0.1}>
              <Skills />
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

export default SkillsPage;
