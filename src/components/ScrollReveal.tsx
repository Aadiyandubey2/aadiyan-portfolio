import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAnimation } from '@/contexts/AnimationContext';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'slide-up' | 'slide-left' | 'slide-right' | 'scale-up' | 'fade';
  delay?: number;
  className?: string;
  duration?: number;
}

const ScrollReveal = ({ 
  children, 
  animation = 'slide-up', 
  delay = 0, 
  className = '',
  duration: customDuration,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { duration, stiffness, damping, enabled, isLowEnd, isMobile } = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Use simpler animations on mobile/low-end
  const getAnimationVariants = () => {
    const distance = isLowEnd ? 20 : isMobile ? 40 : 60;
    const scale = isLowEnd ? 0.98 : isMobile ? 0.95 : 0.9;

    const animations = {
      'slide-up': {
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0 },
      },
      'slide-left': {
        hidden: { opacity: 0, x: distance },
        visible: { opacity: 1, x: 0 },
      },
      'slide-right': {
        hidden: { opacity: 0, x: -distance },
        visible: { opacity: 1, x: 0 },
      },
      'scale-up': {
        hidden: { opacity: 0, scale },
        visible: { opacity: 1, scale: 1 },
      },
      'fade': {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      },
    };

    return animations[animation];
  };

  // Disabled animations
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const finalDuration = customDuration ?? duration;

  return (
    <motion.div 
      ref={ref} 
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getAnimationVariants()}
      transition={{
        type: "spring",
        stiffness,
        damping,
        delay: isLowEnd ? delay * 0.5 : delay,
        duration: finalDuration,
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;