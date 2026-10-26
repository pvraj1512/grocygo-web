import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun
import { useTheme } from '../ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          border: `1px solid ${colors.border}`,
          bgcolor: colors.hover,
          color: colors.text,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            bgcolor: colors.primaryLight,
            borderColor: colors.primary,
            color: colors.primary,
            transform: 'rotate(15deg) scale(1.05)',
          },
        }}
      >
        {isDarkMode ? (
          <Brightness7Icon sx={{ fontSize: 20, color: '#F59E0B' }} />
        ) : (
          <Brightness4Icon sx={{ fontSize: 20, color: '#6366F1' }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
