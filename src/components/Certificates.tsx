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
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

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

  // Calculate certificate sets (groups of 3)
  const certificateSets: Certificate[][] = [];
  for (let i = 0; i < certificates.length; i += 3) {
    certificateSets.push(certificates.slice(i, i + 3));
  }

  const handlePrevSet = () => {
    setCurrentSetIndex((prev) => 
      prev === 0 ? certificateSets.length - 1 : prev - 1
    );
  };

  const handleNextSet = () => {
    setCurrentSetIndex((prev) => 
      prev === certificateSets.length - 1 ? 0 : prev + 1
    );
  };

  if (isLoading) {
    return (
      <section id="certificates" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (certificates.length === 0) {
    return null;
  }

  // Get current set of certificates
  const currentSet = certificateSets[currentSetIndex] || [];

  // Prepare stacked cards data for current set
  const stackedCardsData = currentSet.map((cert) => ({
    image: cert.image_url || "",
    title: cert.title,
    description: cert.issuer || "Certificate",
    onClick: () => handleCardClick(cert),
  }));

  return (
    <section
      id="certificates"
      className="py-20 px-6"
      aria-labelledby="certificates-heading"
    >
      <div className="max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h1
            id="certificates-heading"
            className="font-serif text-4xl sm:text-5xl font-thin"
          >
            <span className="text-primary">Certificates & </span>
            <span className="text-foreground">Credentials</span>
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
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
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {/* Previous Button */}
            {certificateSets.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevSet}
                className="p-2.5 sm:p-3 rounded-full bg-muted/80 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 shadow-lg"
                aria-label="Previous certificates"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </motion.button>
            )}

            {/* Stacked Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSetIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <StackedCardsInteraction
                  cards={stackedCardsData}
                  spreadDistance={60}
                  rotationAngle={8}
                  animationDelay={0.08}
                />
              </motion.div>
            </AnimatePresence>

            {/* Next Button */}
            {certificateSets.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextSet}
                className="p-2.5 sm:p-3 rounded-full bg-muted/80 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 shadow-lg"
                aria-label="Next certificates"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </motion.button>
            )}
          </div>

          {/* Pagination Dots */}
          {certificateSets.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {certificateSets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSetIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSetIndex
                      ? "w-6 bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to set ${index + 1}`}
                />
              ))}
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-4">
            Hover to explore • Click to view details
          </p>
        </motion.div>

        {/* Quick Access Names */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-lg font-medium text-center mb-4 text-muted-foreground">
            Quick Access
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
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
                className="group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-muted/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
              >
                <Award className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
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
