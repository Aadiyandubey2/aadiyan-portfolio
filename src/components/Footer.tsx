import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/certificates", label: "Certificates" },
  { href: "/showcase", label: "Showcase" },
  { href: "/contact", label: "Contact" },
];

const currentYear = new Date().getFullYear();

const Footer = () => {
  const location = useLocation();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative py-12 overflow-hidden" role="contentinfo" aria-label="Site footer">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center">
          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="mb-6 sm:mb-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:-translate-y-1 active:scale-95 transition-all duration-200 group"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="font-heading font-bold text-xl hover:scale-105 transition-transform">
            <svg width="56" height="56" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="glass3d-footer" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                  <feOffset dx="2" dy="3" result="offset" />
                  <feMerge>
                    <feMergeNode in="offset" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <text x="30" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68" fill="white" filter="url(#glass3d-footer)">
                A
              </text>
              <text x="70" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68" fill="white" filter="url(#glass3d-footer)">
                D
              </text>
            </svg>
          </Link>

          {/* Tagline */}
          <p className="text-muted-foreground font-body text-center mb-6 sm:mb-8 max-w-md text-xs sm:text-base px-4">
            Designed, Developed & Powered by <span className="text-primary">Aadiyan Dubey</span>
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs sm:text-sm transition-colors font-body ${location.pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4 mb-6 sm:mb-8 justify-items-center max-w-lg mx-auto">
            {[
              { name: "LinkedIn", url: "https://www.linkedin.com/in/aadiyan-dubey-234ab5274", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
              { name: "VishwaGuru", url: "https://vishwaguru.site", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
              { name: "Instagram", url: "https://www.instagram.com/aadiyan_dubey0?igsh=MXhnbm43MjJpZXk0ZA==", icon: "M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-.9a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z" },
              { name: "GitHub", url: "https://github.com/Aadiyandubey2", icon: "M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.62-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .5z" },
              { name: "X", url: "https://x.com/aadiyanhere", icon: "M18.9 2H22l-7.19 8.21L23 22h-6.8l-5.33-6.97L4.7 22H1.6l7.7-8.8L1 2h6.9l4.82 6.3L18.9 2z" },
              { name: "Reddit", url: "https://www.reddit.com/user/MobileSorbet1230/", icon: "M24 12c0-1.657-1.343-3-3-3-.454 0-.883.103-1.267.285-1.122-.754-2.635-1.25-4.333-1.346l.773-3.636 2.574.546a1.5 1.5 0 1 0 .153-.725l-2.877-.61a.5.5 0 0 0-.59.39l-.9 4.233c-1.773.04-3.374.545-4.545 1.347A2.99 2.99 0 1 0 6 14.999c0 3.314 4.03 6 9 6s9-2.686 9-6c0-.454-.05-.894-.146-1.312A2.99 2.99 0 0 0 24 12z" },
              { name: "Telegram", url: "https://t.me/@professor_dubey", icon: "M9.04 15.44l-.39 5.49c.56 0 .8-.24 1.1-.53l2.64-2.53 5.47 4c1 .55 1.72.26 1.98-.92l3.59-16.83c.33-1.55-.56-2.16-1.56-1.8L1.6 9.7c-1.52.59-1.5 1.44-.27 1.82l4.61 1.44 10.7-6.75c.5-.33.96-.15.58.18" },
              { name: "YouTube", url: "https://youtube.com/@aadiyan_dubey?si=X-PBRtjLWEAhftOo", icon: "M23.5 6.2a2.94 2.94 0 0 0-2.07-2.08C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.43.52A2.94 2.94 0 0 0 .5 6.68C0 8.52 0 12 0 12s0 3.48.5 5.32a2.94 2.94 0 0 0 2.07 2.08C4.4 19.92 12 19.92 12 19.92s7.6 0 9.43-.52a2.94 2.94 0 0 0 2.07-2.08C24 15.48 24 12 24 12zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
              { name: "Steam", url: "https://steamcommunity.com/profiles/76561199468585484", icon: "M12 0C5.372 0 0 5.372 0 12c0 5.214 3.324 9.63 7.938 11.24l-1.098-3.65a3.87 3.87 0 1 1 4.55-5.69l4.18-2.98a4.5 4.5 0 1 1 3.48 3.9l-4.18 2.98a3.87 3.87 0 0 1-7.14 2.23l1.15 3.83A12 12 0 0 0 24 12C24 5.372 18.628 0 12 0z" },
              { name: "Discord", url: "https://discord.com/users/640874575357542420", icon: "M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0a12.2983 12.2983 0 0 0-.6178-1.2495.077.077 0 0 0-.0785-.037c-1.677.482-4.2263 1.3121-4.8852 1.5152a.0699.0699 0 0 0-.0321.0277C2.857 9.0458 2.1077 13.5799 2.369 18.0578a.0824.0824 0 0 0 .0312.0561c2.05 1.5076 4.0054 2.423 5.874 3.0294a.0777.0777 0 0 0 .0842-.0276c.4536-.6304.8578-1.2952 1.2035-1.9942a.0763.0763 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1971.3728.2914a.077.077 0 0 1-.0066.1277 12.2988 12.2988 0 0 1-1.873.8923.0766.0766 0 0 0-.0407.1057c.347.699.7512 1.3638 1.2048 1.9942a.076.076 0 0 0 .0842.0276c1.8687-.6064 3.8241-1.5218 5.8731-3.0294a.077.077 0 0 0 .0313-.0561c.5004-5.177-.8387-9.5825-2.9922-13.66a.0686.0686 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.1569-2.4189 1.2108 0 2.1852 1.0957 2.1568 2.419 0 1.3333-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2107 0 2.1851 1.0957 2.1567 2.419 0 1.3333-.946 2.4189-2.1567 2.4189z" },
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 border border-border/30"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d={social.icon} />
                </svg>
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center px-4">
            <p className="text-xs sm:text-sm text-muted-foreground font-mono">
              © {currentYear} Aadiyan Dubey. All rights reserved.
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-2 font-sans">
              Built with React, Three.js & Framer Motion
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
