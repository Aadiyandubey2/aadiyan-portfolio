import { useTheme } from '@/contexts/ThemeContext';

const bubbles = [
  { size: 260, left: '6%', top: '12%', opacity: 0.22, duration: 22, delay: -6 },
  { size: 180, left: '20%', top: '58%', opacity: 0.18, duration: 26, delay: -12 },
  { size: 320, left: '44%', top: '18%', opacity: 0.16, duration: 30, delay: -18 },
  { size: 240, left: '62%', top: '62%', opacity: 0.17, duration: 28, delay: -9 },
  { size: 420, left: '78%', top: '18%', opacity: 0.14, duration: 34, delay: -14 },
  { size: 220, left: '86%', top: '68%', opacity: 0.16, duration: 24, delay: -3 },
  { size: 140, left: '12%', top: '32%', opacity: 0.16, duration: 20, delay: -8 },
  { size: 160, left: '36%', top: '78%', opacity: 0.14, duration: 27, delay: -11 },
  { size: 200, left: '54%', top: '40%', opacity: 0.12, duration: 31, delay: -17 },
  { size: 150, left: '70%', top: '36%', opacity: 0.14, duration: 23, delay: -5 },
  { size: 110, left: '90%', top: '44%', opacity: 0.12, duration: 19, delay: -10 },
  { size: 120, left: '28%', top: '22%', opacity: 0.12, duration: 21, delay: -7 },
] as const;

const WaterBackground = () => {
  const { theme } = useTheme();

  if (theme !== 'water') return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Flowing gradient base */}
      <div
        className="absolute inset-0 water-gradient"
        aria-hidden="true"
      />

      {/* Soft caustics / light waves */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 20% 15%, hsl(199 89% 90% / 0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, hsl(187 70% 92% / 0.28) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Bubbles (light spheres) */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: b.left,
            top: b.top,
            opacity: b.opacity,
            background:
              'radial-gradient(circle at 30% 25%, hsl(0 0% 100% / 0.55) 0%, hsl(199 89% 92% / 0.28) 25%, hsl(199 89% 70% / 0.08) 55%, transparent 72%)',
            border: '1px solid hsl(0 0% 100% / 0.35)',
            boxShadow:
              'inset 0 0 42px hsl(0 0% 100% / 0.35), 0 18px 60px -30px hsl(199 89% 48% / 0.22)',
            transform: 'translate3d(0,0,0)',
            animation: `water-bubble-float ${b.duration}s cubic-bezier(0.22, 1, 0.36, 1) infinite`,
            animationDelay: `${b.delay}s`,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Tiny sparkle dust */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(hsl(199 89% 48% / 0.18) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          backgroundPosition: '0 0',
          maskImage:
            'radial-gradient(ellipse at center, black 35%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 35%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      <style>{`
        @keyframes water-bubble-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          35% { transform: translate3d(14px, -18px, 0) scale(1.02); }
          70% { transform: translate3d(-10px, -34px, 0) scale(0.98); }
        }
      `}</style>
    </div>
  );
};

export default WaterBackground;

