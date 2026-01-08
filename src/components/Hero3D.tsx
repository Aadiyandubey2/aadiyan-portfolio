import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSiteContent, useResume } from '@/hooks/useSiteContent';
import { useTheme } from '@/contexts/ThemeContext';

const ParticleField = () => {
  const points = useRef<THREE.Points>(null);
  const particleCount = 250;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00d4ff" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
};

const FloatingShape = ({ position, color, type }: { position: [number, number, number]; color: string; type: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.25;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.18;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1}>
      <mesh position={position} ref={meshRef}>
        {type === 'ico' && <icosahedronGeometry args={[0.6, 0]} />}
        {type === 'torus' && <torusGeometry args={[0.5, 0.2, 8, 24]} />}
        {type === 'octa' && <octahedronGeometry args={[0.5]} />}
        {type === 'dodeca' && <dodecahedronGeometry args={[0.5]} />}
        <meshStandardMaterial 
          color={color} 
          metalness={0.85} 
          roughness={0.15} 
          wireframe 
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
};

const InteractiveRing = ({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh position={position} ref={ringRef} scale={scale}>
        <torusGeometry args={[1, 0.02, 16, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
};

const GridFloor = () => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.3) % 2;
    }
  });

  return (
    <gridHelper 
      ref={gridRef}
      args={[60, 60, '#00d4ff', '#00d4ff']} 
      position={[0, -6, 0]} 
    />
  );
};

const Scene3D = () => {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00d4ff" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, -5, 5]} intensity={0.3} color="#3b82f6" />
      <Stars radius={100} depth={50} count={1200} factor={3} fade speed={0.4} />
      <ParticleField />
      <FloatingShape position={[-5, 2.5, -8]} color="#00d4ff" type="ico" />
      <FloatingShape position={[5, -1.5, -6]} color="#8b5cf6" type="torus" />
      <FloatingShape position={[0, 4, -10]} color="#3b82f6" type="octa" />
      <FloatingShape position={[-3, -2, -5]} color="#10b981" type="dodeca" />
      <FloatingShape position={[4, 3, -7]} color="#f59e0b" type="ico" />
      <InteractiveRing position={[-4, 0, -6]} color="#00d4ff" scale={0.8} />
      <InteractiveRing position={[3, 2, -8]} color="#8b5cf6" scale={0.6} />
      <GridFloor />
    </>
  );
};

const Hero3D = () => {
  const { theme } = useTheme();
  const { content, isLoading } = useSiteContent();
  const { resume } = useResume();

  const isWater = theme === 'water';

  // Fallback values
  const defaultRoles = ["Web Developer", "Full Stack Dev", "SEO Expert"];
  const defaultName = { first: "Aadiyan", last: "Dubey" };
  const defaultTagline = "B.Tech CSE @ NIT Nagaland | Creator of VishwaGuru.site";

  const profile = content?.profile;
  const roles = profile?.roles?.length ? profile.roles : defaultRoles;
  const nameParts = profile?.name?.split(' ') || [defaultName.first, defaultName.last];
  const firstName = nameParts[0] || defaultName.first;
  const lastName = nameParts.slice(1).join(' ') || defaultName.last;
  const tagline = profile?.tagline || defaultTagline;

  // Use resume from database if available, otherwise fallback to static file
  const resumeUrl = resume?.file_url || '/Aadiyan_Dubey_Resume.pdf';
  const resumeFileName = resume?.file_name || 'Aadiyan_Dubey_Resume.pdf';

  return (
    <section
      id="home"
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${isWater ? 'bg-transparent' : 'bg-gradient-hero'}`}
    >
      {/* 3D Background (space theme only) */}
      {!isWater && (
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
            <Scene3D />
          </Canvas>
        </div>
      )}

      {/* Overlays */}
      <div
        className={`absolute inset-0 pointer-events-none ${isWater ? 'bg-gradient-to-b from-background/40 via-background/10 to-background/60' : 'bg-gradient-to-b from-transparent via-background/20 to-background'}`}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <div className={isWater ? 'glass-card rounded-3xl px-5 sm:px-8 py-8 sm:py-10' : ''}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-4 sm:mb-6"
          >
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card text-xs sm:text-sm font-mono text-primary border border-primary/30">
              &lt;Hello World /&gt;
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-4 sm:mb-6"
          >
            <span className="neon-text">{isLoading ? 'Loading...' : firstName}</span>
            <br />
            <span className="text-foreground">{isLoading ? '' : lastName}</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6"
          >
            {roles.map((role, index) => (
              <span key={role} className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-lg md:text-xl text-foreground font-medium">{role}</span>
                {index < roles.length - 1 && (
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary" />
                )}
              </span>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-6 sm:mb-8 font-body"
          >
            {tagline.includes('VishwaGuru') ? (
              <>
                {tagline.split('VishwaGuru')[0]}
                <a href="https://vishwaguru.site" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  VishwaGuru.site
                </a>
                {tagline.split('VishwaGuru.site')[1] || ''}
              </>
            ) : (
              tagline
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <Link
              to="/projects"
              className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-glow-cyan transition-all duration-300"
            >
              View My Work
            </Link>
            <a
              href={resumeUrl}
              download={resumeFileName}
              className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base text-foreground border border-secondary/50 hover:border-secondary hover:bg-secondary/10 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Resume
            </a>
            <Link
              to="/contact"
              className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base text-foreground border border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
            >
              Let's Connect
            </Link>
          </motion.div>

          {/* Scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-[10px] sm:text-xs font-mono">Scroll</span>
              <div className="w-4 h-7 sm:w-5 sm:h-8 rounded-full border border-muted-foreground/50 flex items-start justify-center p-1">
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero3D;

