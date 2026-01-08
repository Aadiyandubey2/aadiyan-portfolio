import { useTheme } from '@/contexts/ThemeContext';

const WaterBackground = () => {
  const { theme } = useTheme();

  if (theme !== 'water') return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Simple animated water gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(200 30% 98%) 0%, hsl(200 40% 95%) 30%, hsl(199 50% 90%) 60%, hsl(199 60% 85%) 100%)',
        }}
      />
      
      {/* Floating orbs - reduced to 4 for performance */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${150 + i * 60}px`,
            height: `${150 + i * 60}px`,
            left: `${5 + i * 22}%`,
            top: `${15 + (i % 2) * 35}%`,
            background: 'linear-gradient(135deg, hsl(199 89% 70% / 0.2), hsl(187 70% 75% / 0.1), transparent)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsl(199 89% 70% / 0.15)',
            boxShadow: 'inset 0 0 40px hsl(199 89% 90% / 0.2)',
            animation: `float-orb-${i} ${12 + i * 3}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Subtle light overlay */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, hsl(199 89% 90% / 0.3) 0%, transparent 50%)',
        }}
      />
      
      <style>{`
        @keyframes float-orb-0 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -20px); }
        }
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, -25px); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -15px); }
        }
        @keyframes float-orb-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -30px); }
        }
      `}</style>
    </div>
  );
};

export default WaterBackground;
