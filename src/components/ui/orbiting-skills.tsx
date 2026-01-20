"use client"
import React, { useEffect, useState, memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

// --- Type Definitions ---
type GlowColor = 'cyan' | 'purple' | 'blue' | 'green' | 'amber' | 'pink';

interface SkillItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface OrbitConfig {
  radius: number;
  speed: number;
  glowColor: GlowColor;
  skills: SkillItem[];
}

interface OrbitingSkillsProps {
  orbits?: OrbitConfig[];
  centerLabel?: string;
  className?: string;
}

interface OrbitingSkillItemProps {
  skill: SkillItem;
  orbitRadius: number;
  angle: number;
  size: number;
  glowColor: GlowColor;
}

interface GlowingOrbitPathProps {
  radius: number;
  glowColor?: GlowColor;
}

// Available icons for admin panel
export const availableIcons = [
  { value: 'code', label: 'Code (Frontend)' },
  { value: 'server', label: 'Server (Backend)' },
  { value: 'database', label: 'Database' },
  { value: 'react', label: 'React' },
  { value: 'globe', label: 'Globe (Web)' },
  { value: 'sparkle', label: 'Sparkle (Other)' },
  { value: 'terminal', label: 'Terminal' },
  { value: 'cpu', label: 'CPU (Hardware)' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'lock', label: 'Lock (Security)' },
  { value: 'layers', label: 'Layers (Stack)' },
  { value: 'git', label: 'Git' },
  { value: 'api', label: 'API' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'design', label: 'Design (UI/UX)' },
];

// --- Glow Color Configurations - Optimized for both themes ---
const glowColorConfig: Record<GlowColor, { 
  primary: string; 
  secondary: string; 
  border: string; 
  text: string;
  lightPrimary: string;
  lightSecondary: string;
  lightBorder: string;
}> = {
  cyan: {
    primary: 'rgba(6, 182, 212, 0.5)',
    secondary: 'rgba(6, 182, 212, 0.25)',
    border: 'rgba(6, 182, 212, 0.4)',
    text: '#06B6D4',
    lightPrimary: 'rgba(6, 182, 212, 0.3)',
    lightSecondary: 'rgba(6, 182, 212, 0.15)',
    lightBorder: 'rgba(6, 182, 212, 0.5)',
  },
  purple: {
    primary: 'rgba(147, 51, 234, 0.5)',
    secondary: 'rgba(147, 51, 234, 0.25)',
    border: 'rgba(147, 51, 234, 0.4)',
    text: '#9333EA',
    lightPrimary: 'rgba(147, 51, 234, 0.3)',
    lightSecondary: 'rgba(147, 51, 234, 0.15)',
    lightBorder: 'rgba(147, 51, 234, 0.5)',
  },
  blue: {
    primary: 'rgba(59, 130, 246, 0.5)',
    secondary: 'rgba(59, 130, 246, 0.25)',
    border: 'rgba(59, 130, 246, 0.4)',
    text: '#3B82F6',
    lightPrimary: 'rgba(59, 130, 246, 0.3)',
    lightSecondary: 'rgba(59, 130, 246, 0.15)',
    lightBorder: 'rgba(59, 130, 246, 0.5)',
  },
  green: {
    primary: 'rgba(16, 185, 129, 0.5)',
    secondary: 'rgba(16, 185, 129, 0.25)',
    border: 'rgba(16, 185, 129, 0.4)',
    text: '#10B981',
    lightPrimary: 'rgba(16, 185, 129, 0.3)',
    lightSecondary: 'rgba(16, 185, 129, 0.15)',
    lightBorder: 'rgba(16, 185, 129, 0.5)',
  },
  amber: {
    primary: 'rgba(245, 158, 11, 0.5)',
    secondary: 'rgba(245, 158, 11, 0.25)',
    border: 'rgba(245, 158, 11, 0.4)',
    text: '#F59E0B',
    lightPrimary: 'rgba(245, 158, 11, 0.3)',
    lightSecondary: 'rgba(245, 158, 11, 0.15)',
    lightBorder: 'rgba(245, 158, 11, 0.5)',
  },
  pink: {
    primary: 'rgba(236, 72, 153, 0.5)',
    secondary: 'rgba(236, 72, 153, 0.25)',
    border: 'rgba(236, 72, 153, 0.4)',
    text: '#EC4899',
    lightPrimary: 'rgba(236, 72, 153, 0.3)',
    lightSecondary: 'rgba(236, 72, 153, 0.15)',
    lightBorder: 'rgba(236, 72, 153, 0.5)',
  }
};

// --- Extended Skill Icon Component with more icons ---
const SkillIconSVG = memo(({ icon, color }: { icon?: string; color: string }) => {
  const icons: Record<string, JSX.Element> = {
    code: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M16 18L22 12L16 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M8 6L2 12L8 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    server: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="3" y="3" width="18" height="6" rx="1" stroke={color} strokeWidth="1.5" />
        <rect x="3" y="15" width="18" height="6" rx="1" stroke={color} strokeWidth="1.5" />
        <circle cx="7" cy="6" r="1" fill={color} />
        <circle cx="7" cy="18" r="1" fill={color} />
      </svg>
    ),
    database: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <ellipse cx="12" cy="6" rx="8" ry="3" stroke={color} strokeWidth="1.5" />
        <path d="M4 6V18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V6" stroke={color} strokeWidth="1.5" />
        <path d="M4 12C4 13.66 7.58 15 12 15C16.42 15 20 13.66 20 12" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    react: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <g stroke={color} strokeWidth="1.5">
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </g>
        <circle cx="12" cy="12" r="2" fill={color} />
      </svg>
    ),
    globe: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="4" ry="9" stroke={color} strokeWidth="1.5" />
        <path d="M3 12H21" stroke={color} strokeWidth="1.5" />
        <path d="M12 3C12 3 8 7 8 12C8 17 12 21 12 21" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    terminal: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="1.5" />
        <path d="M7 8L11 12L7 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 16H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    cpu: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="5" y="5" width="14" height="14" rx="2" stroke={color} strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
        <path d="M9 2V5M15 2V5M9 19V22M15 19V22M2 9H5M19 9H22M2 15H5M19 15H22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    cloud: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M18 10H18.01C20.21 10 22 11.79 22 14C22 16.21 20.21 18 18 18H7C4.24 18 2 15.76 2 13C2 10.24 4.24 8 7 8C7.34 8 7.67 8.03 8 8.09C8.91 5.18 11.64 3 15 3C18.37 3 21.04 5.18 21.95 8.09" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    lock: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.5" />
        <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill={color} />
      </svg>
    ),
    layers: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    git: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="6" r="3" stroke={color} strokeWidth="1.5" />
        <circle cx="6" cy="18" r="3" stroke={color} strokeWidth="1.5" />
        <circle cx="18" cy="18" r="3" stroke={color} strokeWidth="1.5" />
        <path d="M12 9V12M6 15V12C6 11 6.5 10 8 10H16C17.5 10 18 11 18 12V15" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    api: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M4 6H20M4 12H20M4 18H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="6" r="1.5" fill={color} />
        <circle cx="12" cy="12" r="1.5" fill={color} />
        <circle cx="16" cy="18" r="1.5" fill={color} />
      </svg>
    ),
    mobile: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="6" y="2" width="12" height="20" rx="2" stroke={color} strokeWidth="1.5" />
        <path d="M10 18H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    design: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
        <path d="M12 9V2M12 22V15" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
  };

  return icons[icon || 'sparkle'] || icons.sparkle;
});
SkillIconSVG.displayName = 'SkillIconSVG';

