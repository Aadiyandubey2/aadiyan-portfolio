import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

const WaterBackground = () => {
  const { theme } = useTheme();

  if (theme !== 'water') return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated water gradient background */}
      <div className="absolute inset-0 water-gradient" />
      
      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full water-orb"
          style={{
            width: `${150 + i * 50}px`,
            height: `${150 + i * 50}px`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Light rays */}
      <div className="absolute inset-0 water-rays" />

      {/* Ripple effects */}
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="water-ripple">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" seed="1">
              <animate
                attributeName="baseFrequency"
                dur="30s"
                values="0.01;0.02;0.01"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="20" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default WaterBackground;
