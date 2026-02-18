import { ReactNode, useRef, useEffect, useState, memo } from 'react';
import { useAnimation } from '@/contexts/AnimationContext';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'slide-up' | 'slide-left' | 'slide-right' | 'scale-up' | 'fade' | 'focus';
  delay?: number;
  className?: string;
  duration?: number;
}

// Pure CSS scroll reveal — no framer-motion, no blur filters
// Uses IntersectionObserver + CSS transitions for zero JS animation overhead
const ScrollReveal = memo(({ 
  children, 
  animation = 'slide-up', 
  delay = 0, 
  className = '',
  duration: customDuration,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { enabled, isLowEnd } = useAnimation();
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el); // once only
        }
      },
      { threshold: 0.08, rootMargin: '-40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  // Animations disabled — render static
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const dur = customDuration ?? (isLowEnd ? 0.2 : 0.45);
  const dist = isLowEnd ? 10 : 24;

  // Initial transform based on animation type — no blur at all
  const getInitialTransform = () => {
    switch (animation) {
      case 'slide-up':   return `translateY(${dist}px)`;
      case 'slide-left': return `translateX(${dist}px)`;
      case 'slide-right':return `translateX(-${dist}px)`;
      case 'scale-up':   return `scale(${isLowEnd ? 0.99 : 0.96})`;
      case 'focus':      return `scale(${isLowEnd ? 0.99 : 0.94}) translateY(${dist}px)`;
      case 'fade':
      default:           return 'none';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'none' : getInitialTransform(),
        transition: `opacity ${dur}s ease-out ${delay}s, transform ${dur}s ease-out ${delay}s`,
        willChange: isInView ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
});

ScrollReveal.displayName = 'ScrollReveal';
export default ScrollReveal;
