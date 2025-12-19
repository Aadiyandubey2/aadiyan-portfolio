import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Background3D from './Background3D';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';

// Static screenshot fallback URL (using a placeholder since we can't capture live)
const FALLBACK_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" fill="#0a0a0f">
    <rect width="1600" height="900" fill="#0a0a0f"/>
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#00d4ff" stop-opacity="0.1"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#g1)"/>
    <text x="800" y="420" font-family="system-ui" font-size="48" fill="#ffffff" text-anchor="middle" opacity="0.9">VishwaGuru.site</text>
    <text x="800" y="480" font-family="system-ui" font-size="24" fill="#a1a1aa" text-anchor="middle">Numerology Predictions Platform</text>
    <text x="800" y="540" font-family="system-ui" font-size="16" fill="#00d4ff" text-anchor="middle">Click "Visit Site" to view live</text>
  </svg>
`);

// 3D-styled feature icons
const FeatureIcon = ({ type, color }: { type: string; color: string }) => {
  const icons: Record<string, JSX.Element> = {
    globe: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="grad-globe" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}66`} />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" stroke="url(#grad-globe)" strokeWidth="2" fill={`${color}22`} filter="drop-shadow(0 0 8px currentColor)"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="url(#grad-globe)" strokeWidth="1.5" fill="none"/>
        <ellipse cx="12" cy="12" rx="4" ry="10" stroke="url(#grad-globe)" strokeWidth="1.5" fill="none"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke="url(#grad-globe)" strokeWidth="1"/>
      </svg>
    ),
    crystal: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="grad-crystal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}66`} />
          </linearGradient>
        </defs>
        <path d="M12 2L20 8L12 22L4 8L12 2Z" stroke="url(#grad-crystal)" strokeWidth="2" fill={`${color}33`} filter="drop-shadow(0 0 10px currentColor)"/>
        <path d="M4 8H20" stroke="url(#grad-crystal)" strokeWidth="1.5"/>
        <path d="M12 2V22" stroke="url(#grad-crystal)" strokeWidth="1"/>
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="grad-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}66`} />
          </linearGradient>
        </defs>
        <path d="M12 2L4 6V12C4 16.42 7.36 20.49 12 22C16.64 20.49 20 16.42 20 12V6L12 2Z" stroke="url(#grad-shield)" strokeWidth="2" fill={`${color}22`} filter="drop-shadow(0 0 8px currentColor)"/>
        <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="grad-chart" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}66`} />
          </linearGradient>
        </defs>
        <path d="M3 3V21H21" stroke="url(#grad-chart)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 16L11 10L15 14L21 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 6px currentColor)"/>
      </svg>
    ),
    bolt: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="grad-bolt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}66`} />
          </linearGradient>
        </defs>
        <path d="M13 2L4 14H11L10 22L20 10H13L13 2Z" stroke="url(#grad-bolt)" strokeWidth="2" fill={`${color}33`} strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 10px currentColor)"/>
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="grad-phone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}66`} />
          </linearGradient>
        </defs>
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="url(#grad-phone)" strokeWidth="2" fill={`${color}22`} filter="drop-shadow(0 0 8px currentColor)"/>
        <circle cx="12" cy="18" r="1.5" fill={color}/>
        <line x1="8" y1="5" x2="16" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  };

  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10" style={{ color }}>
      {icons[type] || icons.crystal}
    </div>
  );
};

const features = [
  { icon: 'globe', color: '#00d4ff', title: 'Multi-language', desc: 'English & Hindi support' },
  { icon: 'crystal', color: '#8b5cf6', title: 'Numerology', desc: 'Birth date predictions' },
  { icon: 'shield', color: '#10b981', title: 'JWT Auth', desc: 'Secure authentication' },
  { icon: 'chart', color: '#f59e0b', title: 'SEO', desc: 'Optimized visibility' },
  { icon: 'bolt', color: '#ef4444', title: 'Fast', desc: 'Performance optimized' },
  { icon: 'phone', color: '#3b82f6', title: 'Responsive', desc: 'All devices' },
];

const techStack = ['React', 'Node.js', 'Express.js', 'Supabase', 'JWT', 'Tailwind CSS'];

// Live Preview Component with fallback
const LivePreview = ({ isLowEnd }: { isLowEnd: boolean }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showLive, setShowLive] = useState(!isLowEnd);

  useEffect(() => {
    // For low-end devices, don't even try to load iframe
    if (isLowEnd) {
      setShowLive(false);
      setIsLoading(false);
    }
  }, [isLowEnd]);

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className="relative bg-muted/20">
      {/* Badges */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex gap-2">
        <span className={`px-2.5 sm:px-3 py-1 rounded-full ${showLive && !hasError ? 'bg-green-500/90' : 'bg-muted/90'} text-white text-[10px] sm:text-xs font-mono font-semibold backdrop-blur-sm flex items-center gap-1.5`}>
          {showLive && !hasError ? (
            <>
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </>
          ) : (
            'PREVIEW'
          )}
        </span>
        <span className="px-2.5 sm:px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] sm:text-xs font-mono font-semibold backdrop-blur-sm">
          Full Stack
        </span>
      </div>
      
      {/* Loading State */}
      {isLoading && showLive && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-muted-foreground">Loading live preview...</span>
          </div>
        </div>
      )}
      
      {/* Preview Area */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/9]">
        {showLive && !hasError ? (
          <iframe
            src="https://vishwaguru.site"
            title="VishwaGuru - Live Preview"
            className="w-full h-full border-0"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center relative group cursor-pointer"
            style={{ backgroundImage: `url("${FALLBACK_IMAGE}")` }}
            onClick={() => window.open('https://vishwaguru.site', '_blank')}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-4 py-2 rounded-lg bg-primary/90 text-primary-foreground text-sm font-semibold">
                Click to view live site
              </span>
            </div>
            {isLowEnd && (
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-muted/80 text-[10px] text-muted-foreground">
                Static preview for performance
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { isLowEnd } = useDeviceCapability();

  return (
    <section id="projects" className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
      <Background3D variant="section" color="#8b5cf6" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-card text-xs sm:text-sm font-mono text-primary border border-primary/30 mb-4 sm:mb-6">
            Featured Project
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
            My <span className="neon-text">Work</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <LivePreview isLowEnd={isLowEnd} />

          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5 sm:mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold mb-2">
                  VishwaGuru<span className="text-primary">.site</span>
                </h3>
                <p className="text-muted-foreground font-body text-xs sm:text-sm max-w-lg">
                  A numerology predictions platform supporting English and Hindi with JWT authentication and SEO optimization.
                </p>
              </div>
              
              <a
                href="https://vishwaguru.site"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-heading font-semibold text-xs sm:text-sm text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-glow-cyan transition-all whitespace-nowrap"
              >
                Visit Site
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="mb-5 sm:mb-6">
              <p className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase mb-2 sm:mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {techStack.map((tech, index) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono bg-muted/50 text-foreground/80 border border-border/30"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-all group"
                >
                  <div className="mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">
                    <FeatureIcon type={feature.icon} color={feature.color} />
                  </div>
                  <p className="text-[10px] sm:text-xs font-heading font-semibold">{feature.title}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;