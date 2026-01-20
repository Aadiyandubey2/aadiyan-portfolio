import React, { useState, useEffect, useRef, HTMLAttributes, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface GalleryItem {
  title: string;
  subtitle: string;
  href: string;
  image: {
    url: string;
    alt: string;
    pos?: string;
  };
  icon?: React.ReactNode;
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  mobileRadius?: number;
  autoRotateSpeed?: number;
  onItemClick?: (item: GalleryItem) => void;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 280, mobileRadius = 140, autoRotateSpeed = 0.008, onItemClick, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startRotation, setStartRotation] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Check for mobile
    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const activeRadius = isMobile ? mobileRadius : radius;

    // Smooth auto-rotation with consistent timing
    useEffect(() => {
      const autoRotate = (timestamp: number) => {
        if (!isDragging) {
          const delta = timestamp - lastTimeRef.current;
          if (delta > 16) { // ~60fps cap
            setRotation(prev => prev + autoRotateSpeed * (delta / 16));
            lastTimeRef.current = timestamp;
          }
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isDragging, autoRotateSpeed]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
      setIsDragging(true);
      setStartX(e.clientX);
      setStartRotation(rotation);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [rotation]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      setRotation(startRotation + (deltaX * 0.25));
    }, [isDragging, startX, startRotation]);

    const handlePointerUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    const anglePerItem = 360 / items.length;

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-[280px] sm:h-[340px] md:h-[420px] flex items-center justify-center",
          className
        )}
        {...props}
      >
        {/* Gallery container */}
        <div
          className="relative w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
          style={{ perspective: isMobile ? '600px' : '1000px' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            className="absolute"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.05s linear',
            }}
          >
            {items.map((item, i) => {
              const itemAngle = i * anglePerItem;
              const totalRotation = rotation % 360;
              const relativeAngle = (itemAngle + totalRotation + 360) % 360;
              const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
              const opacity = Math.max(0.3, 1 - (normalizedAngle / 140));
              const scale = Math.max(0.7, 1 - (normalizedAngle / 280));
              const isFront = normalizedAngle < 50;

              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translateX(-50%) translateY(-50%) rotateY(${itemAngle}deg) translateZ(${activeRadius}px)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <button
                    onClick={() => onItemClick?.(item)}
                    className={cn(
                      "group relative rounded-xl overflow-hidden",
                      "w-32 h-24 sm:w-40 sm:h-28 md:w-56 md:h-36",
                      "border border-border/30 dark:border-border/40 shadow-md",
                      "transition-all duration-200",
                      "bg-card/70 dark:bg-card/90 backdrop-blur-sm",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      isFront && "ring-1 ring-border/50"
                    )}
                    style={{
                      opacity,
                      transform: `rotateY(${-itemAngle - rotation}deg) scale(${scale})`,
                      backfaceVisibility: 'hidden',
                      pointerEvents: normalizedAngle < 90 ? 'auto' : 'none',
                    }}
                  >
                    {/* Background image - desaturated for light theme */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105 saturate-[0.85] dark:saturate-100"
                      style={{
                        backgroundImage: `url(${item.image.url})`,
                        backgroundPosition: item.image.pos || 'center',
                      }}
                    />
                    
                    {/* Overlay - stronger for light theme */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/50 to-card/10 dark:from-background/95 dark:via-background/50 dark:to-background/20" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                        {item.icon && (
                          <span className="text-foreground/60 group-hover:text-foreground/80 transition-colors text-xs sm:text-sm">{item.icon}</span>
                        )}
                        <h4 className="font-heading text-xs sm:text-sm md:text-base text-foreground font-semibold truncate">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 hidden sm:block">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drag hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 pointer-events-none">
          ← Drag to explore →
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
