import { useState, useRef, useEffect, ImgHTMLAttributes, memo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Converts image URLs to optimized versions:
 * - Unsplash: adds fm=webp&q=75 for WebP format
 * - Supabase storage: passes through (already optimized at upload)
 * - Local assets: passes through (handled by Vite)
 */
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return url;

  // Unsplash optimization
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    let optimized = `${url}${separator}fm=webp&q=75`;
    if (width) {
      optimized += `&w=${width}`;
    }
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

const OptimizedImage = memo(({
  src,
  alt,
  optimizedWidth,
  priority = false,
  shimmer = true,
  className,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const optimizedSrc = getOptimizedImageUrl(src, optimizedWidth);

  // Check if image is already cached/loaded
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <img
      ref={imgRef}
      src={optimizedSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setIsLoaded(true)}
      className={cn(
        'transition-opacity duration-300',
        shimmer && !isLoaded && 'opacity-0',
        shimmer && isLoaded && 'opacity-100',
        className
      )}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };
