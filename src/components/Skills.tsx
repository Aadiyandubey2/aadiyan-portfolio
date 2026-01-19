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

/* ---------------- SKILL CATEGORIZATION ---------------- */

// Keywords to categorize skills automatically
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
  
  return 'other'; // Default to "Other" if no match
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

  const isLoading = skillsLoading || projectsLoading;

  // Merge database skills with project technologies
  const mergedSkillCategories = useMemo<SkillCategory[]>(() => {
    // Start with database skills or fallback
    const baseCategories = dbSkills.length 
      ? dbSkills.map(cat => ({ ...cat, skills: [...cat.skills] }))
      : defaultSkillCategories.map(cat => ({ ...cat, skills: [...cat.skills] }));

    if (!projects.length) return baseCategories;

    // Extract all unique technologies from projects
    const projectTechs = new Set<string>();
    projects.forEach((project) => {
      if (project.tech_stack && Array.isArray(project.tech_stack)) {
        project.tech_stack.forEach((tech) => {
          const normalizedTech = tech.trim();
          if (normalizedTech) projectTechs.add(normalizedTech);
        });
      }
    });

    // Create a set of existing skills (normalized) for quick lookup
    const existingSkills = new Set<string>();
    baseCategories.forEach(cat => {
      cat.skills.forEach(skill => existingSkills.add(skill.toLowerCase().trim()));
    });

    // Categorize and add new skills from projects
    projectTechs.forEach((tech) => {
      const normalizedTech = tech.toLowerCase().trim();
      
      // Skip if skill already exists
      if (existingSkills.has(normalizedTech)) return;
      
      // Categorize the skill
      const category = categorizeSkill(tech);
      const categoryIndex = categoryMapping[category];
      
      if (categoryIndex !== undefined && baseCategories[categoryIndex]) {
        baseCategories[categoryIndex].skills.push(tech);
        existingSkills.add(normalizedTech);
      }
    });

    return baseCategories;
  }, [dbSkills, projects]);

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
                      <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-muted/50 border border-border/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
        </div>

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