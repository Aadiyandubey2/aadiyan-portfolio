import { useState, useEffect, useCallback } from "react";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCached, setCache } from "@/lib/swr-cache";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StackedCardsInteraction } from "@/components/ui/stacked-cards-interaction";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDynamicTranslations } from "@/hooks/useDynamicTranslations";

interface Certificate {
  id: string;
  title: string;
  issuer: string | null;
  issue_date: string | null;
  image_url: string;
  display_order: number;
}

const Certificates = () => {
  const { t, language } = useLanguage();
  const { td } = useDynamicTranslations(language);
  const [certificates, setCertificates] = useState<Certificate[]>(
    () => getCached<Certificate[]>('certificates') ?? []
  );
  const [isLoading, setIsLoading] = useState(
    () => getCached<Certificate[]>('certificates') === null
  );
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
        setCache('certificates', data);
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

  const stackedCardsData = stackedCerts.map((cert) => ({
    image: cert.image_url || "",
    title: td('certificates', cert.id, 'title', cert.title),
    description: td('certificates', cert.id, 'issuer', cert.issuer || "Certificate"),
    onClick: () => handleCardClick(cert),
  }));

  return (
    <section
      id="certificates"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6"
      aria-labelledby="certificates-heading"
    >
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-4 sm:mb-6">
          <h1
            id="certificates-heading"
            className="font-serif text-2xl sm:text-4xl md:text-5xl font-thin"
          >
            <span className="text-primary">{t("certificates.title_primary")}</span>
            <span className="text-foreground">{t("certificates.title_secondary")}</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mt-3 sm:mt-4 px-2">
            {t("certificates.subtitle")}
          </p>
        </header>

        {/* Stacked Cards with Navigation */}
        <div className="mb-6 sm:mb-8">
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
            {t("certificates.hover")}
          </p>
          <p className="text-center text-xs text-muted-foreground sm:hidden">
            {t("certificates.tap")}
          </p>
        </div>

        {/* Quick Access Names */}
        <div className="max-w-3xl mx-auto px-2">
          <h2 className="text-base sm:text-lg font-medium text-center mb-3 sm:mb-4 text-muted-foreground">
            {t("certificates.quick_access")}
          </h2>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {certificates.map((cert) => (
              <button
                key={cert.id}
                onClick={() => handleCardClick(cert)}
                className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
              >
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 max-w-[100px] sm:max-w-none">
                  {td('certificates', cert.id, 'title', cert.title)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
          {selectedCert && (
            <div className="relative">
              <OptimizedImage
                src={selectedCert.image_url}
                alt={selectedCert.title}
                optimizedWidth={1200}
                priority
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
                <h3 className="text-xl font-bold text-foreground">
                  {td('certificates', selectedCert.id, 'title', selectedCert.title)}
                </h3>
                {selectedCert.issuer && (
                  <p className="text-muted-foreground">{td('certificates', selectedCert.id, 'issuer', selectedCert.issuer)}</p>
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
