import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const skillCategories = [
  {
    title: 'Frontend',
    color: '#00d4ff',
    skills: ['React.js', 'HTML5/CSS3', 'Tailwind CSS', 'JavaScript', 'TypeScript'],
  },
  {
    title: 'Backend',
    color: '#8b5cf6',
    skills: ['Node.js', 'Express.js', 'Supabase', 'REST APIs', 'JWT Auth'],
  },
  {
    title: 'Database & Tools',
    color: '#3b82f6',
    skills: ['MySQL', 'PostgreSQL', 'Git/GitHub', 'VS Code', 'Postman'],
  },
  {
    title: 'Other',
    color: '#10b981',
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
      <div className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-glow-cyan">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color, boxShadow: `0 0 12px ${category.color}` }}
          />
          <h3 className="font-heading font-bold text-lg tracking-wide" style={{ color: category.color }}>
            {category.title}
          </h3>
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2">
          {category.skills.map((skill, skillIndex) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: index * 0.1 + skillIndex * 0.05 }}
              className="px-3 py-1.5 rounded-lg text-sm font-mono bg-muted/50 text-foreground/80 border border-border/30 hover:border-primary/50 hover:text-primary transition-all duration-300"
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
    <section id="skills" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />

      <div className="relative max-w-6xl mx-auto px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-5 py-2.5 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-6">
            &lt;/&gt; Tech Stack
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">
            Skills & <span className="neon-text">Technologies</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-body">
            Technologies I use to build production-ready applications.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {skillCategories.map((category, index) => (
            <SkillCard key={category.title} category={category} index={index} isInView={isInView} />
          ))}
        </div>

        {/* Current Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="font-mono text-xs text-muted-foreground mb-4 uppercase tracking-widest">Currently building with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Node.js', 'Supabase', 'Tailwind CSS', 'SEO'].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                className="px-4 py-2 rounded-xl text-sm font-mono text-primary glass-card border border-primary/30"
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