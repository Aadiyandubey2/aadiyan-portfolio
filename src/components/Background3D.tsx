import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';

interface Background3DProps {
  variant?: 'hero' | 'section' | 'minimal';
  color?: string;
  particleCount?: number;
}

const ParticleField = memo(({ count = 150, color = '#00d4ff' }: { count?: number; color?: string }) => {
  const points = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.015;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color={color} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
});

ParticleField.displayName = 'ParticleField';

const FloatingGeometry = memo(({ 
  position, 
  color, 
  type = 'icosahedron',
  scale = 1 
}: { 
  position: [number, number, number]; 
  color: string; 
  type?: 'icosahedron' | 'torus' | 'octahedron' | 'dodecahedron';
  scale?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh position={position} ref={meshRef} scale={scale}>
        {type === 'icosahedron' && <icosahedronGeometry args={[0.5, 0]} />}
        {type === 'torus' && <torusGeometry args={[0.4, 0.15, 8, 24]} />}
        {type === 'octahedron' && <octahedronGeometry args={[0.5]} />}
        {type === 'dodecahedron' && <dodecahedronGeometry args={[0.4]} />}
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2} 
          wireframe 
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
});

FloatingGeometry.displayName = 'FloatingGeometry';

const GridPlane = memo(({ color = '#00d4ff' }: { color?: string }) => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
    }
  });

  return (
    <gridHelper 
      ref={gridRef}
      args={[50, 50, color, color]} 
      position={[0, -5, 0]} 
      rotation={[0, 0, 0]}
    />
  );
});

GridPlane.displayName = 'GridPlane';

const HeroScene = memo(({ isLowEnd }: { isLowEnd: boolean }) => (
  <>
    <ambientLight intensity={0.15} />
    <pointLight position={[10, 10, 10]} intensity={0.8} color="#00d4ff" />
    {!isLowEnd && <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />}
    <Stars radius={100} depth={50} count={isLowEnd ? 300 : 1000} factor={3} fade speed={0.3} />
    <ParticleField count={isLowEnd ? 50 : 200} color="#00d4ff" />
    {!isLowEnd && (
      <>
        <FloatingGeometry position={[-5, 2, -8]} color="#00d4ff" type="icosahedron" scale={1.2} />
        <FloatingGeometry position={[5, -1, -6]} color="#8b5cf6" type="torus" scale={1} />
        <FloatingGeometry position={[0, 4, -10]} color="#3b82f6" type="octahedron" scale={1.5} />
        <FloatingGeometry position={[-3, -2, -5]} color="#10b981" type="dodecahedron" scale={0.8} />
        <FloatingGeometry position={[4, 3, -7]} color="#f59e0b" type="icosahedron" scale={0.6} />
        <GridPlane color="#00d4ff" />
      </>
    )}
  </>
));

HeroScene.displayName = 'HeroScene';

const SectionScene = memo(({ color = '#00d4ff', isLowEnd }: { color?: string; isLowEnd: boolean }) => (
  <>
    <ambientLight intensity={0.1} />
    <pointLight position={[5, 5, 5]} intensity={0.5} color={color} />
    <ParticleField count={isLowEnd ? 20 : 80} color={color} />
    {!isLowEnd && (
      <>
        <FloatingGeometry position={[-6, 2, -10]} color={color} type="icosahedron" scale={0.8} />
        <FloatingGeometry position={[6, -2, -8]} color={color} type="torus" scale={0.6} />
      </>
    )}
  </>
));

SectionScene.displayName = 'SectionScene';

const MinimalScene = memo(({ color = '#00d4ff', isLowEnd }: { color?: string; isLowEnd: boolean }) => (
  <>
    <ambientLight intensity={0.1} />
    <ParticleField count={isLowEnd ? 15 : 40} color={color} />
  </>
));

MinimalScene.displayName = 'MinimalScene';

// Static fallback for devices that can't handle 3D
const StaticFallback = memo(({ color = '#00d4ff' }: { color?: string }) => (
  <div className="absolute inset-0 overflow-hidden opacity-30">
    {/* Gradient orbs */}
    <div 
      className="absolute w-64 h-64 rounded-full blur-3xl animate-pulse"
      style={{ 
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        top: '10%',
        left: '10%',
      }}
    />
    <div 
      className="absolute w-48 h-48 rounded-full blur-3xl animate-pulse"
      style={{ 
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        bottom: '20%',
        right: '15%',
        animationDelay: '1s',
      }}
    />
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `linear-gradient(${color}15 1px, transparent 1px), linear-gradient(90deg, ${color}15 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    />
  </div>
));

StaticFallback.displayName = 'StaticFallback';

const Background3D = memo(({ variant = 'section', color = '#00d4ff' }: Background3DProps) => {
  const { isLowEnd, supportsWebGL, prefersReducedMotion } = useDeviceCapability();

  // Use static fallback for very low-end devices or those without WebGL
  if (!supportsWebGL || prefersReducedMotion) {
    return <StaticFallback color={color} />;
  }

  return (
    <div className="absolute inset-0 opacity-40">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }} 
        dpr={isLowEnd ? 1 : [1, 1.5]}
        frameloop={isLowEnd ? 'demand' : 'always'}
        gl={{ 
          antialias: !isLowEnd,
          powerPreference: isLowEnd ? 'low-power' : 'high-performance',
        }}
      >
        {variant === 'hero' && <HeroScene isLowEnd={isLowEnd} />}
        {variant === 'section' && <SectionScene color={color} isLowEnd={isLowEnd} />}
        {variant === 'minimal' && <MinimalScene color={color} isLowEnd={isLowEnd} />}
      </Canvas>
    </div>
  );
});

Background3D.displayName = 'Background3D';

export default Background3D;