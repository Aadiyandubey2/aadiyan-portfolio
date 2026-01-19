import { motion, type Variants } from "framer-motion";
import { useMemo } from "react";
import Background3D from "./Background3D";
import { useSkills, useSiteContent, useProjects } from "@/hooks/useSiteContent";

/* ---------------- ICONS ---------------- */

function SkillIcon({ type, color }: { type: string; color: string }) {
  const icons: Record<string, JSX.Element> = {
    code: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M16 18L22 12L16 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 6L2 12L8 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    server: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="3" y="3" width="18" height="6" rx="1" stroke={color} strokeWidth="1.5" />
        <rect x="3" y="15" width="18" height="6" rx="1" stroke={color} strokeWidth="1.5" />
        <circle cx="7" cy="6" r="1" fill={color} />
        <circle cx="7" cy="18" r="1" fill={color} />
      </svg>
    ),
    database: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <ellipse cx="12" cy="6" rx="8" ry="3" stroke={color} strokeWidth="1.5" />
        <path d="M4 6V18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V6" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    project: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M3 7L12 3L21 7V17L12 21L3 17V7Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 12L21 7" stroke={color} strokeWidth="1.5" />
        <path d="M12 12V21" stroke={color} strokeWidth="1.5" />
        <path d="M12 12L3 7" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
  };

  return icons[type] || icons.sparkle;
}

/* ---------------- TYPES ---------------- */

interface SkillCategory {
  id: string;
  title: string;
  color: string;
  icon: string;
  skills: string[];
}

interface TechWithProjects {
  name: string;
  projects: string[];
  count: number;
}

/* ---------------- FALLBACK DATA ---------------- */

const defaultSkillCategories: SkillCategory[] = [
  { id: "1", title: "Frontend", color: "#00d4ff", icon: "code", skills: ["React", "TypeScript", "Tailwind", "HTML", "CSS"] },
  { id: "2", title: "Backend", color: "#8b5cf6", icon: "server", skills: ["Node.js", "Express", "Supabase", "JWT", "REST APIs"] },
  { id: "3", title: "Database & Tools", color: "#3b82f6", icon: "database", skills: ["PostgreSQL", "MySQL", "Git", "Postman"] },
  { id: "4", title: "Other", color: "#10b981", icon: "sparkle", skills: ["UI/UX", "SEO", "Performance"] },
];

/* ---------------- ANIMATION ---------------- */

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ---------------- MAIN ---------------- */

function Skills() {
  const { skills: dbSkills, isLoading: skillsLoading } = useSkills();
  const { content } = useSiteContent();
  const { projects, isLoading: projectsLoading } = useProjects();

  const isLoading = skillsLoading || projectsLoading;
  const skillCategories = dbSkills.length ? dbSkills : defaultSkillCategories;

  // Extract technologies from projects dynamically
  const projectTechnologies = useMemo<TechWithProjects[]>(() => {
    if (!projects.length) return [];
    
    const techMap = new Map<string, string[]>();
    
    projects.forEach((project) => {
      if (project.tech_stack && Array.isArray(project.tech_stack)) {
        project.tech_stack.forEach((tech) => {
          const normalizedTech = tech.trim();
          if (normalizedTech) {
            const existing = techMap.get(normalizedTech) || [];
            if (!existing.includes(project.title)) {
              techMap.set(normalizedTech, [...existing, project.title]);
            }
          }
        });
      }
    });

    return Array.from(techMap.entries())
      .map(([name, projectList]) => ({
        name,
        projects: projectList,
        count: projectList.length,
      }))
      .sort((a, b) => b.count - a.count); // Sort by usage count
  }, [projects]);

  const currentlyBuilding = content?.currently_building?.length
    ? content.currently_building
    : projectTechnologies.slice(0, 5).map(t => t.name);

  return (
    <section id="skills" className="relative py-24 overflow-hidden" aria-labelledby="skills-heading">
      <Background3D variant="section" color="#00d4ff" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-xs font-mono border mb-5">
            &lt;/&gt; Tech Stack
          </span>
          <h1 id="skills-heading" className="text-4xl font-thin">
            Skills <span className="text-blue-700">& Technologies</span>
          </h1>
        </motion.header>

        {/* Skill Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card h-40 animate-pulse rounded-2xl" />
              ))
            : skillCategories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="glass-card rounded-2xl p-5 sm:p-6"
                  style={{ boxShadow: `0 0 30px ${cat.color}15` }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9">
                      <SkillIcon type={cat.icon} color={cat.color} />
                    </div>
                    <h3 className="font-heading font-semibold" style={{ color: cat.color }}>
                      {cat.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-muted/50 border border-border/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
        </div>

        {/* Dynamic Project Technologies Section */}
        {projectTechnologies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10"
          >
            <div className="glass-card rounded-2xl p-6 sm:p-8" style={{ boxShadow: '0 0 30px #f59e0b15' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9">
                  <SkillIcon type="project" color="#f59e0b" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-amber-500">
                    Technologies from My Projects
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-synced from {projects.length} project{projects.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {projectTechnologies.map((tech, index) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative"
                  >
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-default"
                    >
                      {tech.name}
                      {tech.count > 1 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-[10px] font-bold">
                          {tech.count}
                        </span>
                      )}
                    </span>
                    
                    {/* Tooltip showing projects */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-max max-w-xs">
                      <p className="text-xs text-muted-foreground mb-1">Used in:</p>
                      <ul className="text-xs font-medium">
                        {tech.projects.map((proj) => (
                          <li key={proj} className="text-foreground">• {proj}</li>
                        ))}
                      </ul>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-border" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer - Currently Building */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mt-12 text-center"
        >
          <p className="text-xs uppercase tracking-widest mb-4">Currently building with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {currentlyBuilding.map((tech) => (
              <span key={tech} className="px-4 py-2 rounded-xl text-xs font-mono glass-card border">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Skills;