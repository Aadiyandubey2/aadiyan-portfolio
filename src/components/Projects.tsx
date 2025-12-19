import { motion, useInView } from 'framer-motion';
import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, Box, Torus, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

// 3D Scene for Project Showcase
const ProjectScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <Stars radius={50} depth={30} count={300} factor={2} fade speed={1} />
      
      <group ref={groupRef}>
        <Float speed={3} rotationIntensity={0.5} floatIntensity={2}>
          <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
            <MeshDistortMaterial color="#00d4ff" speed={3} distort={0.4} radius={1} />
          </Sphere>
        </Float>
        
        <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5}>
          <Box args={[0.5, 0.5, 0.5]} position={[2, 1, -1]}>
            <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
          </Box>
        </Float>
        
        <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.8}>
          <Octahedron args={[0.4]} position={[-2, -0.5, 0.5]}>
            <meshStandardMaterial color="#3b82f6" metalness={0.9} roughness={0.1} wireframe />
          </Octahedron>
        </Float>
        
        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.2}>
          <Torus args={[0.6, 0.2, 16, 32]} position={[1.5, -1.2, 1]} rotation={[Math.PI / 4, 0, 0]}>
            <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.3} />
          </Torus>
        </Float>
      </group>
    </>
  );
};

const features = [
  {
    icon: '🌐',
    title: 'Multi-language Support',
    description: 'Full support for English and Hindi languages for wider accessibility.',
  },
  {
    icon: '🔮',
    title: 'Numerology Predictions',
    description: 'Comprehensive numerology predictions based on birth dates and names.',
  },
  {
    icon: '🔐',
    title: 'JWT Authentication',
    description: 'Secure user authentication with JWT tokens for protected access.',
  },
  {
    icon: '📈',
    title: 'SEO Optimized',
    description: 'Enhanced SEO implementation for better search engine visibility.',
  },
  {
    icon: '⚡',
    title: 'Performance Optimized',
    description: 'Fast loading times with optimized code and assets.',
  },
  {
    icon: '📱',
    title: 'Responsive Design',
    description: 'Seamless experience across all devices and screen sizes.',
  },
];

const techStack = [
  { name: 'React', color: '#61DAFB', category: 'Frontend' },
  { name: 'Node.js', color: '#339933', category: 'Backend' },
  { name: 'Express.js', color: '#000000', category: 'Backend' },
  { name: 'Supabase', color: '#3ECF8E', category: 'Database' },
  { name: 'JWT', color: '#000000', category: 'Auth' },
  { name: 'Tailwind CSS', color: '#06B6D4', category: 'Styling' },
];

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="relative py-24 md:py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-background" />
      
      {/* Floating Orbs */}
      <motion.div 
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 -left-32 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl" 
      />

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
            Featured Project
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 tracking-tight">
            My <span className="neon-text">Work</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-body text-lg">
            A production-ready full-stack application showcasing my expertise in modern web development.
          </p>
        </motion.div>

        {/* Main Project Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="glass-card rounded-3xl overflow-hidden">
            {/* 3D Hero Section */}
            <div className="h-64 md:h-80 relative">
              <Suspense fallback={
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/30 animate-pulse" />
                </div>
              }>
                <Canvas camera={{ position: [0, 0, 6], fov: 50 }} className="!absolute inset-0">
                  <ProjectScene />
                </Canvas>
              </Suspense>
              
              {/* Project Badge */}
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-mono font-semibold border border-green-500/30">
                  🟢 LIVE
                </span>
                <span className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-mono font-semibold border border-primary/30">
                  Full Stack
                </span>
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>

            {/* Project Content */}
            <div className="p-8 md:p-10">
              {/* Title and Links */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-3xl md:text-4xl font-heading font-bold mb-3 tracking-wide">
                    VishwaGuru<span className="text-primary">.site</span>
                  </h3>
                  <p className="text-muted-foreground font-body text-lg leading-relaxed max-w-2xl">
                    A comprehensive numerology predictions platform supporting both English and Hindi. 
                    Built with modern web technologies and optimized for performance and SEO.
                  </p>
                </div>
                
                <motion.a
                  href="https://vishwaguru.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-glow-cyan transition-all duration-300 whitespace-nowrap"
                >
                  Visit Live Site
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>
              </div>

              {/* Tech Stack */}
              <div className="mb-10">
                <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Tech Stack</h4>
                <div className="flex flex-wrap gap-3">
                  {techStack.map((tech, index) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      whileHover={{ y: -3, scale: 1.05 }}
                      className="group relative"
                    >
                      <div className="px-4 py-2 rounded-xl bg-muted/50 border border-border/30 hover:border-primary/50 transition-all duration-300 cursor-default">
                        <span className="font-mono text-sm text-foreground/80 group-hover:text-primary transition-colors">
                          {tech.name}
                        </span>
                      </div>
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-card border border-border text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {tech.category}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Features Grid */}
              <div>
                <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-6">Key Features</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-all duration-300 group"
                    >
                      <div className="text-2xl mb-2">{feature.icon}</div>
                      <h5 className="font-heading font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h5>
                      <p className="text-xs text-muted-foreground font-body leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-xl opacity-50 -z-10" />
        </motion.div>

        {/* Project Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="font-mono text-sm text-muted-foreground mb-4">Project Highlights</p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: 'Languages', value: '2 (EN/HI)' },
              { label: 'Tech Stack', value: '6+ Tools' },
              { label: 'Status', value: 'Production' },
              { label: 'SEO Score', value: '90+' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-xl font-heading font-bold text-primary">{stat.value}</div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;