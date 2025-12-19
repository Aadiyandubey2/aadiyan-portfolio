import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import vishwaguruScreenshot from '@/assets/vishwaguru-screenshot.png';

const features = [
  { icon: '🌐', title: 'Multi-language', desc: 'English & Hindi support' },
  { icon: '🔮', title: 'Numerology', desc: 'Birth date predictions' },
  { icon: '🔐', title: 'JWT Auth', desc: 'Secure authentication' },
  { icon: '📈', title: 'SEO', desc: 'Optimized visibility' },
  { icon: '⚡', title: 'Fast', desc: 'Performance optimized' },
  { icon: '📱', title: 'Responsive', desc: 'All devices' },
];

const techStack = ['React', 'Node.js', 'Express.js', 'Supabase', 'JWT', 'Tailwind CSS'];

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-background" />

      <div className="relative max-w-5xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-5 py-2.5 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-6">
            Featured Project
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            My <span className="neon-text">Work</span>
          </h2>
        </motion.div>

        {/* Project Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Project Image */}
          <div className="relative overflow-hidden">
            <img 
              src={vishwaguruScreenshot} 
              alt="VishwaGuru - Numerology Predictions Platform"
              className="w-full h-auto object-cover"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full bg-green-500/90 text-white text-xs font-mono font-semibold backdrop-blur-sm">
                🟢 LIVE
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-mono font-semibold backdrop-blur-sm">
                Full Stack
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                  VishwaGuru<span className="text-primary">.site</span>
                </h3>
                <p className="text-muted-foreground font-body text-sm max-w-lg">
                  A numerology predictions platform supporting English and Hindi with JWT authentication and SEO optimization.
                </p>
              </div>
              
              <a
                href="https://vishwaguru.site"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-semibold text-sm text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-glow-cyan transition-all whitespace-nowrap"
              >
                Visit Site
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Tech Stack */}
            <div className="mb-6">
              <p className="text-xs font-mono text-muted-foreground uppercase mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, index) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-muted/50 text-foreground/80 border border-border/30"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="p-3 rounded-xl bg-muted/30 border border-border/30"
                >
                  <span className="text-lg">{feature.icon}</span>
                  <p className="text-xs font-heading font-semibold mt-1">{feature.title}</p>
                  <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
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