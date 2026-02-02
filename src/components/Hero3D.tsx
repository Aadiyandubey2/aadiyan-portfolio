import { useRef, useMemo, useState, useEffect, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useSiteContent, useResume } from "@/hooks/useSiteContent";
import ParticleField from "./three/ParticleField";

const FloatingShape = memo(({ position, color, type }: { position: [number, number, number]; color: string; type: string }) => {
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
        {type === "ico" && <icosahedronGeometry args={[0.6, 0]} />}
        {type === "torus" && <torusGeometry args={[0.5, 0.2, 8, 24]} />}
        {type === "octa" && <octahedronGeometry args={[0.5]} />}
        {type === "dodeca" && <dodecahedronGeometry args={[0.5]} />}
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} wireframe emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </Float>
  );
});

FloatingShape.displayName = 'FloatingShape';

const InteractiveRing = memo(({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) => {
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
});

InteractiveRing.displayName = 'InteractiveRing';

const GridFloor = memo(() => {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.3) % 2;
    }
  });

  return <gridHelper ref={gridRef} args={[60, 60, "#00d4ff", "#00d4ff"]} position={[0, -6, 0]} />;
});

GridFloor.displayName = 'GridFloor';

const Scene3D = memo(() => (
  <>
    <ambientLight intensity={0.15} />
    <pointLight position={[10, 10, 10]} intensity={0.8} color="#00d4ff" />
    <pointLight position={[-10, 5, -10]} intensity={0.5} color="#8b5cf6" />
    <pointLight position={[0, -5, 5]} intensity={0.3} color="#3b82f6" />
    <Stars radius={100} depth={50} count={1200} factor={3} fade speed={0.4} />
    <ParticleField count={250} color="#00d4ff" opacity={0.7} speed={0.02} />
    <FloatingShape position={[-5, 2.5, -8]} color="#00d4ff" type="ico" />
    <FloatingShape position={[5, -1.5, -6]} color="#8b5cf6" type="torus" />
    <FloatingShape position={[0, 4, -10]} color="#3b82f6" type="octa" />
    <FloatingShape position={[-3, -2, -5]} color="#10b981" type="dodeca" />
    <FloatingShape position={[4, 3, -7]} color="#f59e0b" type="ico" />
    <InteractiveRing position={[-4, 0, -6]} color="#00d4ff" scale={0.8} />
    <InteractiveRing position={[3, 2, -8]} color="#8b5cf6" scale={0.6} />
    <GridFloor />
  </>
));

Scene3D.displayName = 'Scene3D';

