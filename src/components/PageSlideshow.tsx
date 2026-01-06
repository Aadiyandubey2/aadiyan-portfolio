import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Code, Briefcase, Award, Film, Mail } from 'lucide-react';

const pages = [
  { 
    path: '/about', 
    label: 'About Me', 
    icon: User, 
    description: 'Learn about my journey and background',
    gradient: 'from-cyan-500/20 to-blue-500/20'
  },
  { 
    path: '/skills', 
    label: 'Skills', 
    icon: Code, 
    description: 'Technologies and tools I work with',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  { 
    path: '/projects', 
    label: 'Projects', 
    icon: Briefcase, 
    description: 'Featured work and case studies',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  { 
    path: '/certificates', 
    label: 'Certificates', 
    icon: Award, 
    description: 'Certifications and achievements',
    gradient: 'from-yellow-500/20 to-orange-500/20'
  },
  { 
    path: '/showcase', 
    label: 'Showcase', 
    icon: Film, 
    description: 'Videos and media highlights',
    gradient: 'from-red-500/20 to-rose-500/20'
  },
  { 
    path: '/contact', 
    label: 'Contact', 
    icon: Mail, 
    description: 'Get in touch with me',
    gradient: 'from-indigo-500/20 to-violet-500/20'
  },
];

const PageSlideshow = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
      transition: {
        duration: 0.5,
        ease: "easeIn" as const,
      },
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      const next = prev + newDirection;
      if (next < 0) return pages.length - 1;
      if (next >= pages.length) return 0;
      return next;
    });
  };

  const handleNavigate = () => {
    navigate(pages[currentIndex].path);
  };

  const currentPage = pages[currentIndex];
  const Icon = currentPage.icon;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Explore <span className="neon-text">My Portfolio</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Navigate through different sections to learn more about me
          </p>
        </motion.div>

        {/* 3D Slideshow Container */}
        <div 
          ref={containerRef}
          className="relative h-[350px] sm:h-[400px] perspective-1000"
        >
          {/* Navigation Arrows */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all group"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => paginate(1)}
            className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all group"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Cards Container */}
          <div className="absolute inset-0 flex items-center justify-center px-12 sm:px-20">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full max-w-md cursor-pointer"
                onClick={handleNavigate}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={`glass-card rounded-2xl p-8 sm:p-10 text-center hover:border-primary/50 transition-all duration-300 bg-gradient-to-br ${currentPage.gradient}`}>
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
                  >
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl font-heading font-bold mb-3 text-foreground"
                  >
                    {currentPage.label}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground mb-6"
                  >
                    {currentPage.description}
                  </motion.p>

                  {/* CTA */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <span>Explore</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Page Indicators */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-6 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to ${pages[index].label}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageSlideshow;
