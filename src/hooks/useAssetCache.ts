import { useEffect, useCallback, useRef } from 'react';

// Simple in-memory cache for component data
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAssetCache = () => {
  const cacheRef = useRef(memoryCache);

  const getCached = useCallback(<T>(key: string): T | null => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }, []);

  const setCached = useCallback(<T>(key: string, data: T): void => {
    cacheRef.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const clearCache = useCallback((key?: string): void => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return { getCached, setCached, clearCache };
};

// Preload and cache images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check browser cache first
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = async (sources: string[]): Promise<void> => {
  await Promise.all(sources.map(src => preloadImage(src).catch(() => {})));
};

// Custom hook for memoized heavy components
export const useMemoizedData = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = []
) => {
  const { getCached, setCached } = useAssetCache();
  
  useEffect(() => {
    const loadData = async () => {
      const cached = getCached<T>(key);
      if (!cached) {
        try {
          const data = await fetchFn();
          setCached(key, data);
        } catch (error) {
          console.error(`Failed to cache ${key}:`, error);
        }
      }
    };
    
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  return getCached<T>(key);
};

// Store theme preference in localStorage for instant loading
export const getCachedTheme = (): string | null => {
  try {
    return localStorage.getItem('theme-preference');
  } catch {
    return null;
  }
};

export const setCachedTheme = (theme: string): void => {
  try {
    localStorage.setItem('theme-preference', theme);
  } catch {
    // localStorage not available
  }
};

// Store font preference in localStorage
export const getCachedFonts = (): { heading: string; body: string; mono: string } | null => {
  try {
    const stored = localStorage.getItem('font-preference');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setCachedFonts = (fonts: { heading: string; body: string; mono: string }): void => {
  try {
    localStorage.setItem('font-preference', JSON.stringify(fonts));
  } catch {
    // localStorage not available
  }
};
