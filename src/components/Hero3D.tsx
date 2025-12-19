import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sphere, Box, Torus, MeshDistortMaterial, Icosahedron, Octahedron } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const FloatingGeometry = ({ position, geometry, color, speed = 1, scale = 1 }: { 
  position: [number, number, number]; 
  geometry: 'box' | 'sphere' | 'torus' | 'icosahedron' | 'octahedron';
  color: string;
  speed?: number;
  scale?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.3;
      meshRef.current.rotation.y += 0.005 * speed;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * speed * 0.2) * 0.2;
    }
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'sphere':
        return <Sphere args={[0.5 * scale, 32, 32]} ref={meshRef}>
          <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={1} />
        </Sphere>;
      case 'torus':
        return <Torus args={[0.4 * scale, 0.15 * scale, 16, 32]} ref={meshRef}>
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </Torus>;
      case 'icosahedron':
        return <Icosahedron args={[0.5 * scale, 0]} ref={meshRef}>
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} wireframe />
        </Icosahedron>;
      case 'octahedron':
        return <Octahedron args={[0.5 * scale]} ref={meshRef}>
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
        </Octahedron>;
      default:
        return <Box args={[0.6 * scale, 0.6 * scale, 0.6 * scale]} ref={meshRef}>
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
        </Box>;
    }
  };

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        {renderGeometry()}
        <pointLight position={[0, 0, 0]} intensity={0.3} color={color} distance={2} />
      </group>
    </Float>
  );
};

const ParticleField = () => {
  const points = useRef<THREE.Points>(null);
  const particleCount = 800;

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
      points.current.rotation.y = state.clock.elapsedTime * 0.015;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.1;
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
      <pointsMaterial size={0.025} color="#00d4ff" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
};

// Animated Ring
const AnimatedRing = ({ radius, color, speed }: { radius: number; color: string; speed: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
      ringRef.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} transparent opacity={0.6} />
    </mesh>
  );
};

const Scene3D = () => {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#8b5cf6" />
      <pointLight position={[0, 10, -10]} intensity={0.4} color="#3b82f6" />
      
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
      <ParticleField />
      
      {/* Main floating geometries */}
      <FloatingGeometry position={[-5, 2, -6]} geometry="sphere" color="#00d4ff" speed={1.2} scale={1.2} />
      <FloatingGeometry position={[5, -1, -4]} geometry="box" color="#8b5cf6" speed={0.8} scale={0.9} />
      <FloatingGeometry position={[-4, -2.5, -5]} geometry="torus" color="#3b82f6" speed={1} scale={1.1} />
      <FloatingGeometry position={[4, 2.5, -7]} geometry="icosahedron" color="#10b981" speed={0.7} scale={1} />
      <FloatingGeometry position={[0, 4, -8]} geometry="octahedron" color="#f59e0b" speed={0.9} scale={0.8} />
      <FloatingGeometry position={[-6, 0, -9]} geometry="box" color="#ec4899" speed={0.6} scale={0.7} />
      <FloatingGeometry position={[6, -3, -6]} geometry="sphere" color="#06b6d4" speed={1.1} scale={0.8} />
      
      {/* Decorative rings */}
      <AnimatedRing radius={3} color="#00d4ff" speed={0.3} />
      <AnimatedRing radius={4.5} color="#8b5cf6" speed={0.2} />
    </>
  );
};

const Hero3D = () => {
  const roles = ["Web Developer", "Full Stack Dev", "SEO Expert", "Tech Enthusiast"];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Scene3D />
        </Canvas>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <span className="inline-block px-5 py-2.5 rounded-full glass-card text-sm font-mono text-primary border border-primary/30">
            &lt;Hello World /&gt;
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 tracking-tight"
        >
          <span className="neon-text">Aadiyan</span>
          <br />
          <span className="text-foreground">Dubey</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl lg:text-2xl font-body text-muted-foreground mb-8"
        >
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {roles.map((role, index) => (
              <motion.span
                key={role}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.15, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <span className="text-foreground font-medium">{role}</span>
                {index < roles.length - 1 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
                )}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-10 font-body leading-relaxed"
        >
          Experienced web developer specializing in AI-driven solutions and innovative web technologies. 
          <br className="hidden sm:block" />
          B.Tech CSE @ NIT Nagaland | Creator of <a href="https://vishwaguru.site" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">VishwaGuru.site</a>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 rounded-xl font-heading font-semibold text-primary-foreground overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x bg-[length:200%_100%]" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-secondary via-primary to-accent animate-gradient-x bg-[length:200%_100%]" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              View My Work
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </motion.a>
          
          <motion.a
            href="#chatbot"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 rounded-xl font-heading font-semibold text-foreground border border-primary/50 hover:border-primary transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with AI
            </span>
          </motion.a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs font-mono uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-9 rounded-full border-2 border-muted-foreground/50 flex items-start justify-center p-1.5">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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