// --- Orbiting Skill Item Component - Light theme optimized ---
const OrbitingSkillItem = memo(({ skill, orbitRadius, angle, size, glowColor }: OrbitingSkillItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = glowColorConfig[glowColor];

  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;

  return (
    <div
      className="absolute transition-transform duration-100"
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        zIndex: isHovered ? 50 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer",
          "bg-white/80 dark:bg-transparent backdrop-blur-md shadow-lg dark:shadow-none",
          isHovered ? "scale-125" : "scale-100"
        )}
        style={{
          width: size,
          height: size,
          border: `2px solid ${colors.lightBorder}`,
          boxShadow: isHovered 
            ? `0 0 25px ${colors.lightPrimary}, 0 4px 15px rgba(0,0,0,0.1)` 
            : `0 4px 12px rgba(0,0,0,0.08), 0 0 10px ${colors.lightSecondary}`,
        }}
      >
        <div className="w-5 h-5">
          <SkillIconSVG icon={skill.icon} color={skill.color || colors.text} />
        </div>
        
        {/* Tooltip */}
        {isHovered && (
          <div 
            className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap shadow-lg"
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: `1.5px solid ${colors.lightBorder}`,
              color: colors.text,
            }}
          >
            {skill.name}
          </div>
        )}
      </div>
    </div>
  );
});
OrbitingSkillItem.displayName = 'OrbitingSkillItem';

