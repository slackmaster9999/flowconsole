import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Scheme = 'light' | 'dark' | 'auto';

type ThemeContextValue = {
  scheme: Scheme;
  resolvedScheme: 'light' | 'dark';
  setScheme: (scheme: Scheme) => void;
  toggleScheme: (next?: Scheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'FlowConsole-theme';

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
  const [scheme, setScheme] = useState<Scheme>('auto');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      setScheme(stored);
    }
  }, []);

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
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = resolvedScheme;
    document.documentElement.style.colorScheme = resolvedScheme;
  }, [resolvedScheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, scheme);
  }, [scheme]);

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
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
