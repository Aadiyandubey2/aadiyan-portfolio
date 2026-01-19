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
        title="Projects | Aadiyan Dubey - Web Developer Portfolio"
        description="Explore web development projects by Aadiyan Dubey including VishwaGuru.site. Full stack applications built with React, Node.js, and modern technologies."
        canonical="/projects"
        keywords="web development projects, React projects, full stack applications, software developer portfolio projects, VishwaGuru"
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