// --- Glowing Orbit Path Component - Light theme optimized ---
const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan' }: GlowingOrbitPathProps) => {
  const colors = glowColorConfig[glowColor];

  return (
    <div
      className="absolute rounded-full"
      style={{
        left: '50%',
        top: '50%',
        width: radius * 2,
        height: radius * 2,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle at center, transparent 85%, ${colors.lightSecondary} 100%)`,
        border: `1.5px dashed ${colors.lightBorder}`,
        opacity: 0.7,
      }}
    />
  );
});
GlowingOrbitPath.displayName = 'GlowingOrbitPath';

// --- Default Orbit Configuration ---
const defaultOrbits: OrbitConfig[] = [
  {
    radius: 90,
    speed: 0.8,
    glowColor: 'cyan',
    skills: [
      { id: '1', name: 'React', icon: 'react', color: '#61DAFB' },
      { id: '2', name: 'TypeScript', icon: 'code', color: '#3178C6' },
      { id: '3', name: 'Tailwind', icon: 'sparkle', color: '#06B6D4' },
    ]
  },
  {
    radius: 160,
    speed: -0.5,
    glowColor: 'purple',
    skills: [
      { id: '4', name: 'Node.js', icon: 'server', color: '#339933' },
      { id: '5', name: 'Supabase', icon: 'database', color: '#3ECF8E' },
      { id: '6', name: 'PostgreSQL', icon: 'database', color: '#4169E1' },
    ]
  }
];

// --- Main Component ---
export default function OrbitingSkills({ 
  orbits = defaultOrbits, 
  centerLabel = "Skills",
  className 
}: OrbitingSkillsProps) {
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime(prevTime => prevTime + deltaTime);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  // Calculate skill positions with even distribution
  const skillsWithAngles = useMemo(() => {
    return orbits.flatMap((orbit) => {
      const skillCount = orbit.skills.length;
      return orbit.skills.map((skill, index) => {
        const phaseShift = (2 * Math.PI * index) / skillCount;
        const angle = time * orbit.speed + phaseShift;
        return {
          skill,
          orbitRadius: orbit.radius,
          angle,
          glowColor: orbit.glowColor,
          size: 42 - (orbit.radius / 40), // Slightly smaller for outer orbits
        };
      });
    });
  }, [orbits, time]);

  return (
    <div 
      className={cn(
        "relative w-full aspect-square max-w-[400px] mx-auto",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background glow */}
      <div 
        className="absolute inset-0 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.3), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Center element - Light theme optimized */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        {/* Outer glow ring */}
        <div 
          className="absolute -inset-5 rounded-full opacity-30 dark:opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent)',
            filter: 'blur(12px)',
          }}
        />
        
        {/* Center icon container */}
        <div 
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-white/90 dark:bg-transparent backdrop-blur-md shadow-xl dark:shadow-none"
          style={{
            border: '2px solid hsl(var(--primary) / 0.5)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px hsl(var(--primary) / 0.1)',
          }}
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary">
            <path
              d="M16 18L22 12L16 6M8 6L2 12L8 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        
        {/* Center label */}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-mono text-foreground/70 whitespace-nowrap bg-white/80 dark:bg-transparent px-2 py-0.5 rounded-md">
          {centerLabel}
        </div>
      </div>

      {/* Orbit paths */}
      {orbits.map((orbit, index) => (
        <GlowingOrbitPath 
          key={`orbit-${index}`} 
          radius={orbit.radius} 
          glowColor={orbit.glowColor} 
        />
      ))}

      {/* Orbiting skills */}
      {skillsWithAngles.map((item) => (
        <OrbitingSkillItem
          key={item.skill.id}
          skill={item.skill}
          orbitRadius={item.orbitRadius}
          angle={item.angle}
          size={item.size}
          glowColor={item.glowColor}
        />
      ))}
    </div>
  );
}

export { OrbitingSkills, type OrbitConfig, type SkillItem, type GlowColor };
