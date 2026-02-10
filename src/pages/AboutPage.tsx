import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
          <Breadcrumb />
          <div className="mt-6">
            <About />
          </div>
        </article>
        <Footer />
      </main>
    </PageWrapper>
  );
};

export default AboutPage;
