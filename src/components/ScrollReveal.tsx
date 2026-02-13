import { ReactNode, useRef, memo } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { useAnimation } from '@/contexts/AnimationContext';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'slide-up' | 'slide-left' | 'slide-right' | 'scale-up' | 'fade' | 'focus';
  delay?: number;
  className?: string;
  duration?: number;
}

const ScrollReveal = memo(({ 
  children, 
  animation = 'slide-up', 
  delay = 0, 
  className = '',
  duration: customDuration,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { duration, stiffness, damping, enabled, isLowEnd, isMobile } = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  // Enhanced animation variants
  const getAnimationVariants = (): Variants => {
    const distance = isLowEnd ? 15 : isMobile ? 30 : 50;
    const scale = isLowEnd ? 0.98 : isMobile ? 0.96 : 0.92;

    const animations: Record<string, Variants> = {
      'slide-up': {
        hidden: { opacity: 0, y: distance, filter: isLowEnd ? 'none' : 'blur(4px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      },
      'slide-left': {
        hidden: { opacity: 0, x: distance, filter: isLowEnd ? 'none' : 'blur(3px)' },
        visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
      },
      'slide-right': {
        hidden: { opacity: 0, x: -distance, filter: isLowEnd ? 'none' : 'blur(3px)' },
        visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
      },
      'scale-up': {
        hidden: { opacity: 0, scale, filter: isLowEnd ? 'none' : 'blur(6px)' },
        visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      },
      'fade': {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      },
      'focus': {
        hidden: { 
          opacity: 0, 
          scale: 0.85,
          filter: isLowEnd ? 'none' : 'blur(12px)',
          y: isMobile ? 20 : 40,
        },
        visible: { 
          opacity: 1, 
          scale: 1,
          filter: 'blur(0px)',
          y: 0,
        },
      },
    };

    return animations[animation] || animations['slide-up'];
  };

  // Disabled animations - render static
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const finalDuration = customDuration ?? duration;
  const variants = getAnimationVariants();

  return (
    <motion.div 
      ref={ref} 
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        type: 'spring',
        stiffness: animation === 'focus' ? stiffness * 0.8 : stiffness,
        damping: animation === 'focus' ? damping * 1.2 : damping,
        delay: isLowEnd ? delay * 0.3 : delay,
        duration: animation === 'focus' ? finalDuration * 1.2 : finalDuration,
        filter: { duration: finalDuration * 0.8 },
      }}
    >
      {children}
    </motion.div>
  );
});

ScrollReveal.displayName = 'ScrollReveal';
export default ScrollReveal;
