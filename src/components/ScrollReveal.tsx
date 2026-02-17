import { ReactNode, useRef, useEffect, useState, memo } from 'react';

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
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '-60px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animationClass = `scroll-reveal-${animation}`;

  return (
    <div
      ref={ref}
      className={`${animationClass} ${isVisible ? 'sr-visible' : 'sr-hidden'} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
});

ScrollReveal.displayName = 'ScrollReveal';
export default ScrollReveal;
