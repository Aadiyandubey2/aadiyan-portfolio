import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
          <Breadcrumb />
          <div className="mt-6">
            <Skills />
          </div>
        </article>
        <Footer />
      </main>
    </PageWrapper>
  );
};

export default SkillsPage;
