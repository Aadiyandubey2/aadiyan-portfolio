import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Breadcrumb from '@/components/Breadcrumb';
import Projects from '@/components/Projects';
import PageWrapper from '@/components/PageWrapper';
import SEOHead from '@/components/SEOHead';

const ProjectsPage = () => {
  return (
    <PageWrapper>
      <SEOHead
        pageKey="projects"
        fallbackTitle="Projects | Aadiyan Dubey - Web Developer Portfolio"
        fallbackDescription="Explore web development projects by Aadiyan Dubey. Full stack applications built with React, Node.js, and modern technologies."
        canonical="/projects"
      />
      <main className="min-h-screen text-foreground">
        <Navbar />
        <article className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ScrollReveal animation="fade" delay={0.05}>
            <Breadcrumb />
          </ScrollReveal>
          <div className="mt-6">
            <ScrollReveal animation="focus" delay={0.1}>
              <Projects />
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

export default ProjectsPage;
