import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const ParticleField = () => {
  const points = useRef<THREE.Points>(null);
  const particleCount = 300;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
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
      <pointsMaterial size={0.03} color="#00d4ff" transparent opacity={0.6} />
    </points>
  );
};

const FloatingShape = ({ position, color }: { position: [number, number, number]; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={position} ref={meshRef}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} wireframe />
      </mesh>
    </Float>
  );
};

const Scene3D = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
      <Stars radius={80} depth={40} count={800} factor={3} fade speed={0.5} />
      <ParticleField />
      <FloatingShape position={[-4, 2, -5]} color="#00d4ff" />
      <FloatingShape position={[4, -1, -4]} color="#8b5cf6" />
      <FloatingShape position={[0, 3, -6]} color="#3b82f6" />
    </>
  );
};

const Hero3D = () => {
  const roles = ["Web Developer", "Full Stack Dev", "SEO Expert"];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
          <Scene3D />
        </Canvas>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-sm font-mono text-primary border border-primary/30">
            &lt;Hello World /&gt;
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6"
        >
          <span className="neon-text">Aadiyan</span>
          <br />
          <span className="text-foreground">Dubey</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-3 flex-wrap mb-6"
        >
          {roles.map((role, index) => (
            <span key={role} className="flex items-center gap-3">
              <span className="text-lg md:text-xl text-foreground font-medium">{role}</span>
              {index < roles.length - 1 && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8 font-body"
        >
          B.Tech CSE @ NIT Nagaland | Creator of{' '}
          <a href="https://vishwaguru.site" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            VishwaGuru.site
          </a>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
        >
          <a
            href="#projects"
            className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-glow-cyan transition-all duration-300"
          >
            View My Work
          </a>
          <a
            href="/Aadiyan_Dubey_Resume.pdf"
            download="Aadiyan_Dubey_Resume.pdf"
            className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base text-foreground border border-secondary/50 hover:border-secondary hover:bg-secondary/10 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Resume
          </a>
          <a
            href="#contact"
            className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base text-foreground border border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
          >
            Let's Connect
          </a>
        </motion.div>

        {/* Scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs font-mono">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-muted-foreground/50 flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-primary"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero3D;