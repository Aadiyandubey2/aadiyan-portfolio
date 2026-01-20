import { useNavigate } from "react-router-dom";
import { CircularGallery, GalleryItem } from "@/components/ui/circular-gallery";
import { UserCircle2, Cpu, Layers, GraduationCap, Palette, Send } from "lucide-react";

// Page data with professional icons
const pageItems: GalleryItem[] = [
  {
    title: "About Me",
    subtitle: "My journey & background",
    href: "/about",
    image: {
      url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
      alt: "Developer workspace",
      pos: "center",
    },
    icon: <UserCircle2 className="w-4 h-4" strokeWidth={2.5} />,
  },
  {
    title: "Skills",
    subtitle: "Tech stack & expertise",
    href: "/skills",
    image: {
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
      alt: "Code on screen",
      pos: "center",
    },
    icon: <Cpu className="w-4 h-4" strokeWidth={2.5} />,
  },
  {
    title: "Projects",
    subtitle: "Featured applications",
    href: "/projects",
    image: {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
      alt: "Project dashboard",
      pos: "center",
    },
    icon: <Layers className="w-4 h-4" strokeWidth={2.5} />,
  },
  {
    title: "Certificates",
    subtitle: "Achievements & awards",
    href: "/certificates",
    image: {
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60",
      alt: "Certificate",
      pos: "center",
    },
    icon: <GraduationCap className="w-4 h-4" strokeWidth={2.5} />,
  },
  {
    title: "Showcase",
    subtitle: "Visual portfolio",
    href: "/showcase",
    image: {
      url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop&q=60",
      alt: "Creative showcase",
      pos: "center",
    },
    icon: <Palette className="w-4 h-4" strokeWidth={2.5} />,
  },
  {
    title: "Contact",
    subtitle: "Get in touch",
    href: "/contact",
    image: {
      url: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&auto=format&fit=crop&q=60",
      alt: "Contact communication",
      pos: "center",
    },
    icon: <Send className="w-4 h-4" strokeWidth={2.5} />,
  },
];

const PageGallery = () => {
  const navigate = useNavigate();

  const handleItemClick = (item: GalleryItem) => {
    navigate(item.href);
  };

  return (
    <section className="relative py-8 md:py-12 bg-background/50" aria-label="Page navigation gallery">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="font-heading text-xl md:text-2xl lg:text-3xl text-foreground mb-1">
            Explore My Portfolio
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm max-w-md mx-auto">
            Navigate through different sections
          </p>
        </div>

        {/* Circular gallery - desktop only */}
        <div className="hidden md:block">
          <CircularGallery
            items={pageItems}
            radius={260}
            autoRotateSpeed={0.01}
            onItemClick={handleItemClick}
          />
        </div>

        {/* Mobile navigation - optimized grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:hidden">
          {pageItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="group flex flex-col items-start gap-1.5 p-3 sm:p-4 rounded-xl bg-card/60 dark:bg-card/80 border border-border/30 text-left hover:bg-accent/30 dark:hover:bg-accent/50 transition-all active:scale-[0.98] shadow-sm"
            >
              <span className="text-foreground/70 group-hover:text-foreground transition-colors">{item.icon}</span>
              <div>
                <span className="font-medium text-sm text-foreground block">{item.title}</span>
                <span className="text-[10px] text-muted-foreground line-clamp-1">{item.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PageGallery;
