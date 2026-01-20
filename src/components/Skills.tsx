import { motion, type Variants } from "framer-motion";
import { useMemo } from "react";
import Background3D from "./Background3D";
import { useSkills, useSiteContent, useProjects, useOrbitSkills } from "@/hooks/useSiteContent";
import OrbitingSkills, { type OrbitConfig, type SkillItem } from "@/components/ui/orbiting-skills";

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
  };

  return icons[type] || icons.sparkle;
}

/* ---------------- PROJECT BADGE ICON ---------------- */

function ProjectBadge({ projectNames }: { projectNames: string[] }) {
  const count = projectNames.length;
  const tooltipText = count === 1 
    ? `Used in: ${projectNames[0]}` 
    : `Used in ${count} projects: ${projectNames.join(', ')}`;
  
  return (
    <span 
      className="inline-flex items-center justify-center w-4 h-4 ml-1 rounded-full bg-amber-500/20 border border-amber-500/40 cursor-help group relative"
      title={tooltipText}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5">
        <path 
          d="M3 7L12 3L21 7V17L12 21L3 17V7Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinejoin="round" 
          className="text-amber-500"
        />
      </svg>
      {/* Enhanced tooltip on hover */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover border border-border text-[10px] text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {count} project{count > 1 ? 's' : ''}
      </span>
    </span>
  );
}

/* ---------------- TYPES ---------------- */

interface SkillCategory {
  id: string;
  title: string;
  color: string;
  icon: string;
  skills: string[];
}

interface SkillWithSource {
  name: string;
  fromProject: boolean;
  projectNames: string[];
}

interface MergedCategory {
  id: string;
  title: string;
  color: string;
  icon: string;
  skills: SkillWithSource[];
}

/* ---------------- SKILL CATEGORIZATION ---------------- */

const categoryKeywords: Record<string, string[]> = {
  frontend: [
    'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'gatsby',
    'html', 'css', 'scss', 'sass', 'less', 'tailwind', 'bootstrap', 'chakra', 'material',
    'javascript', 'typescript', 'jquery', 'redux', 'zustand', 'mobx',
    'framer', 'motion', 'gsap', 'three', 'webgl', 'd3', 'canvas',
    'webpack', 'vite', 'parcel', 'rollup', 'esbuild',
    'pwa', 'responsive', 'accessibility', 'a11y',
    'storybook', 'styled-components', 'emotion', 'radix'
  ],
  backend: [
    'node', 'express', 'fastify', 'nest', 'koa', 'hapi',
    'python', 'django', 'flask', 'fastapi',
    'java', 'spring', 'kotlin',
    'php', 'laravel', 'symfony',
    'ruby', 'rails',
    'go', 'golang', 'rust', 'c#', '.net', 'asp',
    'graphql', 'rest', 'api', 'microservice', 'serverless',
    'jwt', 'oauth', 'auth', 'authentication', 'authorization',
    'supabase', 'firebase', 'aws', 'azure', 'gcp', 'lambda',
    'docker', 'kubernetes', 'nginx', 'apache',
    'websocket', 'socket.io', 'grpc', 'rabbitmq', 'kafka',
    'resend', 'sendgrid', 'twilio'
  ],
  database: [
    'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mariadb',
    'mongodb', 'dynamodb', 'cassandra', 'redis', 'memcached',
    'prisma', 'typeorm', 'sequelize', 'knex', 'drizzle',
    'git', 'github', 'gitlab', 'bitbucket', 'svn',
    'vs code', 'vscode', 'vim', 'neovim', 'intellij', 'webstorm',
    'postman', 'insomnia', 'swagger',
    'jira', 'trello', 'notion', 'slack', 'discord',
    'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
    'terminal', 'bash', 'zsh', 'powershell',
    'npm', 'yarn', 'pnpm', 'bun'
  ],
  other: [
    'seo', 'analytics', 'marketing', 'content',
    'ui', 'ux', 'design', 'wireframe', 'prototype', 'mockup',
    'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'testing',
    'jest', 'cypress', 'playwright', 'vitest', 'mocha',
    'performance', 'optimization', 'caching', 'cdn',
    'security', 'penetration', 'vulnerability',
    'ai', 'ml', 'machine learning', 'deep learning', 'nlp', 'open-source',
    'video', 'editing', 'premiere', 'after effects', 'davinci',
    'dsa', 'algorithm', 'data structure', 'leetcode',
    'mapping', 'gis', 'geolocation'
  ]
};

function categorizeSkill(skill: string): 'frontend' | 'backend' | 'database' | 'other' {
  const normalizedSkill = skill.toLowerCase().trim();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => normalizedSkill.includes(keyword))) {
      return category as 'frontend' | 'backend' | 'database' | 'other';
    }
  }
  
  return 'other';
}

/* ---------------- FALLBACK DATA ---------------- */

const defaultSkillCategories: SkillCategory[] = [
  { id: "1", title: "Frontend", color: "#00d4ff", icon: "code", skills: ["React", "TypeScript", "Tailwind", "HTML", "CSS"] },
  { id: "2", title: "Backend", color: "#8b5cf6", icon: "server", skills: ["Node.js", "Express", "Supabase", "JWT", "REST APIs"] },
  { id: "3", title: "Database & Tools", color: "#3b82f6", icon: "database", skills: ["PostgreSQL", "MySQL", "Git", "Postman"] },
  { id: "4", title: "Other", color: "#10b981", icon: "sparkle", skills: ["UI/UX", "SEO", "Performance"] },
];

