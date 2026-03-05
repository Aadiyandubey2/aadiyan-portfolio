import { useState, useRef, useEffect, ImgHTMLAttributes, memo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Converts image URLs to optimized versions where possible.
 */
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return url;

  // Unsplash optimization
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    let optimized = `${url}${separator}fm=webp&q=75`;
    if (width) optimized += `&w=${width}`;
    return optimized;
  }

  return url;
}

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  /** Desired display width for URL-based optimization */
  optimizedWidth?: number;
  /** Priority image (above-fold) - disables lazy loading */
  priority?: boolean;
  /** Show a shimmer placeholder while loading */
  shimmer?: boolean;
}

// Tiny 1x1 transparent placeholder
const PLACEHOLDER_SRC =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlMmUyZTIiLz48L3N2Zz4=';

const OptimizedImage = memo(({
  src,
  alt,
  optimizedWidth,
  priority = false,
  shimmer = true,
  className,
  style,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  const optimizedSrc = getOptimizedImageUrl(src, optimizedWidth);

  // Use IntersectionObserver for lazy loading with margin
  useEffect(() => {
    if (priority || isInView) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, isInView]);

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)} style={style}>
      {/* Blur placeholder */}
      {shimmer && !isLoaded && (
        <div
          className="absolute inset-0 bg-muted animate-pulse rounded-[inherit]"
          aria-hidden
        />
      )}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            shimmer && !isLoaded && 'opacity-0',
            shimmer && isLoaded && 'opacity-100',
          )}
          {...props}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };
