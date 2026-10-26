import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true; // Default to modern dark mode
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.body.style.backgroundColor = isDarkMode ? '#0B0F17' : '#F8FAFC';
    document.body.style.color = isDarkMode ? '#F8FAFC' : '#0F172A';
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const colors = useMemo(() => ({
    // Backgrounds
    background: isDarkMode ? '#0B0F17' : '#F8FAFC',
    dotGrid: isDarkMode
      ? 'radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)'
      : 'radial-gradient(rgba(15, 23, 42, 0.05) 1.2px, transparent 1.2px)',
    paper: isDarkMode ? '#111927' : '#FFFFFF',
    cardBg: isDarkMode ? '#152032' : '#FFFFFF',
    surfaceElevated: isDarkMode ? '#1E293B' : '#F1F5F9',

    // Primary text
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',

    // Branding
    primary: '#10B981',        // Modern emerald green
    primaryHover: '#059669',
    primaryLight: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
    secondary: '#FF6B6B',      // Coral sunrise
    secondaryHover: '#E05353',
    secondaryLight: isDarkMode ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 107, 107, 0.1)',
    accent: '#8B5CF6',         // AI violet
    accentLight: isDarkMode ? 'rgba(139, 92, 246, 0.18)' : 'rgba(139, 92, 246, 0.1)',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // UI Neutrals & Glass
    divider: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
    hover: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    glassBg: isDarkMode ? 'rgba(17, 25, 39, 0.78)' : 'rgba(255, 255, 255, 0.85)',
    glassBorder: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
    glassBlur: 'blur(16px)',

    // Shadows
    cardShadow: isDarkMode 
      ? '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.07)' 
      : '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    cardShadowHover: isDarkMode 
      ? '0 20px 35px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.18)' 
      : '0 20px 30px -5px rgba(16, 185, 129, 0.12), 0 0 0 1px rgba(16, 185, 129, 0.25)',

    // Charts & Interactive
    chartGrid: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : '#E2E8F0',
    chartText: isDarkMode ? '#94A3B8' : '#64748B',

    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    gradientSecondary: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    gradientAccent: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    gradientHero: isDarkMode
      ? 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.18) 0%, rgba(139, 92, 246, 0.09) 45%, rgba(11, 15, 23, 0) 100%)'
      : 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(248, 250, 252, 0) 100%)',
  }), [isDarkMode]);

  // MUI Theme with Modern Typography and Component Overrides
  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: colors.primary,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: colors.secondary,
        contrastText: '#FFFFFF',
      },
      background: {
        default: colors.background,
        paper: colors.paper,
      },
      text: {
        primary: colors.text,
        secondary: colors.textSecondary,
      },
      divider: colors.divider,
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, letterSpacing: '-0.015em' },
      h6: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, letterSpacing: '-0.01em' },
      button: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 18px',
            fontSize: '0.9rem',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0px)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
          },
          outlined: {
            borderColor: colors.border,
            '&:hover': {
              borderColor: colors.primary,
              backgroundColor: colors.hover,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: colors.cardBg,
            backgroundImage: 'none',
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            boxShadow: colors.cardShadow,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          rounded: {
            borderRadius: 16,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.paper,
            borderRadius: 20,
            border: `1px solid ${colors.border}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.border,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },
    },
  }), [isDarkMode, colors]);

  const value = {
    isDarkMode,
    toggleTheme,
    colors,
    theme: muiTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
export default ThemeProvider;
