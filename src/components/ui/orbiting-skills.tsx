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

// --- Glow Color Configurations ---
const glowColorConfig: Record<GlowColor, { primary: string; secondary: string; border: string; text: string }> = {
  cyan: {
    primary: 'rgba(6, 182, 212, 0.5)',
    secondary: 'rgba(6, 182, 212, 0.25)',
    border: 'rgba(6, 182, 212, 0.4)',
    text: '#06B6D4'
  },
  purple: {
    primary: 'rgba(147, 51, 234, 0.5)',
    secondary: 'rgba(147, 51, 234, 0.25)',
    border: 'rgba(147, 51, 234, 0.4)',
    text: '#9333EA'
  },
  blue: {
    primary: 'rgba(59, 130, 246, 0.5)',
    secondary: 'rgba(59, 130, 246, 0.25)',
    border: 'rgba(59, 130, 246, 0.4)',
    text: '#3B82F6'
  },
  green: {
    primary: 'rgba(16, 185, 129, 0.5)',
    secondary: 'rgba(16, 185, 129, 0.25)',
    border: 'rgba(16, 185, 129, 0.4)',
    text: '#10B981'
  },
  amber: {
    primary: 'rgba(245, 158, 11, 0.5)',
    secondary: 'rgba(245, 158, 11, 0.25)',
    border: 'rgba(245, 158, 11, 0.4)',
    text: '#F59E0B'
  },
  pink: {
    primary: 'rgba(236, 72, 153, 0.5)',
    secondary: 'rgba(236, 72, 153, 0.25)',
    border: 'rgba(236, 72, 153, 0.4)',
    text: '#EC4899'
  }
};

// --- Skill Icon Component ---
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
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  };

  return icons[icon || 'sparkle'] || icons.sparkle;
});
SkillIconSVG.displayName = 'SkillIconSVG';

// --- Orbiting Skill Item Component ---
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
          "rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-sm",
          isHovered ? "scale-125" : "scale-100"
        )}
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${colors.secondary}, transparent)`,
          border: `1.5px solid ${colors.border}`,
          boxShadow: isHovered 
            ? `0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary}` 
            : `0 0 10px ${colors.secondary}`,
        }}
      >
        <div className="w-5 h-5">
          <SkillIconSVG icon={skill.icon} color={skill.color || colors.text} />
        </div>
        
        {/* Tooltip */}
        {isHovered && (
          <div 
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs font-mono whitespace-nowrap backdrop-blur-md"
            style={{
              background: `linear-gradient(135deg, ${colors.secondary}, rgba(0,0,0,0.6))`,
              border: `1px solid ${colors.border}`,
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

// --- Glowing Orbit Path Component ---
const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan' }: GlowingOrbitPathProps) => {
  const colors = glowColorConfig[glowColor];

  return (
    <div
      className="absolute rounded-full animate-pulse"
      style={{
        left: '50%',
        top: '50%',
        width: radius * 2,
        height: radius * 2,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle at center, transparent 60%, ${colors.secondary} 100%)`,
        border: `1px solid ${colors.border}`,
        opacity: 0.6,
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

      {/* Center element */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        {/* Outer glow ring */}
        <div 
          className="absolute -inset-4 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), transparent)',
            filter: 'blur(8px)',
          }}
        />
        
        {/* Center icon container */}
        <div 
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.1))',
            border: '2px solid hsl(var(--primary) / 0.4)',
            boxShadow: '0 0 30px hsl(var(--primary) / 0.3), inset 0 0 20px hsl(var(--primary) / 0.1)',
          }}
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary">
            <path
              d="M16 18L22 12L16 6M8 6L2 12L8 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        
        {/* Center label */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-muted-foreground whitespace-nowrap">
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
