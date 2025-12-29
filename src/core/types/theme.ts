export type ThemeControls = {
  scheme: 'light' | 'dark' | 'auto';
  resolvedScheme: 'light' | 'dark';
  toggleScheme: (next?: ThemeControls['scheme']) => void;
};
