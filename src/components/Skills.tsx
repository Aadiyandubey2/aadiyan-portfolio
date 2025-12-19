import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Background3D from './Background3D';

// Clean stroke-only icons
const SkillIcon = ({ type, color }: { type: string; color: string }) => {
  const icons: Record<string, JSX.Element> = {
    code: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M16 18L22 12L16 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 6L2 12L8 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    server: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="3" y="3" width="18" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
        <rect x="3" y="15" width="18" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
        <circle cx="7" cy="6" r="1" fill={color}/>
        <circle cx="7" cy="18" r="1" fill={color}/>
        <path d="M11 6H17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 18H17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    database: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <ellipse cx="12" cy="6" rx="8" ry="3" stroke={color} strokeWidth="1.5"/>
        <path d="M4 6V18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V6" stroke={color} strokeWidth="1.5"/>
        <path d="M4 12C4 13.66 7.58 15 12 15C16.42 15 20 13.66 20 12" stroke={color} strokeWidth="1.5"/>
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 2V6M12 18V22M6 12H2M22 12H18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5"/>
      </svg>
    ),
  };

  return icons[type] || icons.sparkle;
};

const skillCategories = [
  {
    title: 'Frontend',
    color: '#00d4ff',
    icon: 'code',
    skills: ['React.js', 'HTML5/CSS3', 'Tailwind CSS', 'JavaScript', 'TypeScript'],
  },
  {
    title: 'Backend',
    color: '#8b5cf6',
    icon: 'server',
    skills: ['Node.js', 'Express.js', 'Supabase', 'REST APIs', 'JWT Auth'],
  },
  {
    title: 'Database & Tools',
    color: '#3b82f6',
    icon: 'database',
    skills: ['MySQL', 'PostgreSQL', 'Git/GitHub', 'VS Code', 'Postman'],
  },
  {
    title: 'Other',
    color: '#10b981',
    icon: 'sparkle',
    skills: ['SEO Optimization', 'UI/UX Design', 'Java (DSA)', 'Video Editing', 'Performance'],
  },
];

const SkillCard = ({ category, index, isInView }: { category: typeof skillCategories[0]; index: number; isInView: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="glass-card rounded-2xl p-5 sm:p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg" style={{ boxShadow: `0 0 30px ${category.color}15` }}>
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 sm:w-9 sm:h-9">
            <SkillIcon type={category.icon} color={category.color} />
          </div>
          <h3 className="font-heading font-bold text-base sm:text-lg tracking-wide" style={{ color: category.color }}>
            {category.title}
          </h3>
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {category.skills.map((skill, skillIndex) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: index * 0.1 + skillIndex * 0.05 }}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-mono bg-muted/50 text-foreground/80 border border-border/30 hover:border-primary/50 hover:text-primary transition-all duration-300"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="skills" className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
      {/* 3D Background */}
      <Background3D variant="section" color="#00d4ff" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-card text-xs sm:text-sm font-mono text-primary border border-primary/30 mb-4 sm:mb-6">
            &lt;/&gt; Tech Stack
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-3 sm:mb-4 tracking-tight">
            Skills & <span className="neon-text">Technologies</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-body text-sm sm:text-base">
            Technologies I use to build production-ready applications.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {skillCategories.map((category, index) => (
            <SkillCard key={category.title} category={category} index={index} isInView={isInView} />
          ))}
        </div>

        {/* Current Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 sm:mt-12 text-center"
        >
          <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4 uppercase tracking-widest">Currently building with</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {['React', 'Node.js', 'Supabase', 'Tailwind CSS', 'SEO'].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-mono text-primary glass-card border border-primary/30"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;