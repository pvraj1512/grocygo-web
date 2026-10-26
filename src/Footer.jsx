import React from 'react';
import { Box, Typography, Link, Container, Stack, IconButton } from '@mui/material';
import { useTheme } from './ThemeContext';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

export default function Footer() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        bgcolor: isDarkMode ? 'rgba(11, 15, 23, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${colors.divider}`,
        py: 4,
        mt: 'auto',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Brand & Tagline */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: colors.gradientPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
            >
              <RestaurantMenuIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: colors.text,
                  letterSpacing: '0.02em',
                }}
              >
                GrocyGo
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                AI-Powered Smart Kitchen & Meal Management
              </Typography>
            </Box>
          </Box>

          {/* Links */}
          <Stack direction="row" spacing={3} sx={{ my: { xs: 1, sm: 0 } }}>
            <Link
              href="#"
              underline="none"
              sx={{
                fontSize: '0.85rem',
                color: colors.textSecondary,
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': { color: colors.primary },
              }}
            >
              Inventory
            </Link>
            <Link
              href="#"
              underline="none"
              sx={{
                fontSize: '0.85rem',
                color: colors.textSecondary,
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': { color: colors.primary },
              }}
            >
              Recipes
            </Link>
            <Link
              href="#"
              underline="none"
              sx={{
                fontSize: '0.85rem',
                color: colors.textSecondary,
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': { color: colors.primary },
              }}
            >
              Meal Planner
            </Link>
            <Link
              href="#"
              underline="none"
              sx={{
                fontSize: '0.85rem',
                color: colors.textSecondary,
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': { color: colors.primary },
              }}
            >
              Privacy
            </Link>
          </Stack>

          {/* Copyright */}
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            © {new Date().getFullYear()} GrocyGo. Made for smarter kitchens.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
