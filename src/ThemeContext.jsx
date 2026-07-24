import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.body.style.backgroundColor = isDarkMode ? '#0a192f' : '#f5f5f5';
    document.body.style.color = isDarkMode ? '#fff' : '#000';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

const theme = {
  isDarkMode,
  toggleTheme,
  colors: {
    // Backgrounds
    background: isDarkMode ? '#101418' : '#F6FCFA',         // Deep charcoal vs light mint-white
    paper: isDarkMode ? '#1A1F24' : '#FFFFFF',              // Panel/card surfaces
    cardBg: isDarkMode ? '#20262C' : '#FFFFFF',             // Cards

    // Primary text
    text: isDarkMode ? '#F0F3F8' : '#1C1F23',               // Soft white vs deep gray
    textSecondary: isDarkMode ? '#A6B2C2' : '#4B5563',      // For subtext and labels

    // Branding
    primary: '#2F9E89',     // Leafy green-teal = healthy + calm
    secondary: '#FF7A59',   // Coral orange = energetic and friendly
    accent: '#C084FC',      // Purple tint = AI/smart touch (used sparingly)
    
    success: '#3CCF4E',
    error: '#FF4C4C',

    // UI Neutrals
    divider: isDarkMode ? '#2C333A' : '#E3E8ED',
    border: isDarkMode ? '#38424D' : '#D1D9E0',
    hover: isDarkMode ? '#25303B' : '#F2F6F9',

    // Charts & Interactive
    chartGrid: isDarkMode ? '#313A45' : '#DCE3EA',
    chartText: isDarkMode ? '#C7D0DC' : '#5A6372',
  }
};



  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
