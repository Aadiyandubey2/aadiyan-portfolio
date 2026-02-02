import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';

interface AnimationSettings {
  duration: number;
  stiffness: number;
  damping: number;
  enabled: boolean;
  reducedMotion: boolean;
  isLowEnd: boolean;
  isMobile: boolean;
}

const AnimationContext = createContext<AnimationSettings>({
  duration: 0.6,
  stiffness: 80,
  damping: 20,
  enabled: true,
  reducedMotion: false,
  isLowEnd: false,
  isMobile: false,
});

export const useAnimation = () => useContext(AnimationContext);

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider = ({ children }: AnimationProviderProps) => {
  const { isLowEnd, prefersReducedMotion, isMobile } = useDeviceCapability();

  const settings = useMemo<AnimationSettings>(() => {
    // Fully disabled animations
    if (prefersReducedMotion) {
      return {
        duration: 0,
        stiffness: 300,
        damping: 30,
        enabled: false,
        reducedMotion: true,
        isLowEnd,
        isMobile,
      };
    }

    // Low-end device: minimal animations
    if (isLowEnd) {
      return {
        duration: 0.2,
        stiffness: 200,
        damping: 30,
        enabled: true,
        reducedMotion: false,
        isLowEnd: true,
        isMobile,
      };
    }

    // Mobile: moderate animations
    if (isMobile) {
      return {
        duration: 0.4,
        stiffness: 120,
        damping: 25,
        enabled: true,
        reducedMotion: false,
        isLowEnd: false,
        isMobile: true,
      };
    }

    // Desktop: full animations
    return {
      duration: 0.6,
      stiffness: 80,
      damping: 20,
      enabled: true,
      reducedMotion: false,
      isLowEnd: false,
      isMobile: false,
    };
  }, [isLowEnd, prefersReducedMotion, isMobile]);

  return (
    <AnimationContext.Provider value={settings}>
      {children}
    </AnimationContext.Provider>
  );
};
