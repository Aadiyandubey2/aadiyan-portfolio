import { motion, useInView } from 'framer-motion';
import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

// 3D Animated Avatar Background
const AvatarScene = () => {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#00d4ff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
      <Stars radius={50} depth={30} count={500} factor={2} fade speed={1} />
      
      <Float speed={2} rotationIntensity={0.3} floatIntensity={1}>
        <Sphere args={[1.5, 64, 64]} ref={sphereRef}>
          <MeshDistortMaterial
            color="#00d4ff"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>
      
      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.9} roughness={0.1} />
      </mesh>
    </>
  );
};

const timelineData = [
  {
    year: '2025',
    title: 'Web Developer Intern',
    institution: 'CodeSA',
    description: 'Part-time Web Developer specializing in UI/UX design, frontend development, and performance optimization.',
    type: 'work',
    status: 'current',
  },
  {
    year: '2024',
    title: 'Literary & Arts Club Asst. Secretary',
    institution: 'NIT Nagaland',
    description: 'Coordinating cultural, literary, and artistic events. Event planning, content creation, and promotions.',
    type: 'position',
    status: 'current',
  },
  {
    year: '2023',
    title: 'B.Tech CSE (Current CGPA: 8.06)',
    institution: 'NIT Nagaland',
    description: 'Admitted through JEE Mains with All India Rank 41,149. Last Semester CGPA: 8.34.',
    type: 'education',
    status: 'current',
  },
  {
    year: '2023',
    title: 'Higher Secondary (12th)',
    institution: 'Model High School, Jabalpur',
    description: 'Completed 12th grade with strong foundation in Mathematics and Computer Science.',
    type: 'education',
    status: 'completed',
  },
];

const stats = [
  { label: 'JEE Mains AIR', value: '41K+', icon: '🎯' },
  { label: 'Current CGPA', value: '8.06', icon: '📊' },
  { label: 'Last Sem CGPA', value: '8.34', icon: '📈' },
  { label: 'Projects Live', value: '1', icon: '🚀' },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      
      {/* Floating Orbs */}
      <motion.div 
        animate={{ 
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ 
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: -3 }}
        className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" 
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
            whoami
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 tracking-tight">
            About <span className="neon-text">Me</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-body text-lg">
            A passionate web developer and tech enthusiast building innovative digital experiences.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Profile Card with 3D Background */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative group"
          >
            <div className="glass-card rounded-3xl overflow-hidden">
              {/* 3D Avatar Section */}
              <div className="h-56 relative">
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="w-24 h-24 rounded-full bg-primary/30 animate-pulse" />
                  </div>
                }>
                  <Canvas camera={{ position: [0, 0, 5], fov: 50 }} className="!absolute inset-0">
                    <AvatarScene />
                  </Canvas>
                </Suspense>
                
                {/* Initials Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                    className="text-5xl font-heading font-bold text-white drop-shadow-2xl"
                  >
                    AD
                  </motion.div>
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Profile Content */}
              <div className="p-8 -mt-4 relative">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-heading font-bold mb-2">Aadiyan Dubey</h3>
                  <p className="text-primary font-mono text-sm mb-1">Web Developer | Full Stack Dev</p>
                  <p className="text-muted-foreground font-mono text-xs">B.Tech CSE @ NIT Nagaland</p>
                </div>

                <p className="text-muted-foreground font-body leading-relaxed mb-4 text-center">
                  Experienced web developer specializing in numerology, AI-driven solutions, and innovative web technologies. 
                  Creator of <a href="https://vishwaguru.site" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">VishwaGuru.site</a> — a comprehensive numerology platform.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="text-lg mb-1">{stat.icon}</div>
                      <div className="text-xl font-heading font-bold text-gradient">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <h3 className="text-xl font-heading font-bold mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <span className="tracking-wide">Journey & Experience</span>
            </h3>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent rounded-full" />

              <div className="space-y-6">
                {timelineData.map((item, index) => (
                  <motion.div
                    key={`${item.year}-${item.title}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
                    className="relative pl-14"
                  >
                    {/* Timeline Dot */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.15, type: "spring" }}
                      className={`absolute left-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.status === 'current' 
                          ? 'bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/50' 
                          : 'bg-muted border border-border/50'
                      }`}
                    >
                      {item.type === 'work' ? (
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ) : item.type === 'position' ? (
                        <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l9-5-9-5-9 5 9 5z" />
                        </svg>
                      )}
                    </motion.div>

                    <div className="glass-card p-5 rounded-xl hover:scale-[1.02] transition-all duration-300 hover:border-primary/30">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/20 text-primary font-semibold">{item.year}</span>
                        {item.status === 'current' && (
                          <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-green-500/20 text-green-400 uppercase tracking-wider">
                            Current
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-heading font-semibold mb-1 tracking-wide">{item.title}</h4>
                      <p className="text-sm text-primary/80 font-medium mb-2">{item.institution}</p>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;