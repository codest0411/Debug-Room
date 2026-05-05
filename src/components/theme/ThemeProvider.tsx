'use client';

import { useEffect } from 'react';
import { useThemeStore, THEMES } from '@/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, fontStyle } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    const fontMap: Record<'mono' | 'sans' | 'serif', string> = {
      mono: "'JetBrains Mono', 'Space Mono', monospace",
      sans: "'Inter', sans-serif",
      serif: "'Georgia', serif",
    };
    root.style.setProperty('--font-body', fontMap[fontStyle] ?? fontMap.mono);
  }, [theme, fontStyle]);

  return <>{children}</>;
}
