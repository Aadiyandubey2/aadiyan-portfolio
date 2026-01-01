import { motion, Variants } from 'framer-motion';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-12 overflow-hidden">
      {/* Wave Divider */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V120Z"
            fill="url(#wave-gradient)"
            fillOpacity="0.1"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="1440" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 sm:px-6"
      >
        <div className="flex flex-col items-center">
          {/* Back to Top */}
          <motion.button
            variants={itemVariants}
            onClick={scrollToTop}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 sm:mb-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>

          {/* Logo */}
          <motion.a
            variants={itemVariants}
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
            className="font-heading font-bold text-2xl sm:text-3xl neon-text mb-3 sm:mb-4 hover:scale-105 transition-transform"
          >
            AD
          </motion.a>

          {/* Tagline */}
          <motion.p variants={itemVariants} className="text-muted-foreground font-body text-center mb-6 sm:mb-8 max-w-md text-xs sm:text-base px-4">
            Designed, Developed & Powered by <span className="text-primary">Aadiyan Dubey</span>
          </motion.p>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            {['Home', 'About', 'Skills', 'Projects', 'Contact'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(`#${link.toLowerCase()}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-body"
              >
                {link}
              </a>
            ))}
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants} className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { name: 'LinkedIn', url: 'https://www.linkedin.com/in/aadiyan-dubey-234ab5274', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              { name: 'VishwaGuru', url: 'https://vishwaguru.site', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                aria-label={social.name}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d={social.icon} />
                </svg>
              </a>
            ))}
          </motion.div>

          {/* Copyright */}
          <motion.div variants={itemVariants} className="text-center px-4">
            <p className="text-xs sm:text-sm text-muted-foreground font-mono">
              © {new Date().getFullYear()} Aadiyan Dubey. All rights reserved.
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-2 font-mono">
              Built with React, Three.js & Framer Motion
            </p>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;