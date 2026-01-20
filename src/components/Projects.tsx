import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { X } from "lucide-react";
import Background3D from "./Background3D";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AnimatedFolder } from "@/components/ui/3d-folder";
import { useProjects } from "@/hooks/useSiteContent";

// Fullscreen Modal for Preview
const PreviewModal = ({
  isOpen,
  onClose,
  url
}: {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 bg-background/95 backdrop-blur-xl border-border/50">
        <DialogTitle className="sr-only">Live Preview</DialogTitle>
        <div className="relative w-full h-full">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-muted/80 hover:bg-muted text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <iframe
            src={url}
            title="Fullscreen Preview"
            className="w-full h-full border-0 rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Group projects by category for folder display
interface FolderProject {
  id: string;
  image: string;
  title: string;
  url?: string;
  description?: string;
  tech_stack?: string[];
}

interface FolderData {
  title: string;
  projects: FolderProject[];
}

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px"
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProjectUrl, setActiveProjectUrl] = useState("");
  const { projects: dbProjects, isLoading } = useProjects();

  // Transform projects into folder format
  const folders: FolderData[] = useMemo(() => {
    if (!dbProjects.length) {
      // Default fallback data
      return [
        {
          title: "Web Apps",
          projects: [
            {
              id: "1",
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
              title: "VishwaGuru.site",
              url: "https://vishwaguru.site"
            },
            {
              id: "2", 
              image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
              title: "Portfolio Site",
              url: "https://aadiyan-ai-nexus.lovable.app"
            },
            {
              id: "3",
              image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
              title: "Dashboard App"
            }
          ]
        }
      ];
    }

    // Group projects - for now put all in one folder, can expand later
    const featuredProjects = dbProjects.filter(p => p.is_featured);
    const otherProjects = dbProjects.filter(p => !p.is_featured);

    const result: FolderData[] = [];

    if (featuredProjects.length > 0) {
      result.push({
        title: "Featured",
        projects: featuredProjects.map(p => ({
          id: p.id,
          image: p.image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
          title: p.title,
          url: p.url || undefined,
          description: p.description || undefined,
          tech_stack: p.tech_stack || undefined
        }))
      });
    }

    if (otherProjects.length > 0) {
      result.push({
        title: "Projects",
        projects: otherProjects.map(p => ({
          id: p.id,
          image: p.image_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
          title: p.title,
          url: p.url || undefined,
          description: p.description || undefined,
          tech_stack: p.tech_stack || undefined
        }))
      });
    }

    // If no categorization, just show all
    if (result.length === 0) {
      result.push({
        title: "All Projects",
        projects: dbProjects.map(p => ({
          id: p.id,
          image: p.image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
          title: p.title,
          url: p.url || undefined,
          description: p.description || undefined,
          tech_stack: p.tech_stack || undefined
        }))
      });
    }

    return result;
  }, [dbProjects]);

  const handleProjectClick = (project: { url?: string }) => {
    if (project.url) {
      setActiveProjectUrl(project.url);
      setIsModalOpen(true);
    }
  };

  return (
    <section
      id="projects"
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden"
      aria-labelledby="projects-heading"
    >
      <Background3D variant="section" color="#8b5cf6" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-card text-xs sm:text-sm font-mono text-primary border border-primary/30 mb-4 sm:mb-6">
            Portfolio
          </span>
          <h1
            id="projects-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4"
          >
            My <span className="text-gradient">Work</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Hover over the folders to explore my projects
          </p>
        </motion.header>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="w-72 h-56 rounded-xl bg-muted/20 animate-pulse" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-8 sm:gap-12"
          >
            {folders.map((folder, index) => (
              <motion.div
                key={folder.title}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.2 + index * 0.15
                }}
              >
                <AnimatedFolder
                  title={folder.title}
                  projects={folder.projects}
                  onProjectClick={handleProjectClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick links section */}
        {!isLoading && dbProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-xs text-muted-foreground mb-4">Quick access</p>
            <div className="flex flex-wrap justify-center gap-2">
              {dbProjects.slice(0, 5).map((project) => (
                <a
                  key={project.id}
                  href={project.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-muted/30 hover:bg-muted/50 text-foreground/70 hover:text-foreground border border-border/30 hover:border-primary/30 transition-all"
                >
                  {project.title}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={activeProjectUrl}
      />
    </section>
  );
};

export default Projects;