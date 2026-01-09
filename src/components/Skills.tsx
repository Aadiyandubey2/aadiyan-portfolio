import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Background3D from "./Background3D";
import { useSkills, useSiteContent } from "@/hooks/useSiteContent";

// Clean stroke-only icons
const SkillIcon = ({
  type,
  color
}: {
  type: string;
  color: string;
}) => {
  const icons: Record<string, JSX.Element> = {
    code: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M16 18L22 12L16 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6L2 12L8 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>,
    server: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="3" y="3" width="18" height="6" rx="1" stroke={color} strokeWidth="1.5" />
        <rect x="3" y="15" width="18" height="6" rx="1" stroke={color} strokeWidth="1.5" />
        <circle cx="7" cy="6" r="1" fill={color} />
        <circle cx="7" cy="18" r="1" fill={color} />
        <path d="M11 6H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 18H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>,
    database: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <ellipse cx="12" cy="6" rx="8" ry="3" stroke={color} strokeWidth="1.5" />
        <path d="M4 6V18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V6" stroke={color} strokeWidth="1.5" />
        <path d="M4 12C4 13.66 7.58 15 12 15C16.42 15 20 13.66 20 12" stroke={color} strokeWidth="1.5" />
      </svg>,
    sparkle: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 2V6M12 18V22M6 12H2M22 12H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
      </svg>
  };
  return icons[type] || icons.sparkle;
};

// Fallback data
const defaultSkillCategories = [{
  id: "1",
  title: "Frontend",
  color: "#00d4ff",
  icon: "code",
  skills: ["React.js", "HTML5/CSS3", "Tailwind CSS", "JavaScript", "TypeScript"],
  category: "frontend",
  display_order: 1
}, {
  id: "2",
  title: "Backend",
  color: "#8b5cf6",
  icon: "server",
  skills: ["Node.js", "Express.js", "Supabase", "REST APIs", "JWT Auth"],
  category: "backend",
  display_order: 2
}, {
  id: "3",
  title: "Database & Tools",
  color: "#3b82f6",
  icon: "database",
  skills: ["MySQL", "PostgreSQL", "Git/GitHub", "VS Code", "Postman"],
  category: "database",
  display_order: 3
}, {
  id: "4",
  title: "Other",
  color: "#10b981",
  icon: "sparkle",
  skills: ["SEO Optimization", "UI/UX Design", "Java (DSA)", "Video Editing", "Performance"],
  category: "other",
  display_order: 4
}];
interface SkillCategoryType {
  id: string;
  title: string;
  color: string;
  icon: string;
  skills: string[];
  category: string;
  display_order: number;
}
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      delay: i * 0.15
    }
  })
};
const skillTagVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 10
  },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 150,
      damping: 12,
      delay: i * 0.04
    }
  })
};
const SkillCard = ({
  category,
  index,
  isInView
}: {
  category: SkillCategoryType;
  index: number;
  isInView: boolean;
}) => {
  return <motion.div custom={index} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={cardVariants} whileHover={{
    scale: 1.03,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }} className="group relative">
      <motion.div className="glass-card rounded-2xl p-5 sm:p-6 transition-all duration-300" style={{
      boxShadow: `0 0 30px ${category.color}15`
    }} whileHover={{
      boxShadow: `0 0 50px ${category.color}30`
    }}>
        {/* Header with Icon */}
        <motion.div className="flex items-center gap-3 mb-5" initial={{
        opacity: 0,
        x: -20
      }} animate={isInView ? {
        opacity: 1,
        x: 0
      } : {}} transition={{
        type: "spring",
        stiffness: 120,
        damping: 14,
        delay: index * 0.15 + 0.1
      }}>
          <motion.div className="w-8 h-8 sm:w-9 sm:h-9" whileHover={{
          rotate: 10,
          scale: 1.1
        }} transition={{
          type: "spring",
          stiffness: 300
        }}>
            <SkillIcon type={category.icon} color={category.color} />
          </motion.div>
          <h3 className="font-heading font-bold text-base sm:text-lg tracking-wide" style={{
          color: category.color
        }}>
            {category.title}
          </h3>
        </motion.div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {(category.skills || []).map((skill, skillIndex) => <motion.span key={skill} custom={skillIndex} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={skillTagVariants} whileHover={{
          scale: 1.08,
          y: -2,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 15
          }
        }} className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-mono bg-muted/50 text-foreground/80 border border-border/30 hover:border-primary/50 hover:text-primary hover:bg-primary/10 cursor-default transition-colors duration-200">
              {skill}
            </motion.span>)}
        </div>
      </motion.div>
    </motion.div>;
};
const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-50px"
  });
  const {
    skills: dbSkills,
    isLoading
  } = useSkills();
  const {
    content
  } = useSiteContent();
  const skillCategories = dbSkills.length > 0 ? dbSkills : defaultSkillCategories;
  const currentlyBuilding = content?.currently_building?.length ? content.currently_building : ["React", "Node.js", "Supabase", "Tailwind CSS", "SEO"];
  return <section id="skills" className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
      {/* 3D Background */}
      <Background3D variant="section" color="#00d4ff" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Section Header */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={isInView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.6
      }} className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-card text-xs sm:text-sm font-mono text-primary border border-primary/30 mb-4 sm:mb-6">
            &lt;/&gt; Tech Stack
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 tracking-tight font-serif font-thin">
            Skills &{" "}
            <span className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 tracking-tight text-blue-700 font-serif font-thin">
              Technologies
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-body text-sm sm:text-base">
            Technologies I use to create my Webapps.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {isLoading ?
        // Loading skeleton
        Array.from({
          length: 4
        }).map((_, index) => <div key={index} className="glass-card rounded-2xl p-5 sm:p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-muted rounded" />
                    <div className="h-5 w-24 bg-muted rounded" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({
              length: 5
            }).map((_, i) => <div key={i} className="h-7 w-20 bg-muted rounded-lg" />)}
                  </div>
                </div>) : skillCategories.map((category, index) => <SkillCard key={category.id || category.title} category={category} index={index} isInView={isInView} />)}
        </div>

        {/* Current Focus */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={isInView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.6,
        delay: 0.5
      }} className="mt-8 sm:mt-12 text-center">
          <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4 uppercase tracking-widest">
            Currently building with
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {currentlyBuilding.map((tech, index) => <motion.span key={tech} initial={{
            opacity: 0,
            y: 10
          }} animate={isInView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.3,
            delay: 0.6 + index * 0.05
          }} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-mono text-primary glass-card border border-primary/30">
                {tech}
              </motion.span>)}
          </div>
        </motion.div>
      </div>
    </section>;
};
export default Skills;