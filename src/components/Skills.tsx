import { motion, useInView } from 'framer-motion';
import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox, Icosahedron, Octahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';

// 3D Floating Skill Icon Component
const SkillIcon3D = ({ color, geometry, position, speed = 1 }: { 
  color: string; 
  geometry: 'box' | 'sphere' | 'torus' | 'octahedron';
  position: [number, number, number];
  speed?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.3;
      meshRef.current.rotation.y += 0.008 * speed;
    }
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'sphere':
        return (
          <Icosahedron args={[0.6, 1]} ref={meshRef}>
            <MeshDistortMaterial color={color} speed={2} distort={0.2} radius={1} />
          </Icosahedron>
        );
      case 'torus':
        return (
          <Torus args={[0.5, 0.2, 16, 32]} ref={meshRef}>
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </Torus>
        );
      case 'octahedron':
        return (
          <Octahedron args={[0.6]} ref={meshRef}>
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} wireframe />
          </Octahedron>
        );
      default:
        return (
          <RoundedBox args={[0.8, 0.8, 0.8]} radius={0.1} smoothness={4} ref={meshRef}>
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
          </RoundedBox>
        );
    }
  };

  return (
    <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={1.5}>
      <group position={position}>
        {renderGeometry()}
        <pointLight position={[0, 0, 0]} intensity={0.5} color={color} distance={3} />
      </group>
    </Float>
  );
};

// 3D Scene for skill category
const SkillScene = ({ color, geometry }: { color: string; geometry: 'box' | 'sphere' | 'torus' | 'octahedron' }) => {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }} className="!absolute inset-0">
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
      <SkillIcon3D color={color} geometry={geometry} position={[0, 0, 0]} speed={1} />
    </Canvas>
  );
};

const skillCategories = [
  {
    title: 'Frontend Development',
    icon: '🌐',
    geometry: 'sphere' as const,
    color: '#00d4ff',
    skills: [
      { name: 'React.js', level: 90 },
      { name: 'HTML5/CSS3', level: 95 },
      { name: 'Tailwind CSS', level: 88 },
      { name: 'JavaScript (ES6+)', level: 88 },
      { name: 'TypeScript', level: 75 },
    ],
  },
  {
    title: 'Backend Development',
    icon: '⚙️',
    geometry: 'box' as const,
    color: '#8b5cf6',
    skills: [
      { name: 'Node.js', level: 85 },
      { name: 'Express.js', level: 85 },
      { name: 'Supabase', level: 88 },
      { name: 'REST APIs', level: 82 },
      { name: 'JWT Authentication', level: 85 },
    ],
  },
  {
    title: 'Database & Tools',
    icon: '🗄️',
    geometry: 'torus' as const,
    color: '#3b82f6',
    skills: [
      { name: 'MySQL', level: 80 },
      { name: 'PostgreSQL', level: 78 },
      { name: 'Git/GitHub', level: 90 },
      { name: 'VS Code', level: 95 },
      { name: 'Postman', level: 82 },
    ],
  },
  {
    title: 'Other Skills',
    icon: '🚀',
    geometry: 'octahedron' as const,
    color: '#10b981',
    skills: [
      { name: 'SEO Optimization', level: 88 },
      { name: 'UI/UX Design', level: 78 },
      { name: 'Java (Basic DSA)', level: 72 },
      { name: 'Video Editing', level: 70 },
      { name: 'Performance Optimization', level: 80 },
    ],
  },
];

const SkillBar = ({ skill, isInView, delay }: { skill: { name: string; level: number }; isInView: boolean; delay: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-sm text-foreground/90 group-hover:text-primary transition-colors duration-300">
          {skill.name}
        </span>
        <span className="font-mono text-xs text-primary font-semibold">
          {skill.level}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[gradient-x_2s_ease-in-out_infinite]" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const SkillCard = ({ category, index, isInView }: { category: typeof skillCategories[0]; index: number; isInView: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <div className="relative glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-glow-cyan">
        {/* 3D Icon Background */}
        <div className="h-32 relative overflow-hidden">
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full animate-pulse" style={{ backgroundColor: category.color + '20' }} />
            </div>
          }>
            <SkillScene color={category.color} geometry={category.geometry} />
          </Suspense>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          
          {/* Category Title */}
          <div className="absolute bottom-4 left-6 right-6">
            <h3 className="font-heading font-bold text-lg tracking-wider" style={{ color: category.color }}>
              {category.title}
            </h3>
          </div>
        </div>

        {/* Skills List */}
        <div className="p-6 pt-2 space-y-4">
          {category.skills.map((skill, skillIndex) => (
            <SkillBar
              key={skill.name}
              skill={skill}
              isInView={isInView}
              delay={index * 0.1 + skillIndex * 0.08}
            />
          ))}
        </div>

        {/* Hover Glow Effect */}
        <div 
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10"
          style={{ background: `linear-gradient(135deg, ${category.color}40, transparent)` }}
        />
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="skills" className="relative py-24 md:py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Large Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="relative max-w-7xl mx-auto px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block px-5 py-2.5 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-6"
          >
            &lt;/&gt; Technical Arsenal
          </motion.span>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 tracking-tight">
            Skills & <span className="neon-text">Technologies</span>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto font-body text-lg leading-relaxed">
            Specialized in building production-ready web applications with modern technologies. 
            Creator of <a href="https://vishwaguru.site" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">VishwaGuru.site</a>.
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

        {/* Tech Stack Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="font-mono text-sm text-muted-foreground mb-6">Currently working with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Node.js', 'Express.js', 'Supabase', 'Tailwind CSS', 'SEO', 'JWT Auth'].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-5 py-2.5 rounded-xl text-sm font-mono text-foreground/80 glass-card border border-border/30 hover:border-primary/50 hover:text-primary transition-all duration-300 cursor-default"
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