const categoryMapping: Record<string, number> = {
  frontend: 0,
  backend: 1,
  database: 2,
  other: 3,
};

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
  const { orbitSkills, isLoading: orbitLoading } = useOrbitSkills();

  const isLoading = skillsLoading || projectsLoading || orbitLoading;

  // Merge database skills with project technologies, tracking source and project names
  const mergedSkillCategories = useMemo<MergedCategory[]>(() => {
    // Build a map of tech -> project names for quick lookup
    const techToProjects = new Map<string, string[]>();
    projects.forEach((project) => {
      if (project.tech_stack && Array.isArray(project.tech_stack)) {
        project.tech_stack.forEach((tech) => {
          const normalizedTech = tech.toLowerCase().trim();
          if (normalizedTech) {
            const existing = techToProjects.get(normalizedTech) || [];
            if (!existing.includes(project.title)) {
              techToProjects.set(normalizedTech, [...existing, project.title]);
            }
          }
        });
      }
    });

    // Start with database skills or fallback, mark as NOT from project
    const baseCategories = (dbSkills.length ? dbSkills : defaultSkillCategories).map(cat => ({
      id: cat.id,
      title: cat.title,
      color: cat.color,
      icon: cat.icon,
      skills: cat.skills.map(skill => ({ 
        name: skill, 
        fromProject: false, 
        projectNames: [] as string[] 
      }))
    }));

    if (!projects.length) return baseCategories;

    // Create a set of existing skills (normalized) for quick lookup
    const existingSkills = new Set<string>();
    baseCategories.forEach(cat => {
      cat.skills.forEach(skill => existingSkills.add(skill.name.toLowerCase().trim()));
    });

    // Categorize and add new skills from projects
    techToProjects.forEach((projectNames, normalizedTech) => {
      // Skip if skill already exists
      if (existingSkills.has(normalizedTech)) return;
      
      // Get original tech name (first project's version)
      const originalTech = projects.find(p => 
        p.tech_stack?.some(t => t.toLowerCase().trim() === normalizedTech)
      )?.tech_stack?.find(t => t.toLowerCase().trim() === normalizedTech) || normalizedTech;
      
      // Categorize the skill
      const category = categorizeSkill(originalTech);
      const categoryIndex = categoryMapping[category];
      
      if (categoryIndex !== undefined && baseCategories[categoryIndex]) {
        baseCategories[categoryIndex].skills.push({ 
          name: originalTech, 
          fromProject: true, 
          projectNames 
        });
        existingSkills.add(normalizedTech);
      }
    });

    return baseCategories;
  }, [dbSkills, projects]);

  // Build orbit configuration from database orbit skills - with mobile-friendly radii
  const orbitConfig = useMemo<OrbitConfig[]>(() => {
    if (!orbitSkills.length) return [];

    const innerSkills = orbitSkills.filter(s => s.orbit_index === 0);
    const outerSkills = orbitSkills.filter(s => s.orbit_index === 1);
    
    // Check if mobile (will be re-evaluated on resize via component)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    
    const orbits: OrbitConfig[] = [];
    
    if (innerSkills.length > 0) {
      orbits.push({
        radius: isMobile ? 60 : 85,
        speed: 0.6,
        glowColor: 'cyan',
        skills: innerSkills.map(s => ({
          id: s.id,
          name: s.name,
          icon: s.icon,
          icon_url: s.icon_url,
          color: s.color,
        })),
      });
    }
    
    if (outerSkills.length > 0) {
      orbits.push({
        radius: isMobile ? 105 : 150,
        speed: -0.4,
        glowColor: 'purple',
        skills: outerSkills.map(s => ({
          id: s.id,
          name: s.name,
          icon: s.icon,
          icon_url: s.icon_url,
          color: s.color,
        })),
      });
    }

    return orbits;
  }, [orbitSkills]);

  const currentlyBuilding = content?.currently_building?.length
    ? content.currently_building
    : ["React", "Node.js", "Supabase", "Tailwind"];

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
            : mergedSkillCategories.map((cat, index) => (
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
                      <span 
                        key={skill.name} 
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono border ${
                          skill.fromProject 
                            ? 'bg-amber-500/10 border-amber-500/30' 
                            : 'bg-muted/50 border-border/30'
                        }`}
                      >
                        {skill.name}
                        {skill.fromProject && <ProjectBadge projectNames={skill.projectNames} />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex justify-center gap-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-muted/50 border border-border/30" />
            <span>Manual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40">
              <svg viewBox="0 0 24 24" fill="none" className="w-2 h-2">
                <path d="M3 7L12 3L21 7V17L12 21L3 17V7Z" stroke="currentColor" strokeWidth="3" className="text-amber-500" />
              </svg>
            </span>
            <span>From Projects</span>
          </div>
        </motion.div>

        {/* Orbiting Skills Visual - Below skills grid - Now visible on all devices */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16"
        >
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6 sm:mb-8">
            Skills Visualization
          </p>
          <OrbitingSkills 
            orbits={orbitConfig.length > 0 ? orbitConfig : undefined} 
            centerLabel="Tech Stack"
            className="max-w-[280px] sm:max-w-[350px] md:max-w-[400px]"
          />
        </motion.div>

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