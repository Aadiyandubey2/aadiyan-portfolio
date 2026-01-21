import { useState, useEffect, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const CertificateCard = memo(
  ({ cert, onClick }: { cert: Certificate; onClick: () => void }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{
        scale: 1.03,
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="group relative bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={cert.image_url}
          alt={cert.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {cert.title}
            </h3>
            {cert.issuer && (
              <p className="text-sm text-muted-foreground truncate">
                {cert.issuer}
              </p>
            )}
            {cert.issue_date && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                {new Date(cert.issue_date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <motion.div
        className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        whileHover={{ scale: 1.1 }}
      >
        <ExternalLink className="w-4 h-4 text-primary" />
      </motion.div>
    </motion.div>
  )
);
CertificateCard.displayName = "CertificateCard";

const Certificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

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

  // Get first 3 certificates for stacked display
  const featuredCerts = certificates.slice(0, 3);
  // Get remaining certificates for grid
  const remainingCerts = certificates.slice(3);

  // Prepare stacked cards data
  const stackedCardsData = featuredCerts.map((cert) => ({
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
          className="text-center mb-8"
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

        {/* Featured Stacked Cards Display */}
        {featuredCerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <StackedCardsInteraction
              cards={stackedCardsData}
              spreadDistance={60}
              rotationAngle={10}
              animationDelay={0.08}
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Hover to explore • Click to view details
            </p>
          </motion.div>
        )}

        {/* Remaining Certificates Grid */}
        {remainingCerts.length > 0 && (
          <>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-semibold text-center mb-8 text-foreground"
            >
              More Certificates
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {remainingCerts.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  cert={cert}
                  onClick={() => handleCardClick(cert)}
                />
              ))}
            </motion.div>
          </>
        )}

        {/* Show grid for all if less than 4 certificates but more than 3 */}
        {certificates.length > 0 && certificates.length <= 3 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          >
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                cert={cert}
                onClick={() => handleCardClick(cert)}
              />
            ))}
          </motion.div>
        )}
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
