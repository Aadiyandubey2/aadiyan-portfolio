import { useState, useEffect, useCallback, useMemo } from 'react';

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  key: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Memory cache for runtime data
const memoryCache = new Map<string, CacheEntry<unknown>>();

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Get from localStorage with TTL check
const getFromStorage = <T>(key: string): T | null => {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const entry: CacheEntry<T> = JSON.parse(item);
    const now = Date.now();
    
    // Check if expired
    if (entry.ttl > 0 && now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
};

// Set to localStorage with TTL
const setToStorage = <T>(key: string, data: T, ttl: number): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded
    console.warn('LocalStorage quota exceeded, clearing old cache');
    clearExpiredCache();
  }
};

// Clear expired cache entries
const clearExpiredCache = (): void => {
  if (!isLocalStorageAvailable()) return;
  
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('cache_')) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const entry: CacheEntry<unknown> = JSON.parse(item);
          if (entry.ttl > 0 && now - entry.timestamp > entry.ttl) {
            keysToRemove.push(key);
          }
        }
      } catch {
        keysToRemove.push(key!);
      }
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Hook for cached data fetching
export function useCache<T>(
  config: CacheConfig,
  fetcher: () => Promise<T>
): { data: T | null; isLoading: boolean; error: Error | null; refresh: () => void } {
  const { key, ttl = 5 * 60 * 1000 } = config; // Default 5 minutes
  const cacheKey = `cache_${key}`;
  
  const [data, setData] = useState<T | null>(() => {
    // Try memory cache first
    const memoryEntry = memoryCache.get(cacheKey) as CacheEntry<T> | undefined;
    if (memoryEntry) {
      const now = Date.now();
      if (memoryEntry.ttl <= 0 || now - memoryEntry.timestamp < memoryEntry.ttl) {
        return memoryEntry.data;
      }
    }
    // Then try localStorage
    return getFromStorage<T>(cacheKey);
  });
  
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      
      // Update both caches
      const entry: CacheEntry<T> = {
        data: result,
        timestamp: Date.now(),
        ttl
      };
      memoryCache.set(cacheKey, entry as CacheEntry<unknown>);
      setToStorage(cacheKey, result, ttl);
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fetch failed'));
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, fetcher, ttl]);
  
  useEffect(() => {
    // If no cached data, fetch
    if (!data) {
      fetchData();
    }
  }, [data, fetchData]);
  
  const refresh = useCallback(() => {
    memoryCache.delete(cacheKey);
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(cacheKey);
    }
    setData(null);
  }, [cacheKey]);
  
  return { data, isLoading, error, refresh };
}

// Hook for caching theme preferences
export function useThemeCache() {
  const key = 'cache_theme_preferences';
  
  const getCachedTheme = useCallback((): { theme: string; fonts: unknown } | null => {
    return getFromStorage(key);
  }, []);
  
  const setCachedTheme = useCallback((theme: string, fonts: unknown) => {
    setToStorage(key, { theme, fonts }, 30 * 24 * 60 * 60 * 1000); // 30 days
  }, []);
  
  return { getCachedTheme, setCachedTheme };
}

// Memoization helper for expensive computations
export function useMemoizedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T;
}

// Static asset preloader
export function preloadAssets(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        } else if (url.match(/\.(woff|woff2|ttf|otf)$/i)) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.href = url;
          link.crossOrigin = 'anonymous';
          link.onload = () => resolve();
          link.onerror = reject;
          document.head.appendChild(link);
        } else {
          resolve();
        }
      });
    })
  );
}

// Clear all cache
export function clearAllCache(): void {
  memoryCache.clear();
  if (isLocalStorageAvailable()) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export default useCache;
