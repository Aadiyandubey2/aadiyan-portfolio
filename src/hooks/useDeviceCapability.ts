import { useState, useEffect } from 'react';

interface DeviceCapability {
  isLowEnd: boolean;
  supportsWebGL: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
  memoryLimited: boolean;
}

export const useDeviceCapability = (): DeviceCapability => {
  const [capability, setCapability] = useState<DeviceCapability>({
    isLowEnd: false,
    supportsWebGL: true,
    prefersReducedMotion: false,
    isMobile: false,
    memoryLimited: false,
  });

  useEffect(() => {
    // Check WebGL support
    const checkWebGL = (): boolean => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch {
        return false;
      }
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth < 768;

    // Check device memory (Chrome only)
    const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory;
    const memoryLimited = deviceMemory !== undefined && deviceMemory < 4;

    // Check hardware concurrency (CPU cores)
    const cpuCores = navigator.hardwareConcurrency || 2;
    const cpuLimited = cpuCores < 4;

    // Check connection type
    const connection = (navigator as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    const slowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
    const dataSaver = connection?.saveData === true;

    const supportsWebGL = checkWebGL();
    
    // Determine if low-end device
    const isLowEnd = !supportsWebGL 
      || prefersReducedMotion 
      || memoryLimited 
      || cpuLimited 
      || slowConnection 
      || dataSaver
      || (isMobile && (memoryLimited || cpuLimited));

    setCapability({
      isLowEnd,
      supportsWebGL,
      prefersReducedMotion,
      isMobile,
      memoryLimited,
    });
  }, []);

  return capability;
};
