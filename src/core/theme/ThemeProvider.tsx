import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Scheme = 'light' | 'dark' | 'auto';

type ThemeContextValue = {
  scheme: Scheme;
  resolvedScheme: 'light' | 'dark';
  setScheme: (scheme: Scheme) => void;
  toggleScheme: (next?: Scheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const getSystemScheme = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return 'light' as const;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(getSystemScheme);
  const [scheme, setScheme] = useLocalStorage<Scheme>({
    key: 'FlowConsole-theme',
    defaultValue: 'auto',
    getInitialValueInEffect: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      setSystemScheme(event.matches ? 'dark' : 'light');
    };
    // ensure state matches current
    setSystemScheme(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const resolvedScheme: 'light' | 'dark' = scheme === 'auto' ? systemScheme : scheme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedScheme;
  }, [resolvedScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      resolvedScheme,
      setScheme,
      toggleScheme: (next) => {
        if (next) {
          setScheme(next);
          return;
        }
        setScheme((current) => {
          if (current === 'auto') return 'dark';
          if (current === 'dark') return 'light';
          return 'auto';
        });
      },
    }),
    [resolvedScheme, scheme, setScheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider
        defaultColorScheme="auto"
        forceColorScheme={resolvedScheme}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
}