const WaterScene = memo(() => {
  const bubblesRef = useRef<THREE.Points>(null);
  const bubbleCount = 80;

  const bubblePositions = useMemo(() => {
    const positions = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (bubblesRef.current) {
      const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < bubbleCount; i++) {
        positions[i * 3 + 1] += 0.008 + Math.random() * 0.005;
        if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = -10;
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.002;
      }
      bubblesRef.current.geometry.attributes.position.needsUpdate = true;
      bubblesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} color="#e0f4ff" />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#0ea5e9" />
      <pointLight position={[-10, 5, -10]} intensity={0.3} color="#38bdf8" />
      <points ref={bubblesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={bubbleCount} array={bubblePositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#0ea5e9" transparent opacity={0.4} sizeAttenuation />
      </points>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
        <mesh position={[-4, 2, -6]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.3} metalness={0.1} roughness={0.1} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
        <mesh position={[4, -1, -5]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.25} metalness={0.1} roughness={0.1} />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh position={[0, 3, -8]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.2} metalness={0.1} roughness={0.1} />
        </mesh>
      </Float>
    </>
  );
});

WaterScene.displayName = 'WaterScene';

const Hero3D = memo(() => {
  const { content } = useSiteContent();
  const { resume } = useResume();
  const { theme } = useTheme();
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    const timer = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback(() => setShowCanvas(true), { timeout: 1000 })
      : setTimeout(() => setShowCanvas(true), 100);
    return () => {
      if (typeof timer === 'number') {
        typeof cancelIdleCallback !== 'undefined' ? cancelIdleCallback(timer) : clearTimeout(timer);
      }
    };
  }, []);

  const defaultRoles = ["Web Developer", "Full Stack Dev", "SEO Expert"];
  const defaultName = { first: "Aadiyan", last: "Dubey" };
  const defaultTagline = "B.Tech CSE @ NIT Nagaland | Creator of VishwaGuru.site";
  
  const profile = content?.profile;
  const roles = profile?.roles?.length ? profile.roles : defaultRoles;
  const nameParts = profile?.name?.split(" ") || [defaultName.first, defaultName.last];
  const firstName = nameParts[0] || defaultName.first;
  const lastName = nameParts.slice(1).join(" ") || defaultName.last;
  const tagline = profile?.tagline || defaultTagline;
  const resumeUrl = resume?.file_url || "/Aadiyan_Dubey_Resume.pdf";
  const resumeFileName = resume?.file_name || "Aadiyan_Dubey_Resume.pdf";

  return (
    <section
      id="home"
      className={`relative flex items-center justify-center overflow-hidden ${theme === "water" ? "" : "bg-gradient-hero"}`}
      style={{ minHeight: "calc(var(--vh) * 100)" }}
      aria-label="Welcome to Aadiyan Dubey's portfolio - Full Stack Developer"
    >
      <div className="absolute inset-0 pointer-events-none">
        {showCanvas && (
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
            {theme === "water" ? <WaterScene /> : <Scene3D />}
          </Canvas>
        )}
      </div>

      {theme !== "water" && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background pointer-events-none" />}

<div className="relative z-10 min-h-[520px] flex flex-col justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto">
  
  {/* Badge */}
  <div className="mb-4 sm:mb-6 flex justify-center">
    <span
      className="
        inline-flex items-center gap-2
        px-4 py-2
        rounded-full
        glass-card
        text-xs sm:text-sm font-mono text-primary
        border border-primary/30
        backdrop-blur-xl
        shadow-[0_0_0_1px_rgba(0,255,200,0.15)]
        transition-all duration-300
        hover:shadow-[0_0_18px_rgba(0,255,200,0.35)]
        animate-[pulse_3.5s_ease-in-out_infinite]
      "
    >
      <span className="w-2 h-2 rounded-full bg-primary animate-ping opacity-70" />
      &lt;Hello&nbsp;World&nbsp;/&gt;
    </span>
  </div>

  {/* Heading */}
  <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
    Built like an <span className="text-primary">AI System</span>
  </h1>

  {/* Subtext */}
  <p className="mt-4 text-sm sm:text-base text-white/70 max-w-2xl mx-auto">
    Clean. Intelligent. Purpose-driven UI — no gradients, no noise.
  </p>

</div>


        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-4 sm:mb-6">
          <span className="text-blue-700">{firstName}</span>
          <br />
          <span className="text-foreground">{lastName}</span>
        </h1>

        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6">
          {roles.map((role, index) => (
            <span key={role} className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm sm:text-lg md:text-xl text-foreground font-medium">{role}</span>
              {index < roles.length - 1 && <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary" />}
            </span>
          ))}
        </div>

        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-6 sm:mb-8 font-body">
          {tagline.includes("VishwaGuru") ? (
            <>
              {tagline.split("VishwaGuru")[0]}
              <a href="https://vishwaguru.site" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">VishwaGuru.site</a>
              {tagline.split("VishwaGuru.site")[1] || ""}
            </>
          ) : tagline}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link to="/projects" className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-heading text-sm sm:text-base border-2 border-primary text-primary font-bold transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-glow-cyan">
            View My Work
          </Link>
          <a href={resumeUrl} download={resumeFileName} className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base text-foreground border border-secondary/50 hover:border-secondary hover:bg-secondary/10 transition-all duration-300 flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Resume
          </a>
          <Link to="/contact" className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-heading font-semibold text-sm sm:text-base text-foreground border border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300">
            Let's Connect
          </Link>
        </div>

        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-mono">Scroll</span>
            <div className="w-4 h-7 sm:w-5 sm:h-8 rounded-full border border-muted-foreground/50 flex items-start justify-center p-1">
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1 h-1 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Hero3D.displayName = 'Hero3D';

export default Hero3D;
