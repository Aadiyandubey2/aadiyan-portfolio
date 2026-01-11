import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Background3D from "./Background3D";
import { useSkills, useSiteContent } from "@/hooks/useSiteContent";

/* ---------------- ICONS ---------------- */

const SkillIcon = ({ type, color }: { type: string; color: string }) => {
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
};

/* ---------------- TYPES & FALLBACK ---------------- */

interface SkillCategoryType {
  id: string;
  title: string;
  color: string;
  icon: string;
  skills: string[];
}

const defaultSkillCategories: SkillCategoryType[] = [
  {
    id: "1",
    title: "Frontend",
    color: "#00d4ff",
    icon: "code",
    skills: ["React", "TypeScript", "Tailwind", "HTML", "CSS"],
  },
  {
    id: "2",
    title: "Backend",
    color: "#8b5cf6",
    icon: "server",
    skills: ["Node.js", "Express", "Supabase", "JWT", "REST APIs"],
  },
  {
    id: "3",
    title: "Database & Tools",
    color: "#3b82f6",
    icon: "database",
    skills: ["PostgreSQL", "MySQL", "Git", "Postman"],
  },
  {
    id: "4",
    title: "Other",
    color: "#10b981",
    icon: "sparkle",
    skills: ["UI/UX", "SEO", "Performance"],
  },
];

/* ---------------- ANIMATION (NO CHUNKING) ---------------- */

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

/* ---------------- CARD ---------------- */

const SkillCard = ({ category, isInView }: { category: SkillCategoryType; isInView: boolean }) => {
  return (
    <motion.div
      variants={fadeIn}
      initial={false}
      animate={isInView ? "visible" : undefined}
      className="glass-card rounded-2xl p-5 sm:p-6"
      whileHover={{
        scale: 1.03,
        transition: { type: "spring", stiffness: 260, damping: 18 },
      }}
      style={{ boxShadow: `0 0 30px ${category.color}15` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9">
          <SkillIcon type={category.icon} color={category.color} />
        </div>
        <h3 className="font-heading font-semibold" style={{ color: category.color }}>
          {category.title}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {category.skills.map((skill) => (
          <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-muted/50 border border-border/30">
            {skill}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

/* ---------------- MAIN SECTION ---------------- */

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { skills: dbSkills, isLoading } = useSkills();
  const { content } = useSiteContent();

  const skillCategories = dbSkills.length ? dbSkills : defaultSkillCategories;
  const currentlyBuilding = content?.currently_building?.length
    ? content.currently_building
    : ["React", "Node.js", "Supabase", "Tailwind"];

  return (
    <section id="skills" className="relative py-24 overflow-hidden">
      <Background3D variant="section" color="#00d4ff" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div ref={ref} className="relative max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          variants={fadeIn}
          initial={false}
          animate={isInView ? "visible" : undefined}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-xs font-mono border mb-5">
            &lt;/&gt; Tech Stack
          </span>
          <h2 className="text-4xl font-thin">
            Skills <span className="text-blue-700">& Technologies</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card h-40 animate-pulse rounded-2xl" />
              ))
            : skillCategories.map((cat) => <SkillCard key={cat.id} category={cat} isInView={isInView} />)}
        </div>

        {/* Footer */}
        <motion.div
          variants={fadeIn}
          initial={false}
          animate={isInView ? "visible" : undefined}
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
};

export default Skills;
