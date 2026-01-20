import React, { useState, useEffect, useRef, HTMLAttributes, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

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
  ({ items, className, radius = 320, mobileRadius = 160, autoRotateSpeed = 0.008, onItemClick, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startRotation, setStartRotation] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const { theme } = useTheme();
    const isAppleTheme = theme === 'water';

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
        if (!isDragging && hoveredIndex === null) {
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
    }, [isDragging, autoRotateSpeed, hoveredIndex]);

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
          "relative w-full flex items-center justify-center",
          isMobile ? "h-[320px]" : "h-[480px] lg:h-[520px]",
          className
        )}
        {...props}
      >
        {/* Apple theme ambient glow */}
        {isAppleTheme && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(147,51,234,0.15) 40%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
          </div>
        )}

        {/* Gallery container */}
        <div
          className="relative w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
          style={{ perspective: isMobile ? '800px' : '1200px' }}
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
              const opacity = Math.max(0.25, 1 - (normalizedAngle / 130));
              const scale = Math.max(0.65, 1 - (normalizedAngle / 250));
              const isFront = normalizedAngle < 45;
              const isHovered = hoveredIndex === i;

              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translateX(-50%) translateY(-50%) rotateY(${itemAngle}deg) translateZ(${activeRadius}px)`,
                    transformStyle: 'preserve-3d',
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <button
                    onClick={() => onItemClick?.(item)}
                    className={cn(
                      "group relative overflow-hidden",
                      // Larger sizes
                      "w-40 h-28 sm:w-52 sm:h-36 md:w-72 md:h-44 lg:w-80 lg:h-48",
                      // Base styling
                      "transition-all duration-300 ease-out",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      // Theme-specific styling
                      isAppleTheme 
                        ? cn(
                            "rounded-2xl md:rounded-3xl",
                            "border border-white/20 dark:border-white/10",
                            "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]",
                            isFront && "shadow-[0_16px_48px_rgba(59,130,246,0.15),0_8px_24px_rgba(0,0,0,0.1)]",
                            isHovered && isFront && "shadow-[0_20px_60px_rgba(59,130,246,0.25),0_12px_32px_rgba(0,0,0,0.15)]"
                          )
                        : cn(
                            "rounded-xl",
                            "border border-border/30 dark:border-border/40",
                            "shadow-md",
                            isFront && "ring-1 ring-border/50"
                          )
                    )}
                    style={{
                      opacity,
                      transform: `rotateY(${-itemAngle - rotation}deg) scale(${isHovered && isFront ? scale * 1.08 : scale})`,
                      backfaceVisibility: 'hidden',
                      pointerEvents: normalizedAngle < 90 ? 'auto' : 'none',
                    }}
                  >
                    {/* Background image */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-cover bg-center transition-all duration-500",
                        isAppleTheme 
                          ? "saturate-[1.1] group-hover:scale-110" 
                          : "saturate-[0.85] dark:saturate-100 group-hover:scale-105"
                      )}
                      style={{
                        backgroundImage: `url(${item.image.url})`,
                        backgroundPosition: item.image.pos || 'center',
                      }}
                    />
                    
                    {/* Apple theme premium overlay - using soft colors for light theme */}
                    {isAppleTheme ? (
                      <>
                        {/* Soft gradient overlay - uses slate/blue tones instead of harsh black */}
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(to top, rgba(30,41,59,0.85) 0%, rgba(51,65,85,0.4) 50%, rgba(100,116,139,0.1) 100%)',
                          }}
                        />
                        {/* Subtle color accent on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {/* Bottom frosted area with matching color */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-16 md:h-20"
                          style={{
                            background: 'linear-gradient(to top, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.6) 70%, transparent 100%)',
                            backdropFilter: 'blur(4px)',
                          }}
                        />
                        {/* Shine effect */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)',
                          }}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/50 to-card/10 dark:from-background/95 dark:via-background/50 dark:to-background/20" />
                    )}
                    
                    {/* Content */}
                    <div className={cn(
                      "absolute bottom-0 left-0 right-0 text-left",
                      isAppleTheme ? "p-3 sm:p-4 md:p-5" : "p-2 sm:p-3 md:p-4"
                    )}>
                      <div className="flex items-center gap-2 sm:gap-2.5 mb-0.5 sm:mb-1">
                        {item.icon && (
                          <span className={cn(
                            "transition-all duration-300",
                            isAppleTheme 
                              ? "text-white/80 group-hover:text-white group-hover:scale-110" 
                              : "text-foreground/60 group-hover:text-foreground/80",
                            "text-sm sm:text-base md:text-lg"
                          )}>
                            {item.icon}
                          </span>
                        )}
                        <h4 className={cn(
                          "font-heading font-semibold truncate transition-all duration-300",
                          isAppleTheme 
                            ? "text-white text-sm sm:text-base md:text-lg group-hover:translate-x-1" 
                            : "text-foreground text-xs sm:text-sm md:text-base"
                        )}>
                          {item.title}
                        </h4>
                      </div>
                      <p className={cn(
                        "line-clamp-1 hidden sm:block transition-all duration-300",
                        isAppleTheme 
                          ? "text-white/60 text-xs sm:text-sm group-hover:text-white/80" 
                          : "text-muted-foreground text-[10px] sm:text-xs"
                      )}>
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Apple theme hover border glow */}
                    {isAppleTheme && isFront && (
                      <div 
                        className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
                        }}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drag hint - enhanced for Apple theme */}
        <div className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none",
          "text-xs",
          isAppleTheme 
            ? "text-muted-foreground/40 font-light tracking-wider" 
            : "text-muted-foreground/50"
        )}>
          ← Drag to explore →
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
