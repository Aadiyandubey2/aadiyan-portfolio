import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StackedCardsInteraction } from "@/components/ui/stacked-cards-interaction";

interface Certificate {
  id: string;
  title: string;
  issuer: string | null;
  issue_date: string | null;
  image_url: string;
  display_order: number;
}

const Certificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchCertificates = async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("display_order", { ascending: true });
      if (!error && data) {
        setCertificates(data);
      }
      setIsLoading(false);
    };
    fetchCertificates();
  }, []);

  const handleCardClick = useCallback((cert: Certificate) => {
    setSelectedCert(cert);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? certificates.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev === certificates.length - 1 ? 0 : prev + 1
    );
  };

  // Get current certificate and neighbors for stacked effect
  const getStackedCerts = () => {
    if (certificates.length === 0) return [];
    if (certificates.length === 1) return [certificates[0]];
    if (certificates.length === 2) return [certificates[currentIndex], certificates[(currentIndex + 1) % 2]];
    
    const current = certificates[currentIndex];
    const prev = certificates[(currentIndex - 1 + certificates.length) % certificates.length];
    const next = certificates[(currentIndex + 1) % certificates.length];
    return [current, prev, next];
  };

  const stackedCerts = getStackedCerts();

  // Prepare stacked cards data
  const stackedCardsData = stackedCerts.map((cert) => ({
    image: cert.image_url || "",
    title: cert.title,
    description: cert.issuer || "Certificate",
    onClick: () => handleCardClick(cert),
  }));

  return (
    <section
      id="certificates"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6"
      aria-labelledby="certificates-heading"
    >
      <div className="max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-6"
        >
          <h1
            id="certificates-heading"
            className="font-serif text-2xl sm:text-4xl md:text-5xl font-thin"
          >
            <span className="text-primary">Certificates & </span>
            <span className="text-foreground">Credentials</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mt-3 sm:mt-4 px-2">
            Professional certifications and achievements that validate my
            expertise
          </p>
        </motion.header>

        {/* Stacked Cards with Navigation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <StackedCardsInteraction
            cards={stackedCardsData}
            spreadDistance={60}
            rotationAngle={8}
            animationDelay={0.08}
            showNavigation={true}
            onPrev={handlePrev}
            onNext={handleNext}
            currentPage={currentIndex}
            totalPages={certificates.length}
          />
          <p className="text-center text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Hover to explore • Click to view details
          </p>
          <p className="text-center text-xs text-muted-foreground sm:hidden">
            Tap to spread • Swipe to navigate
          </p>
        </motion.div>

        {/* Quick Access Names */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto px-2"
        >
          <h2 className="text-base sm:text-lg font-medium text-center mb-3 sm:mb-4 text-muted-foreground">
            Quick Access
          </h2>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {certificates.map((cert, index) => (
              <motion.button
                key={cert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(cert)}
                className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
              >
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 max-w-[100px] sm:max-w-none">
                  {cert.title}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
          {selectedCert && (
            <div className="relative">
              <img
                src={selectedCert.image_url}
                alt={selectedCert.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
                <h3 className="text-xl font-bold text-foreground">
                  {selectedCert.title}
                </h3>
                {selectedCert.issuer && (
                  <p className="text-muted-foreground">{selectedCert.issuer}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Certificates;
