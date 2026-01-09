import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import Background3D from "./Background3D";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useProjects, ProjectFeature } from "@/hooks/useSiteContent";

// Simple feature icons - clean strokes only, no backgrounds
const FeatureIcon = ({ type, color }: { type: string; color: string }) => {
  const icons: Record<string, JSX.Element> = {
    globe: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke={color} strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="4" ry="9" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    crystal: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 3L19 9L12 21L5 9L12 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M5 9L12 13L19 9" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 3L4 7V11C4 15.4 7.4 19.5 12 21C16.6 19.5 20 15.4 20 11V7L12 3Z" stroke={color} strokeWidth="1.5" />
        <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M4 18L9 12L13 16L20 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 8V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M4 18V20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    bolt: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    devices: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="2" y="4" width="14" height="10" rx="1" stroke={color} strokeWidth="1.5" />
        <path d="M6 17H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <rect x="17" y="8" width="5" height="9" rx="1" stroke={color} strokeWidth="1.5" />
        <path d="M19 15H20" stroke={color} strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[type] || icons.crystal;
};

// Fallback features
const defaultFeatures: ProjectFeature[] = [
  {
    icon: "globe",
    color: "#00d4ff",
    title: "Multi-language",
    desc: "English & Hindi",
  },
  {
    icon: "crystal",
    color: "#8b5cf6",
    title: "Numerology",
    desc: "Birth predictions",
  },
  {
    icon: "shield",
    color: "#10b981",
    title: "JWT Auth",
    desc: "Secure auth",
  },
  {
    icon: "chart",
    color: "#f59e0b",
    title: "SEO",
    desc: "Optimized",
  },
  {
    icon: "bolt",
    color: "#ef4444",
    title: "Fast",
    desc: "Performance",
  },
  {
    icon: "devices",
    color: "#3b82f6",
    title: "Responsive",
    desc: "All devices",
  },
];
const defaultTechStack = ["React", "Node.js", "Express.js", "Supabase", "JWT", "Tailwind CSS"];

// Fullscreen Modal for Preview
const PreviewModal = ({ isOpen, onClose, url }: { isOpen: boolean; onClose: () => void; url: string }) => {
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
          <iframe src={url} title="Fullscreen Preview" className="w-full h-full border-0 rounded-lg" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Live Preview Component
const LivePreview = ({
  isLowEnd,
  onExpand,
  url,
  imageUrl,
}: {
  isLowEnd: boolean;
  onExpand: () => void;
  url: string;
  imageUrl?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const showLive = !isLowEnd && !imageUrl;
  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };
  return (
    <div className="relative bg-muted/20 rounded-xl overflow-hidden h-full min-h-[220px]">
      {/* Top bar with expand button */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={onExpand}
          className="p-1.5 rounded-lg bg-muted/80 hover:bg-muted text-foreground/80 hover:text-foreground transition-all backdrop-blur-sm"
          title="Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && showLive && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-5">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Preview Area */}
      <div className="w-full h-full overflow-hidden relative">
        {imageUrl ? (
          // Show uploaded image
          <img
            src={imageUrl}
            alt="Project preview"
            className="w-full h-full object-cover cursor-pointer"
            onClick={onExpand}
          />
        ) : showLive && !hasError ? (
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              src={url}
              title="Live Preview"
              className="border-0 pointer-events-none"
              style={{
                width: "200%",
                height: "200%",
                transform: "scale(0.5)",
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div
            className="w-full h-full relative group cursor-pointer flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))`,
            }}
            onClick={onExpand}
          >
            <div className="text-center p-4">
              <p className="text-sm font-heading font-semibold text-foreground/80">Click to expand</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new URL(url).hostname}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  });
  const { isLowEnd } = useDeviceCapability();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProjectUrl, setActiveProjectUrl] = useState("https://vishwaguru.site");
  const { projects: dbProjects, isLoading } = useProjects();

  // Get featured project for highlight section
  const featuredProject = dbProjects.find((p) => p.is_featured) || dbProjects[0];

  // Get other projects (non-featured)
  const otherProjects = dbProjects.filter((p) => p.id !== featuredProject?.id);
  const projectData = featuredProject || {
    title: "VishwaGuru.site",
    description:
      "A numerology predictions platform supporting English and Hindi with JWT authentication and SEO optimization.",
    url: "https://vishwaguru.site",
    image_url: "",
    tech_stack: defaultTechStack,
    features: defaultFeatures,
  };
  const features = (projectData.features?.length ? projectData.features : defaultFeatures) as ProjectFeature[];
  const techStack = projectData.tech_stack?.length ? projectData.tech_stack : defaultTechStack;
  const handleExpand = (url: string) => {
    setActiveProjectUrl(url);
    setIsModalOpen(true);
  };
  return (
    <section id="projects" className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
      <Background3D variant="section" color="#8b5cf6" />
      <div className="absolute inset-0 bg-blue-700 from-background via-background/90 to-background" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.5,
          }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-card text-xs sm:text-sm font-mono text-primary border border-primary/30 mb-4 sm:mb-6">
            Featured Project
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
            My <span className="text-blue-700">Work</span>
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="glass-card rounded-2xl overflow-hidden p-4 sm:p-6 animate-pulse">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              <div className="w-full md:w-[45%] shrink-0 h-[220px] bg-muted rounded-xl" />
              <div className="flex-1 space-y-4">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={
              isInView
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            className="glass-card rounded-2xl overflow-hidden p-4 sm:p-6"
          >
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              {/* Live Preview */}
              <div className="w-full md:w-[45%] shrink-0">
                <LivePreview
                  isLowEnd={isLowEnd}
                  onExpand={() => handleExpand(projectData.url || "https://vishwaguru.site")}
                  url={projectData.url || "https://vishwaguru.site"}
                  imageUrl={projectData.image_url}
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold mb-1.5">
                      {projectData.title?.includes(".") ? (
                        <>
                          {projectData.title.split(".")[0]}
                          <span className="text-primary">.{projectData.title.split(".").slice(1).join(".")}</span>
                        </>
                      ) : (
                        projectData.title
                      )}
                    </h3>
                    <p className="text-muted-foreground font-body text-xs sm:text-sm max-w-md">
                      {projectData.description}
                    </p>
                  </div>

                  {projectData.url && (
                    <a
                      href={projectData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-semibold text-xs text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-glow-cyan transition-all whitespace-nowrap self-start"
                    >
                      Visit Site
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Tech Stack */}
                <div className="mb-4">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.map((tech, index) => (
                      <motion.span
                        key={tech}
                        initial={{
                          opacity: 0,
                          scale: 0.7,
                          y: 10,
                        }}
                        animate={
                          isInView
                            ? {
                                opacity: 1,
                                scale: 1,
                                y: 0,
                              }
                            : {}
                        }
                        transition={{
                          type: "spring",
                          stiffness: 150,
                          damping: 12,
                          delay: 0.2 + index * 0.06,
                        }}
                        whileHover={{
                          scale: 1.1,
                          y: -2,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                          },
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono bg-muted/50 text-foreground/80 border border-border/30 hover:border-primary/50 hover:text-primary hover:bg-primary/10 cursor-default transition-colors duration-200"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Features with Icons */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-auto">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{
                        opacity: 0,
                        y: 15,
                        scale: 0.95,
                      }}
                      animate={
                        isInView
                          ? {
                              opacity: 1,
                              y: 0,
                              scale: 1,
                            }
                          : {}
                      }
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 14,
                        delay: 0.3 + index * 0.07,
                      }}
                      whileHover={{
                        scale: 1.05,
                        y: -3,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        },
                      }}
                      className="p-2 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-200 group flex items-center gap-2 cursor-default"
                    >
                      <motion.div
                        className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                        whileHover={{
                          rotate: 10,
                          scale: 1.15,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                        }}
                      >
                        <FeatureIcon type={feature.icon} color={feature.color} />
                      </motion.div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-heading font-semibold leading-tight truncate">
                          {feature.title}
                        </p>
                        <p className="text-[8px] sm:text-[9px] text-muted-foreground leading-tight truncate">
                          {feature.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other Projects Grid */}
        {otherProjects.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={
              isInView
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
            className="mt-8 sm:mt-12"
          >
            <h3 className="text-xl sm:text-2xl font-heading font-bold mb-6 text-center">
              Other <span className=" text-blue-700">Projects</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {otherProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{
                    opacity: 0,
                    y: 30,
                    scale: 0.95,
                  }}
                  animate={
                    isInView
                      ? {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }
                      : {}
                  }
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 0.4 + index * 0.12,
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    },
                  }}
                  className="glass-card rounded-xl overflow-hidden p-4 hover:border-primary/30 transition-colors duration-200 group"
                >
                  {/* Project Preview */}
                  <div className="relative h-40 rounded-lg overflow-hidden mb-4 bg-muted/30">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : project.url ? (
                      <div
                        className="w-full h-full flex items-center justify-center cursor-pointer"
                        style={{
                          background: `linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))`,
                        }}
                        onClick={() => handleExpand(project.url || "")}
                      >
                        <p className="text-sm font-heading text-foreground/70">Click to preview</p>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))`,
                        }}
                      >
                        <p className="text-sm font-heading text-foreground/50">No preview</p>
                      </div>
                    )}
                    {project.url && (
                      <button
                        onClick={() => handleExpand(project.url || "")}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-muted/80 hover:bg-muted text-foreground/80 hover:text-foreground transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        title="Fullscreen"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Project Info */}
                  <h4 className="text-base sm:text-lg font-heading font-bold mb-2">{project.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground font-body mb-3">{project.description}</p>

                  {/* Tech Stack */}
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tech_stack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-muted/50 text-foreground/80 border border-border/30"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack.length > 4 && (
                        <span className="px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                          +{project.tech_stack.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Visit Link */}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Visit Site
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      <PreviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} url={activeProjectUrl} />
    </section>
  );
};
export default Projects;
