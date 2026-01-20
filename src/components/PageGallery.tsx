import { useNavigate } from "react-router-dom";
import { CircularGallery, GalleryItem } from "@/components/ui/circular-gallery";
import { User, Code, FolderOpen, Award, Sparkles, Mail } from "lucide-react";

// Page data with descriptions and placeholder images
const pageItems: GalleryItem[] = [
  {
    title: "About Me",
    subtitle: "Learn about my journey, background and passion for development",
    href: "/about",
    image: {
      url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      alt: "Developer workspace",
      pos: "center",
    },
    icon: <User className="w-4 h-4" />,
  },
  {
    title: "Skills",
    subtitle: "Technologies, frameworks and tools I work with",
    href: "/skills",
    image: {
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      alt: "Code on screen",
      pos: "center",
    },
    icon: <Code className="w-4 h-4" />,
  },
  {
    title: "Projects",
    subtitle: "Featured work and applications I've built",
    href: "/projects",
    image: {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
      alt: "Project dashboard",
      pos: "center",
    },
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    title: "Certificates",
    subtitle: "Professional certifications and achievements",
    href: "/certificates",
    image: {
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
      alt: "Certificate",
      pos: "center",
    },
    icon: <Award className="w-4 h-4" />,
  },
  {
    title: "Showcase",
    subtitle: "Visual portfolio of my best work",
    href: "/showcase",
    image: {
      url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&auto=format&fit=crop&q=80",
      alt: "Creative showcase",
      pos: "center",
    },
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    title: "Contact",
    subtitle: "Get in touch for collaborations or opportunities",
    href: "/contact",
    image: {
      url: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&auto=format&fit=crop&q=80",
      alt: "Contact communication",
      pos: "center",
    },
    icon: <Mail className="w-4 h-4" />,
  },
];

const PageGallery = () => {
  const navigate = useNavigate();

  const handleItemClick = (item: GalleryItem) => {
    navigate(item.href);
  };

  return (
    <section className="relative py-16 md:py-24 bg-background/50" aria-label="Page navigation gallery">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl text-foreground mb-3">
            Explore My Portfolio
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Navigate through different sections of my work
          </p>
        </div>

        {/* Circular gallery */}
        <CircularGallery
          items={pageItems}
          radius={350}
          autoRotateSpeed={0.012}
          onItemClick={handleItemClick}
          className="mx-auto"
        />

        {/* Mobile navigation fallback */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:hidden">
          {pageItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 text-sm text-foreground hover:bg-accent transition-colors"
            >
              {item.icon}
              {item.title}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PageGallery;
