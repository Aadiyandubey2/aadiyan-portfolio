import { useNavigate } from "react-router-dom";
import { CircularGallery, GalleryItem } from "@/components/ui/circular-gallery";
import { AnimatedLetterText } from "@/components/ui/portfolio-text";
import { useGalleryItems } from "@/hooks/useGalleryItems";
import { getOptimizedImageUrl } from "@/components/ui/optimized-image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDynamicTranslations } from "@/hooks/useDynamicTranslations";
// Same icons as used in the navbar for consistency
import { 
  Home, User, Lightbulb, FolderKanban, Award, Images, Mail
} from "lucide-react";

// Icon mapping for dynamic icon rendering - matching navbar icons
const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4" strokeWidth={2.5} />,
  user: <User className="w-4 h-4" strokeWidth={2.5} />,
  lightbulb: <Lightbulb className="w-4 h-4" strokeWidth={2.5} />,
  "folder-kanban": <FolderKanban className="w-4 h-4" strokeWidth={2.5} />,
  award: <Award className="w-4 h-4" strokeWidth={2.5} />,
  images: <Images className="w-4 h-4" strokeWidth={2.5} />,
  mail: <Mail className="w-4 h-4" strokeWidth={2.5} />,
  // Legacy mappings for backward compatibility
  cpu: <Lightbulb className="w-4 h-4" strokeWidth={2.5} />,
  layers: <FolderKanban className="w-4 h-4" strokeWidth={2.5} />,
  "graduation-cap": <Award className="w-4 h-4" strokeWidth={2.5} />,
  palette: <Images className="w-4 h-4" strokeWidth={2.5} />,
  send: <Mail className="w-4 h-4" strokeWidth={2.5} />,
};

// Fallback data in case DB is not available
const useFallbackItems = (): GalleryItem[] => {
  const { t } = useLanguage();
  return [
    {
      title: t("gallery.about_me"),
      subtitle: t("gallery.about_subtitle"),
      href: "/about",
      image: { url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60&fm=webp", alt: "Developer workspace", pos: "center" },
      icon: <User className="w-4 h-4" strokeWidth={2.5} />,
    },
    {
      title: t("nav.skills"),
      subtitle: t("gallery.skills_subtitle"),
      href: "/skills",
      image: { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60&fm=webp", alt: "Code on screen", pos: "center" },
      icon: <Lightbulb className="w-4 h-4" strokeWidth={2.5} />,
    },
    {
      title: t("nav.projects"),
      subtitle: t("gallery.projects_subtitle"),
      href: "/projects",
      image: { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60&fm=webp", alt: "Project dashboard", pos: "center" },
      icon: <FolderKanban className="w-4 h-4" strokeWidth={2.5} />,
    },
    {
      title: t("nav.certificates"),
      subtitle: t("gallery.certificates_subtitle"),
      href: "/certificates",
      image: { url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60&fm=webp", alt: "Certificate", pos: "center" },
      icon: <Award className="w-4 h-4" strokeWidth={2.5} />,
    },
    {
      title: t("nav.showcase"),
      subtitle: t("gallery.showcase_subtitle"),
      href: "/showcase",
      image: { url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop&q=60&fm=webp", alt: "Creative showcase", pos: "center" },
      icon: <Images className="w-4 h-4" strokeWidth={2.5} />,
    },
    {
      title: t("nav.contact"),
      subtitle: t("gallery.contact_subtitle"),
      href: "/contact",
      image: { url: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&auto=format&fit=crop&q=60&fm=webp", alt: "Contact communication", pos: "center" },
      icon: <Mail className="w-4 h-4" strokeWidth={2.5} />,
    },
  ];
};

// Map gallery hrefs to translation keys for Hindi mode
const galleryTranslationMap: Record<string, { titleKey: string; subtitleKey: string }> = {
  "/about": { titleKey: "gallery.about_me", subtitleKey: "gallery.about_subtitle" },
  "/skills": { titleKey: "nav.skills", subtitleKey: "gallery.skills_subtitle" },
  "/projects": { titleKey: "nav.projects", subtitleKey: "gallery.projects_subtitle" },
  "/certificates": { titleKey: "nav.certificates", subtitleKey: "gallery.certificates_subtitle" },
  "/showcase": { titleKey: "nav.showcase", subtitleKey: "gallery.showcase_subtitle" },
  "/contact": { titleKey: "nav.contact", subtitleKey: "gallery.contact_subtitle" },
};

const PageGallery = () => {
  const navigate = useNavigate();
  const { galleryItems, isLoading } = useGalleryItems();
  const { t, language } = useLanguage();
  const { td } = useDynamicTranslations(language);
  const fallbackItems = useFallbackItems();

  const handleItemClick = (item: GalleryItem) => {
    navigate(item.href);
  };

  // Transform DB data to GalleryItem format, with Hindi translation overlay
  const pageItems: GalleryItem[] = galleryItems.length > 0
    ? galleryItems.map(item => {
        const translationKeys = galleryTranslationMap[item.href];
        const useTranslation = language === "hi" && translationKeys;
        // First try static translation keys, then dynamic DB translations
        const title = useTranslation ? t(translationKeys.titleKey) : td('gallery_items', item.id || item.href, 'title', item.title);
        const subtitle = useTranslation ? t(translationKeys.subtitleKey) : td('gallery_items', item.id || item.href, 'subtitle', item.subtitle || "");
        return {
          title,
          subtitle,
          href: item.href,
          image: {
            url: getOptimizedImageUrl(item.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60", 800),
            alt: item.title,
            pos: "center",
          },
          icon: iconMap[item.icon] || <FolderKanban className="w-4 h-4" strokeWidth={2.5} />,
        };
      })
    : fallbackItems;

  return (
    <section className="relative py-10 md:py-16 bg-background/50" aria-label="Page navigation gallery">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-4 md:mb-8">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl mb-2">
            <AnimatedLetterText 
              text={t("gallery.title")} 
              letterToReplace="o"
              className="text-2xl md:text-3xl lg:text-4xl"
            />
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            {t("gallery.subtitle")}
          </p>
        </div>

        {/* Circular gallery - responsive with larger radius */}
        <CircularGallery
          items={pageItems}
          radius={340}
          mobileRadius={180}
          autoRotateSpeed={0.008}
          onItemClick={handleItemClick}
        />
      </div>
    </section>
  );
};

export default PageGallery;
