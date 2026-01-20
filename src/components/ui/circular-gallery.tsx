import React, { useState, useEffect, useRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Define the type for a single gallery item
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

// Define the props for the CircularGallery component
interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
  /** Called when an item is clicked */
  onItemClick?: (item: GalleryItem) => void;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 500, autoRotateSpeed = 0.015, onItemClick, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startRotation, setStartRotation] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Effect for auto-rotation when not dragging
    useEffect(() => {
      const autoRotate = () => {
        if (!isDragging) {
          setRotation(prev => prev + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isDragging, autoRotateSpeed]);

    // Mouse/Touch drag handlers
    const handlePointerDown = (e: React.PointerEvent) => {
      setIsDragging(true);
      setStartX(e.clientX);
      setStartRotation(rotation);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const newRotation = startRotation + (deltaX * 0.3);
      setRotation(newRotation);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    const anglePerItem = 360 / items.length;

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Center content */}
        <div className="absolute z-10 text-center pointer-events-none">
          <h3 className="text-lg md:text-xl font-heading text-muted-foreground">
            Explore
          </h3>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Drag to rotate
          </p>
        </div>

        {/* Gallery container */}
        <div
          ref={containerRef}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            className="absolute w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {items.map((item, i) => {
              const itemAngle = i * anglePerItem;
              const totalRotation = rotation % 360;
              const relativeAngle = (itemAngle + totalRotation + 360) % 360;
              const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
              const opacity = Math.max(0.4, 1 - (normalizedAngle / 180));
              const scale = Math.max(0.7, 1 - (normalizedAngle / 360));

              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <button
                    onClick={() => onItemClick?.(item)}
                    className={cn(
                      "group relative w-48 md:w-64 h-32 md:h-40 rounded-xl overflow-hidden",
                      "border border-border/50 shadow-lg",
                      "transition-all duration-300 hover:scale-105 hover:shadow-xl",
                      "bg-card/80 backdrop-blur-sm",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                    style={{
                      opacity,
                      transform: `rotateY(${-itemAngle - rotation}deg) scale(${scale})`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Background image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${item.image.url})`,
                        backgroundPosition: item.image.pos || 'center',
                      }}
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        {item.icon && (
                          <span className="text-primary">{item.icon}</span>
                        )}
                        <h4 className="font-heading text-sm md:text-base text-foreground font-semibold">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/5 pointer-events-none" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
