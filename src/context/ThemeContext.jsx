import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('en');
  const [compactMode, setCompactMode] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedAppearance = localStorage.getItem('appearance');
    if (savedAppearance) {
      const appearance = JSON.parse(savedAppearance);
      setTheme(appearance.theme || 'light');
      setFontSize(appearance.fontSize || 'medium');
      setLanguage(appearance.language || 'en');
      setCompactMode(appearance.compactMode || false);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'system');
    
    if (theme === 'system') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemPrefersDark ? 'dark' : 'light');
    } else {
      // Use selected theme
      root.classList.add(theme);
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);

    // Apply compact mode
    if (compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [theme, fontSize, compactMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const updateAppearance = (newSettings) => {
    if (newSettings.theme !== undefined) setTheme(newSettings.theme);
    if (newSettings.fontSize !== undefined) setFontSize(newSettings.fontSize);
    if (newSettings.language !== undefined) setLanguage(newSettings.language);
    if (newSettings.compactMode !== undefined) setCompactMode(newSettings.compactMode);

    // Save to localStorage
    const appearance = {
      theme: newSettings.theme || theme,
      fontSize: newSettings.fontSize || fontSize,
      language: newSettings.language || language,
      compactMode: newSettings.compactMode !== undefined ? newSettings.compactMode : compactMode
    };
    
    localStorage.setItem('appearance', JSON.stringify(appearance));
  };

  const value = {
    theme,
    fontSize,
    language,
    compactMode,
    updateAppearance,
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
