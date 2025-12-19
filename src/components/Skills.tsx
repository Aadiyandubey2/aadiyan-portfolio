import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const skillCategories = [
  {
    title: 'Web Development',
    icon: '🌐',
    skills: [
      { name: 'React', level: 88, color: 'from-cyan-400 to-cyan-600' },
      { name: 'Node.js', level: 85, color: 'from-green-400 to-green-600' },
      { name: 'Express.js', level: 82, color: 'from-gray-400 to-gray-600' },
      { name: 'HTML/CSS', level: 92, color: 'from-orange-400 to-orange-600' },
      { name: 'Tailwind CSS', level: 88, color: 'from-teal-400 to-teal-600' },
    ],
  },
  {
    title: 'Programming & DSA',
    icon: '💻',
    skills: [
      { name: 'JavaScript', level: 85, color: 'from-yellow-300 to-amber-500' },
      { name: 'Java', level: 75, color: 'from-red-400 to-red-600' },
      { name: 'TypeScript', level: 72, color: 'from-blue-400 to-blue-600' },
      { name: 'Data Structures', level: 70, color: 'from-purple-400 to-purple-600' },
      { name: 'Algorithms', level: 68, color: 'from-pink-400 to-pink-600' },
    ],
  },
  {
    title: 'Database & Backend',
    icon: '🗄️',
    skills: [
      { name: 'MySQL', level: 80, color: 'from-blue-400 to-blue-700' },
      { name: 'Supabase', level: 82, color: 'from-green-400 to-green-700' },
      { name: 'JWT Authentication', level: 85, color: 'from-violet-400 to-violet-600' },
      { name: 'REST APIs', level: 80, color: 'from-indigo-400 to-indigo-600' },
      { name: 'Full Stack Dev', level: 78, color: 'from-emerald-400 to-emerald-600' },
    ],
  },
  {
    title: 'Tools & SEO',
    icon: '🛠️',
    skills: [
      { name: 'SEO Optimization', level: 85, color: 'from-yellow-400 to-yellow-600' },
      { name: 'Git/GitHub', level: 88, color: 'from-gray-400 to-gray-700' },
      { name: 'VS Code', level: 92, color: 'from-blue-400 to-blue-700' },
      { name: 'Video Editing', level: 70, color: 'from-pink-400 to-pink-600' },
      { name: 'UI/UX Design', level: 75, color: 'from-purple-400 to-purple-600' },
    ],
  },
];

const SkillBar = ({ skill, isInView, delay }: { skill: { name: string; level: number; color: string }; isInView: boolean; delay: number }) => {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors">
          {skill.name}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {skill.level}%
        </span>
      </div>
      <div className="skill-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
          className={`skill-bar-fill bg-gradient-to-r ${skill.color}`}
        />
      </div>
    </div>
  );
};

const SkillCard = ({ category, index, isInView }: { category: typeof skillCategories[0]; index: number; isInView: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group perspective-1000"
    >
      <div 
        className={`glass-card p-6 rounded-2xl transition-all duration-500 ${
          isHovered ? 'scale-[1.02]' : ''
        }`}
        style={{
          transform: isHovered ? 'rotateX(5deg) rotateY(5deg)' : 'rotateX(0) rotateY(0)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow Effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-secondary/50 to-accent/50 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500`} />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{category.icon}</span>
            <h3 className="font-heading font-semibold text-lg">{category.title}</h3>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            {category.skills.map((skill, skillIndex) => (
              <SkillBar 
                key={skill.name} 
                skill={skill} 
                isInView={isInView} 
                delay={index * 0.1 + skillIndex * 0.1} 
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-4">
            Technical Skills
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            My <span className="neon-text">Expertise</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-body">
            A comprehensive overview of my technical skills in web development, programming, and digital technologies.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {skillCategories.map((category, index) => (
            <SkillCard 
              key={category.title} 
              category={category} 
              index={index} 
              isInView={isInView} 
            />
          ))}
        </div>

        {/* Additional Skills Tags */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <h4 className="font-heading font-semibold mb-4 text-muted-foreground">Also familiar with:</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {['Performance Optimization', 'Responsive Design', 'Agile/Scrum', 'Content Creation', 'Event Management', 'Hindi/English'].map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                className="px-4 py-2 rounded-full text-sm font-mono text-muted-foreground border border-border/50 hover:border-primary/50 hover:text-primary transition-colors cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;