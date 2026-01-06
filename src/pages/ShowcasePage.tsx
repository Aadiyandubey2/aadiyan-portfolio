import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Breadcrumb from '@/components/Breadcrumb';
import Showcase from '@/components/Showcase';

const ShowcasePage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <Breadcrumb />
        <div className="mt-6">
          <ScrollReveal animation="slide-up" delay={0.1}>
            <Showcase />
          </ScrollReveal>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ShowcasePage;
