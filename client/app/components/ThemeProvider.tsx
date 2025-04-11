import React, { useEffect, useState, createContext, useContext } from 'react';
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function ThemeProvider({ children }: { children: React.ReactNode; }) {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      setTheme(saved as Theme || 'dark');
    }
  }, []);
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  return <ThemeContext.Provider value={{
    theme,
    toggleTheme
  }}>
    {children}
  </ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};