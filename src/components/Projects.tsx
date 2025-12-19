import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';

// 3D Feature Icons
const FeatureIcon3D = ({ shape, color }: { shape: string; color: string }) => {
  return (
    <Float speed={3} rotationIntensity={0.8} floatIntensity={0.5}>
      <mesh>
        {shape === 'globe' && <icosahedronGeometry args={[0.4, 1]} />}
        {shape === 'crystal' && <octahedronGeometry args={[0.45]} />}
        {shape === 'shield' && <dodecahedronGeometry args={[0.4]} />}
        {shape === 'chart' && <coneGeometry args={[0.35, 0.6, 4]} />}
        {shape === 'bolt' && <tetrahedronGeometry args={[0.45]} />}
        {shape === 'phone' && <boxGeometry args={[0.3, 0.5, 0.1]} />}
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.4}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
};

const features = [
  { shape: 'globe', color: '#00d4ff', title: 'Multi-language', desc: 'English & Hindi support' },
  { shape: 'crystal', color: '#8b5cf6', title: 'Numerology', desc: 'Birth date predictions' },
  { shape: 'shield', color: '#10b981', title: 'JWT Auth', desc: 'Secure authentication' },
  { shape: 'chart', color: '#f59e0b', title: 'SEO', desc: 'Optimized visibility' },
  { shape: 'bolt', color: '#ef4444', title: 'Fast', desc: 'Performance optimized' },
  { shape: 'phone', color: '#3b82f6', title: 'Responsive', desc: 'All devices' },
];

const techStack = ['React', 'Node.js', 'Express.js', 'Supabase', 'JWT', 'Tailwind CSS'];

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isLoading, setIsLoading] = useState(true);

  return (
    <section id="projects" className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-background" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-card text-xs sm:text-sm font-mono text-primary border border-primary/30 mb-4 sm:mb-6">
            Featured Project
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
            My <span className="neon-text">Work</span>
          </h2>
        </motion.div>

        {/* Project Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Live Preview */}
          <div className="relative bg-muted/20">
            {/* Badges */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex gap-2">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-green-500/90 text-white text-[10px] sm:text-xs font-mono font-semibold backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] sm:text-xs font-mono font-semibold backdrop-blur-sm">
                Full Stack
              </span>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-muted-foreground">Loading live preview...</span>
                </div>
              </div>
            )}
            
            {/* Live iframe */}
            <div className="w-full aspect-[16/10] sm:aspect-[16/9]">
              <iframe
                src="https://vishwaguru.site"
                title="VishwaGuru - Live Preview"
                className="w-full h-full border-0"
                loading="lazy"
                onLoad={() => setIsLoading(false)}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5 sm:mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold mb-2">
                  VishwaGuru<span className="text-primary">.site</span>
                </h3>
                <p className="text-muted-foreground font-body text-xs sm:text-sm max-w-lg">
                  A numerology predictions platform supporting English and Hindi with JWT authentication and SEO optimization.
                </p>
              </div>
              
              <a
                href="https://vishwaguru.site"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-heading font-semibold text-xs sm:text-sm text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-glow-cyan transition-all whitespace-nowrap"
              >
                Visit Site
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Tech Stack */}
            <div className="mb-5 sm:mb-6">
              <p className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase mb-2 sm:mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {techStack.map((tech, index) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono bg-muted/50 text-foreground/80 border border-border/30"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Features with 3D Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-all"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2 rounded-lg overflow-hidden">
                    <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
                      <ambientLight intensity={0.5} />
                      <pointLight position={[2, 2, 2]} intensity={1} />
                      <FeatureIcon3D shape={feature.shape} color={feature.color} />
                    </Canvas>
                  </div>
                  <p className="text-[10px] sm:text-xs font-heading font-semibold">{feature.title}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;