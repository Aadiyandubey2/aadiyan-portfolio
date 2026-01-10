import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ThemeType = 'space' | 'water';

export interface FontSettings {
  heading: string;
  body: string;
  mono: string;
}

interface ThemeContextType {
  theme: ThemeType;
  fonts: FontSettings;
  setTheme: (theme: ThemeType) => void;
  setFonts: (fonts: FontSettings) => void;
  isLoading: boolean;
}

const defaultFonts: FontSettings = {
  heading: 'Orbitron',
  body: 'Inter',
  mono: 'JetBrains Mono'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Available fonts
export const availableFonts = {
  heading: [
    'Orbitron',
    'Poppins',
    'Montserrat',
    'Playfair Display',
    'Raleway',
    'Bebas Neue',
    'Oswald',
    'Rubik',
    'Space Grotesk',
    'Archivo Black'
  ],
  body: [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Source Sans Pro',
    'Nunito',
    'Work Sans',
    'DM Sans',
    'Plus Jakarta Sans',
    'SF Pro Display'
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'Source Code Pro',
    'IBM Plex Mono',
    'Space Mono',
    'Inconsolata',
    'Roboto Mono',
    'Ubuntu Mono'
  ]
};

// Cache helpers
const CACHE_KEY = 'theme_settings_cache';
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CachedSettings {
  theme: ThemeType;
  fonts: FontSettings;
  timestamp: number;
}

const getCachedSettings = (): CachedSettings | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedSettings = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const setCachedSettings = (theme: ThemeType, fonts: FontSettings): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      theme,
      fonts,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore storage errors
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from cache for instant load
  const cachedSettings = useMemo(() => getCachedSettings(), []);
  
  const [theme, setThemeState] = useState<ThemeType>(cachedSettings?.theme ?? 'space');
  const [fonts, setFontsState] = useState<FontSettings>(cachedSettings?.fonts ?? defaultFonts);
  const [isLoading, setIsLoading] = useState(!cachedSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    applyTheme(theme);
    setCachedSettings(theme, fonts);
  }, [theme]);

  useEffect(() => {
    applyFonts(fonts);
    setCachedSettings(theme, fonts);
  }, [fonts]);

  const loadSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('theme_settings')
        .select('key, value');

      if (data) {
        data.forEach(item => {
          if (item.key === 'active_theme') {
            setThemeState(item.value as unknown as ThemeType);
          } else if (item.key === 'fonts') {
            setFontsState(item.value as unknown as FontSettings);
          }
        });
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyTheme = (newTheme: ThemeType) => {
    const root = document.documentElement;
    
    if (newTheme === 'water') {
      // Apple Water Glass Theme
      root.style.setProperty('--background', '200 30% 98%');
      root.style.setProperty('--foreground', '210 40% 15%');
      root.style.setProperty('--card', '200 40% 96%');
      root.style.setProperty('--card-foreground', '210 40% 15%');
      root.style.setProperty('--popover', '200 40% 98%');
      root.style.setProperty('--popover-foreground', '210 40% 15%');
      root.style.setProperty('--primary', '199 89% 48%');
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--secondary', '210 40% 90%');
      root.style.setProperty('--secondary-foreground', '210 40% 20%');
      root.style.setProperty('--muted', '210 30% 92%');
      root.style.setProperty('--muted-foreground', '210 20% 45%');
      root.style.setProperty('--accent', '187 70% 75%');
      root.style.setProperty('--accent-foreground', '210 40% 15%');
      root.style.setProperty('--destructive', '0 84% 60%');
      root.style.setProperty('--destructive-foreground', '0 0% 100%');
      root.style.setProperty('--border', '210 30% 88%');
      root.style.setProperty('--input', '210 30% 90%');
      root.style.setProperty('--ring', '199 89% 48%');
      document.body.classList.add('water-theme');
      document.body.classList.remove('space-theme');
    } else {
      // Space Theme (default)
      root.style.setProperty('--background', '222 47% 4%');
      root.style.setProperty('--foreground', '210 40% 98%');
      root.style.setProperty('--card', '222 47% 6%');
      root.style.setProperty('--card-foreground', '210 40% 98%');
      root.style.setProperty('--popover', '222 47% 6%');
      root.style.setProperty('--popover-foreground', '210 40% 98%');
      root.style.setProperty('--primary', '187 100% 50%');
      root.style.setProperty('--primary-foreground', '222 47% 4%');
      root.style.setProperty('--secondary', '263 70% 50%');
      root.style.setProperty('--secondary-foreground', '210 40% 98%');
      root.style.setProperty('--muted', '222 47% 12%');
      root.style.setProperty('--muted-foreground', '215 20% 65%');
      root.style.setProperty('--accent', '217 91% 60%');
      root.style.setProperty('--accent-foreground', '210 40% 98%');
      root.style.setProperty('--destructive', '0 84% 60%');
      root.style.setProperty('--destructive-foreground', '210 40% 98%');
      root.style.setProperty('--border', '222 47% 15%');
      root.style.setProperty('--input', '222 47% 15%');
      root.style.setProperty('--ring', '187 100% 50%');
      document.body.classList.add('space-theme');
      document.body.classList.remove('water-theme');
    }
  };

  const applyFonts = (newFonts: FontSettings) => {
    // Load Google Fonts dynamically
    const fontLink = document.getElementById('dynamic-fonts') as HTMLLinkElement;
    const fontsToLoad = [
      `family=${newFonts.heading.replace(/ /g, '+')}:wght@400;500;600;700;800;900`,
      `family=${newFonts.body.replace(/ /g, '+')}:wght@300;400;500;600;700`,
      `family=${newFonts.mono.replace(/ /g, '+')}:wght@400;500`
    ].join('&');
    
    const newHref = `https://fonts.googleapis.com/css2?${fontsToLoad}&display=swap`;
    
    if (fontLink) {
      fontLink.href = newHref;
    } else {
      const link = document.createElement('link');
      link.id = 'dynamic-fonts';
      link.rel = 'stylesheet';
      link.href = newHref;
      document.head.appendChild(link);
    }

    // Apply to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--font-heading', `'${newFonts.heading}', sans-serif`);
    root.style.setProperty('--font-body', `'${newFonts.body}', sans-serif`);
    root.style.setProperty('--font-mono', `'${newFonts.mono}', monospace`);

    // Apply directly to elements
    document.body.style.fontFamily = `'${newFonts.body}', sans-serif`;
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  const setFonts = (newFonts: FontSettings) => {
    setFontsState(newFonts);
  };

  return (
    <ThemeContext.Provider value={{ theme, fonts, setTheme, setFonts, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
