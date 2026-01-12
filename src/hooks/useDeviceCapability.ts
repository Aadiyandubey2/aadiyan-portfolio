import { useState, useEffect, useRef } from 'react';

interface DeviceCapability {
  isLowEnd: boolean;
  supportsWebGL: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
  memoryLimited: boolean;
}

// Cache capability check to avoid repeated reflows
let cachedCapability: DeviceCapability | null = null;

const getInitialCapability = (): DeviceCapability => {
  // Return cached if available
  if (cachedCapability) return cachedCapability;
  
  // SSR-safe defaults
  if (typeof window === 'undefined') {
    return {
      isLowEnd: false,
      supportsWebGL: true,
      prefersReducedMotion: false,
      isMobile: false,
      memoryLimited: false,
    };
  }

  // Batch all reads together to minimize reflows
  const ua = navigator.userAgent;
  const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory;
  const cpuCores = navigator.hardwareConcurrency || 2;
  const connection = (navigator as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  
  // Check reduced motion - this doesn't cause reflow
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Use UA detection for mobile to avoid reading innerWidth during initial load
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  
  // Memory and CPU checks
  const memoryLimited = deviceMemory !== undefined && deviceMemory < 4;
  const cpuLimited = cpuCores < 4;
  
  // Connection checks
  const slowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
  const dataSaver = connection?.saveData === true;

  // Defer WebGL check - it's expensive
  let supportsWebGL = true;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    supportsWebGL = !!gl;
  } catch {
    supportsWebGL = false;
  }

  const isLowEnd = !supportsWebGL 
    || prefersReducedMotion 
    || memoryLimited 
    || cpuLimited 
    || slowConnection 
    || dataSaver
    || (isMobileUA && (memoryLimited || cpuLimited));

  cachedCapability = {
    isLowEnd,
    supportsWebGL,
    prefersReducedMotion,
    isMobile: isMobileUA,
    memoryLimited,
  };

  return cachedCapability;
};

export const useDeviceCapability = (): DeviceCapability => {
  const [capability, setCapability] = useState<DeviceCapability>(getInitialCapability);
  const hasCheckedWidth = useRef(false);

  useEffect(() => {
    // Only check window width once after hydration to avoid reflows
    if (!hasCheckedWidth.current && typeof window !== 'undefined') {
      hasCheckedWidth.current = true;
      
      // Use requestIdleCallback or setTimeout to defer width check
      const checkWidth = () => {
        const isMobileWidth = window.innerWidth < 768;
        if (isMobileWidth && !capability.isMobile) {
          const updated = { ...capability, isMobile: true };
          if (!capability.isLowEnd && (capability.memoryLimited || (navigator.hardwareConcurrency || 2) < 4)) {
            updated.isLowEnd = true;
          }
          cachedCapability = updated;
          setCapability(updated);
        }
      };

      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(checkWidth);
      } else {
        setTimeout(checkWidth, 100);
      }
    }
  }, [capability]);

  return capability;
};
