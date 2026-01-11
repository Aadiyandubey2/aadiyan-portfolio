import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import Breadcrumb from "@/components/Breadcrumb";
import Projects from "@/components/Projects";
import PageWrapper from "@/components/PageWrapper";

const ProjectsPage = () => {
  return (
    <PageWrapper>
      <main className="min-h-[100svh] text-foreground overflow-x-hidden">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Breadcrumb />
          <div className="mt-6">
            <ScrollReveal animation="slide-left" delay={0.1}>
              <Projects />
            </ScrollReveal>
          </div>
        </div>
        <Footer />
      </main>
    </PageWrapper>
  );
};

export default ProjectsPage;
