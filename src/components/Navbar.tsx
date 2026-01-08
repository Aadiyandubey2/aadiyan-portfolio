import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-3" : "py-5"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 ${
              isScrolled ? "glass-card" : ""
            }`}
          >
            {/* Logo */}
            <Link to="/" className="font-heading font-bold text-xl neon-text hover:scale-105 transition-transform">
              <svg width="56" height="56" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                {/* Glow & depth using SVG filter (no CSS needed) */}
                <defs>
                  <filter id="glow3d" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="2" stdDeviation="1" floodColor="black" floodOpacity="0.35" />
                    <feDropShadow dx="4" dy="4" stdDeviation="2" floodColor="black" floodOpacity="0.25" />
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="currentColor" floodOpacity="0.8" />
                  </filter>
                </defs>
                ```
                {/* A letter */}
                <text x="20" y="75" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="64" filter="url(#glow3d)">
                  A
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="-4 35 65"
                    to="4 35 65"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                </text>
                {/* D letter */}
                <text x="58" y="75" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="64" filter="url(#glow3d)">
                  D
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="4 75 65"
                    to="-4 75 65"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                </text>
                {/* Eyes inside D */}
                <g>
                  {/* Eye whites */}
                  <ellipse cx="78" cy="58" rx="6" ry="5" fill="white" />
                  <ellipse cx="92" cy="58" rx="6" ry="5" fill="white" />

                  {/* Pupils with subtle roaming */}
                  <circle cx="78" cy="58" r="2.5" fill="black">
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="-1 0"
                      to="1 0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="92" cy="58" r="2.5" fill="black">
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="1 0"
                      to="-1 0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Blink effect */}
                  <rect x="70" y="56" width="32" height="4" fill="currentColor" opacity="0">
                    <animate
                      attributeName="opacity"
                      values="0;0;1;0;0"
                      keyTimes="0;0.9;0.93;0.96;1"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </rect>
                </g>
                ```
              </svg>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative px-3 py-2 font-body text-sm font-medium transition-colors duration-300 rounded-lg hover:text-primary ${
                    isActive(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              to="/contact"
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-semibold text-sm text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-glow-cyan transition-all duration-300 hover:scale-105"
            >
              <span>Let's Talk</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <motion.span
                  animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }}
                  className="w-full h-0.5 bg-foreground rounded-full origin-left"
                />
                <motion.span
                  animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                  className="w-full h-0.5 bg-foreground rounded-full"
                />
                <motion.span
                  animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
                  className="w-full h-0.5 bg-foreground rounded-full origin-left"
                />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden pt-24"
          >
            <div
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative mx-6 p-6 glass-card rounded-2xl"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl font-body font-medium transition-all duration-300 ${
                        isActive(link.href)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <Link
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block mt-4 px-4 py-3 rounded-xl font-heading font-semibold text-center text-primary-foreground bg-gradient-to-r from-primary to-accent"
                  >
                    Let's Talk
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
