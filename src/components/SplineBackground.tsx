import { Suspense, lazy, memo } from 'react';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineBackgroundProps {
  variant?: 'hero' | 'section' | 'minimal';
}

// Free public Spline scenes for different variants
const SCENE_URLS = {
  hero: 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode',
  section: 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode',
  minimal: 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode',
};

// Fallback gradient for loading state
const LoadingFallback = memo(({ variant }: { variant: string }) => (
  <div className="absolute inset-0 overflow-hidden opacity-30">
    <div 
      className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse"
      style={{ 
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
        top: '10%',
        left: '10%',
      }}
    />
    <div 
      className="absolute w-72 h-72 rounded-full blur-3xl animate-pulse"
      style={{ 
        background: 'radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)',
        bottom: '20%',
        right: '15%',
        animationDelay: '1s',
      }}
    />
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// Static fallback for devices that can't handle 3D
const StaticFallback = memo(() => (
  <div className="absolute inset-0 overflow-hidden opacity-30">
    <div 
      className="absolute w-64 h-64 rounded-full blur-3xl animate-pulse"
      style={{ 
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
        top: '10%',
        left: '10%',
      }}
    />
    <div 
      className="absolute w-48 h-48 rounded-full blur-3xl animate-pulse"
      style={{ 
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
        bottom: '20%',
        right: '15%',
        animationDelay: '1s',
      }}
    />
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }}
    />
  </div>
));

StaticFallback.displayName = 'StaticFallback';

const SplineBackground = memo(({ variant = 'section' }: SplineBackgroundProps) => {
  const { isLowEnd, supportsWebGL, prefersReducedMotion } = useDeviceCapability();

  // Use static fallback for very low-end devices or those without WebGL
  if (!supportsWebGL || prefersReducedMotion || isLowEnd) {
    return <StaticFallback />;
  }

  return (
    <div className="absolute inset-0 opacity-60 pointer-events-none">
      <Suspense fallback={<LoadingFallback variant={variant} />}>
        <Spline 
          scene={SCENE_URLS[variant]}
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </Suspense>
    </div>
  );
});

SplineBackground.displayName = 'SplineBackground';

export default SplineBackground;
