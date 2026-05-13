import React, { createContext, useContext, useState } from 'react';

const lightColors = {
  primary: '#00C77B',
  secondary: '#0099CC',
  background: '#F5F7FA',
  surface: 'rgba(0, 0, 0, 0.04)',
  text: '#1A1A2E',
  textMuted: '#6B7280',
  accent: '#7E57C2',
  error: '#EF4444',
  success: '#00C77B',
  card: 'rgba(0,0,0,0.03)',
  border: 'rgba(0,0,0,0.08)',
};

const darkColors = {
  primary: '#00F5A0',
  secondary: '#00D9F5',
  background: '#050B18',
  surface: 'rgba(255, 255, 255, 0.05)',
  text: '#FFFFFF',
  textMuted: '#A0AEC0',
  accent: '#7E57C2',
  error: '#FF4D4D',
  success: '#00F5A0',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const toggle = () => setIsDark(!isDark);
  const colors = isDark ? darkColors : lightColors;

  const value = {
    isDark,
    toggle,
    colors,
    fonts: { regular: 'System', bold: 'System', heading: 'System' },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    borderRadius: { sm: 8, md: 16, lg: 24, xl: 32, round: 9999 },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

// Static fallback for files that haven't migrated to useTheme yet
export const theme = {
  colors: darkColors,
  fonts: { regular: 'System', bold: 'System', heading: 'System' },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { sm: 8, md: 16, lg: 24, xl: 32, round: 9999 },
};

export const gradients = {
  primary: ['#00F5A0', '#00D9F5'],
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)'],
  dark: ['#050B18', '#1A202C'],
};
