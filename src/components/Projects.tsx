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

// 3D-styled feature icons - clean circular designs
const FeatureIcon = ({ type, color }: { type: string; color: string }) => {
  const icons: Record<string, JSX.Element> = {
    globe: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}/>
        <ellipse cx="12" cy="12" rx="9" ry="4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7"/>
        <ellipse cx="12" cy="12" rx="4" ry="9" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7"/>
      </svg>
    ),
    crystal: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 3L19 9L12 21L5 9L12 3Z" stroke={color} strokeWidth="2" fill={`${color}20`} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }}/>
        <path d="M5 9L12 13L19 9" stroke={color} strokeWidth="1.5" opacity="0.6"/>
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 3L4 7V11C4 15.4 7.4 19.5 12 21C16.6 19.5 20 15.4 20 11V7L12 3Z" stroke={color} strokeWidth="2" fill={`${color}15`} style={{ filter: `drop-shadow(0 0 6px ${color})` }}/>
        <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M4 18L9 12L13 16L20 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }}/>
        <circle cx="4" cy="18" r="2" fill={color} opacity="0.8"/>
        <circle cx="9" cy="12" r="2" fill={color} opacity="0.8"/>
        <circle cx="13" cy="16" r="2" fill={color} opacity="0.8"/>
        <circle cx="20" cy="8" r="2" fill={color} opacity="0.8"/>
      </svg>
    ),
    bolt: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke={color} strokeWidth="2" fill={`${color}25`} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }}/>
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}/>
        <path d="M8 9C8 9 9.5 15 12 15C14.5 15 16 9 16 9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="8" r="1.5" fill={color}/>
        <circle cx="15" cy="8" r="1.5" fill={color}/>
        <path d="M10 17.5H14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
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

// Live Preview Component with fallback - compact sidebar version
const LivePreview = ({ isLowEnd }: { isLowEnd: boolean }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showLive, setShowLive] = useState(!isLowEnd);

  useEffect(() => {
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
    <div className="relative bg-muted/20 rounded-xl overflow-hidden h-full min-h-[220px]">
      {/* Badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className={`px-2 py-0.5 rounded-full ${showLive && !hasError ? 'bg-green-500/90' : 'bg-muted/90'} text-white text-[9px] font-mono font-semibold backdrop-blur-sm flex items-center gap-1`}>
          {showLive && !hasError ? (
            <>
              <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
              LIVE
            </>
          ) : (
            'PREVIEW'
          )}
        </span>
      </div>
      
      {/* Loading State */}
      {isLoading && showLive && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-5">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Preview Area */}
      <div className="w-full h-full">
        {showLive && !hasError ? (
          <iframe
            src="https://vishwaguru.site"
            title="VishwaGuru - Live Preview"
            className="w-full h-full border-0 scale-[0.5] origin-top-left"
            style={{ width: '200%', height: '200%' }}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center relative group cursor-pointer flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))` }}
            onClick={() => window.open('https://vishwaguru.site', '_blank')}
          >
            <div className="text-center p-4">
              <p className="text-sm font-heading font-semibold text-foreground/80">VishwaGuru.site</p>
              <p className="text-[10px] text-muted-foreground mt-1">Click to view</p>
            </div>
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
          className="glass-card rounded-2xl overflow-hidden p-4 sm:p-6"
        >
          {/* Side by side layout */}
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
            {/* Live Preview - Left side */}
            <div className="lg:w-[45%] lg:shrink-0">
              <LivePreview isLowEnd={isLowEnd} />
            </div>

            {/* Content - Right side */}
            <div className="flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold mb-1.5">
                    VishwaGuru<span className="text-primary">.site</span>
                  </h3>
                  <p className="text-muted-foreground font-body text-xs sm:text-sm max-w-md">
                    A numerology predictions platform supporting English and Hindi with JWT authentication and SEO optimization.
                  </p>
                </div>
                
                <a
                  href="https://vishwaguru.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-semibold text-xs text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-glow-cyan transition-all whitespace-nowrap self-start"
                >
                  Visit Site
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Tech Stack */}
              <div className="mb-4">
                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {techStack.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono bg-muted/50 text-foreground/80 border border-border/30"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Features with Icons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-auto">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    className="p-2 rounded-lg bg-muted/30 border border-border/30 hover:border-primary/30 transition-all group flex items-center gap-2"
                  >
                    <div className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform">
                      <FeatureIcon type={feature.icon} color={feature.color} />
                    </div>
                    <div>
                      <p className="text-[10px] font-heading font-semibold leading-tight">{feature.title}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;