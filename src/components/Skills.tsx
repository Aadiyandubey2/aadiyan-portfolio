import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// 3D Icon Component
const Icon3D = ({ color, shape }: { color: string; shape: 'box' | 'sphere' | 'octahedron' | 'torus' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        {shape === 'box' && <boxGeometry args={[0.8, 0.8, 0.8]} />}
        {shape === 'sphere' && <sphereGeometry args={[0.5, 16, 16]} />}
        {shape === 'octahedron' && <octahedronGeometry args={[0.5]} />}
        {shape === 'torus' && <torusGeometry args={[0.4, 0.15, 8, 24]} />}
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
};

const skillCategories = [
  {
    title: 'Frontend',
    color: '#00d4ff',
    shape: 'box' as const,
    skills: ['React.js', 'HTML5/CSS3', 'Tailwind CSS', 'JavaScript', 'TypeScript'],
  },
  {
    title: 'Backend',
    color: '#8b5cf6',
    shape: 'sphere' as const,
    skills: ['Node.js', 'Express.js', 'Supabase', 'REST APIs', 'JWT Auth'],
  },
  {
    title: 'Database & Tools',
    color: '#3b82f6',
    shape: 'octahedron' as const,
    skills: ['MySQL', 'PostgreSQL', 'Git/GitHub', 'VS Code', 'Postman'],
  },
  {
    title: 'Other',
    color: '#10b981',
    shape: 'torus' as const,
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
      <div className="glass-card rounded-2xl p-5 sm:p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-glow-cyan">
        {/* Header with 3D Icon */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden">
            <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[2, 2, 2]} intensity={1} />
              <Icon3D color={category.color} shape={category.shape} />
            </Canvas>
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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />

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