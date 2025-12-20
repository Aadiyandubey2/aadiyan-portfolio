import { Suspense, lazy, memo } from 'react';
import { motion } from 'framer-motion';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';

const Spline = lazy(() => import('@splinetool/react-spline'));

// Loading fallback for Spline
const SplineLoading = memo(() => (
  <div className="absolute inset-0 overflow-hidden">
    <div 
      className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse"
      style={{ 
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
        top: '10%',
        left: '10%',
      }}
    />
    <div 
      className="absolute w-72 h-72 rounded-full blur-3xl animate-pulse"
      style={{ 
        background: 'radial-gradient(circle, hsl(var(--accent) / 0.3) 0%, transparent 70%)',
        bottom: '20%',
        right: '15%',
        animationDelay: '1s',
      }}
    />
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }}
    />
  </div>
));

SplineLoading.displayName = 'SplineLoading';

// Static fallback for low-end devices
const StaticHeroBackground = memo(() => (
  <div className="absolute inset-0 overflow-hidden">
    <div 
      className="absolute w-[600px] h-[600px] rounded-full blur-3xl animate-pulse"
      style={{ 
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
      }}
    />
    <div 
      className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
      style={{ 
        background: 'radial-gradient(circle, hsl(var(--accent) / 0.25) 0%, transparent 70%)',
        bottom: '-10%',
        right: '-10%',
        animationDelay: '1.5s',
      }}
    />
    <div 
      className="absolute w-[300px] h-[300px] rounded-full blur-3xl animate-pulse"
      style={{ 
        background: 'radial-gradient(circle, hsl(var(--secondary) / 0.2) 0%, transparent 70%)',
        top: '40%',
        left: '50%',
        animationDelay: '0.75s',
      }}
    />
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-15"
      style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.2) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    />
  </div>
));

StaticHeroBackground.displayName = 'StaticHeroBackground';

const Hero3D = () => {
  const roles = ["Web Developer", "Full Stack Dev", "SEO Expert"];
  const { isLowEnd, supportsWebGL, prefersReducedMotion } = useDeviceCapability();

  const showSpline = supportsWebGL && !prefersReducedMotion && !isLowEnd;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Spline 3D Background */}
      <div className="absolute inset-0">
        {showSpline ? (
          <Suspense fallback={<SplineLoading />}>
            <Spline 
              scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
              style={{ 
                width: '100%', 
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          </Suspense>
        ) : (
          <StaticHeroBackground />
        )}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-6"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card text-xs sm:text-sm font-mono text-primary border border-primary/30">
            &lt;Hello World /&gt;
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-4 sm:mb-6"
        >
          <span className="neon-text">Aadiyan</span>
          <br />
          <span className="text-foreground">Dubey</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6"
        >
          {roles.map((role, index) => (
            <span key={role} className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm sm:text-lg md:text-xl text-foreground font-medium">{role}</span>
              {index < roles.length - 1 && (
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary" />
              )}
            </span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-6 sm:mb-8 font-body"
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
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-[10px] sm:text-xs font-mono">Scroll</span>
            <div className="w-4 h-7 sm:w-5 sm:h-8 rounded-full border border-muted-foreground/50 flex items-start justify-center p-1">
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
