import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Stack, Chip } from '@mui/material';
import { useTheme } from './ThemeContext';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenuOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Hero({ onGetStarted }) {
  const { colors, isDarkMode } = useTheme();

  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: colors.gradientHero,
        py: { xs: 6, md: 10 },
      }}
    >
      {/* Decorative ambient background glows */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.12)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Column: Headline & Call To Action */}
          <Grid item xs={12} md={7}>
            {/* Top Floating Badge */}
            <Box
              className="badge-pop"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.8,
                borderRadius: '50px',
                bgcolor: colors.primaryLight,
                border: `1px solid ${colors.primary}44`,
                mb: 3,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 16, color: colors.primary }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary, letterSpacing: '0.04em' }}>
                NEXT-GEN SMART KITCHEN ASSISTANT
              </Typography>
            </Box>

            {/* Main Headline */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 800,
                lineHeight: 1.12,
                mb: 2.5,
                color: colors.text,
              }}
            >
              Master Your Kitchen.{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 50%, #8B5CF6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Zero Food Waste.
              </Box>
            </Typography>

            {/* Subheading */}
            <Typography
              variant="h6"
              sx={{
                color: colors.textSecondary,
                fontWeight: 400,
                lineHeight: 1.6,
                mb: 4,
                maxWidth: 580,
              }}
            >
              GrocyGo automates kitchen inventory tracking, matches recipes to ingredients you already have, plans your weekly meals with AI, and generates smart shopping lists.
            </Typography>

            {/* Action Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={onGetStarted}
                sx={{
                  background: colors.gradientPrimary,
                  px: 4,
                  py: 1.6,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 12px 28px rgba(16, 185, 129, 0.45)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Get Started Free
              </Button>
            </Stack>

            {/* Feature Highlights */}
            <Grid container spacing={2}>
              {[
                'Real-time Expiry Alerts',
                'AI Recipe Matching',
                '1-Click Meal Planner',
                'Automatic Smart Grocery Lists',
              ].map((feat, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: colors.primary, fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textSecondary }}>
                      {feat}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Right Column: Floating Interactive Mockup Cards */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'relative', width: '100%', minHeight: 440, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Central Main Glass Card */}
              <Paper
                className="animate-float"
                elevation={0}
                sx={{
                  width: '100%',
                  maxWidth: 360,
                  p: 3,
                  bgcolor: colors.glassBg,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '24px',
                  boxShadow: colors.cardShadow,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.text }}>
                    Kitchen Overview
                  </Typography>
                  <Chip label="LIVE" size="small" sx={{ bgcolor: `${colors.primary}22`, color: colors.primary, fontWeight: 700, height: 22 }} />
                </Box>

                {/* Sample items */}
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '12px', bgcolor: colors.hover, border: `1px solid ${colors.divider}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ fontSize: 22 }}>🥑</Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>Avocados (Fresh)</Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>Pantry • 4 pieces</Typography>
                      </Box>
                    </Box>
                    <Chip label="Fresh" size="small" sx={{ bgcolor: `${colors.success}22`, color: colors.success, fontWeight: 600, height: 22 }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '12px', bgcolor: colors.hover, border: `1px solid ${colors.divider}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ fontSize: 22 }}>🥛</Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>Organic Milk</Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>Fridge • 1 liter</Typography>
                      </Box>
                    </Box>
                    <Chip label="2 days left" size="small" className="pulse-glow-error" sx={{ bgcolor: `${colors.secondary}22`, color: colors.secondary, fontWeight: 600, height: 22 }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '12px', bgcolor: colors.hover, border: `1px solid ${colors.divider}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ fontSize: 22 }}>🍲</Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>AI Recipe Suggestion</Typography>
                        <Typography variant="caption" sx={{ color: colors.primary }}>92% ingredient match</Typography>
                      </Box>
                    </Box>
                    <Chip label="Ready" size="small" sx={{ bgcolor: `${colors.accent}22`, color: colors.accent, fontWeight: 600, height: 22 }} />
                  </Box>
                </Stack>
              </Paper>

              {/* Top Floating Mini Card */}
              <Paper
                className="animate-float-delayed"
                elevation={0}
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -10,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: colors.glassBg,
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: colors.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primary,
                  }}
                >
                  <AutoAwesomeIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>AI Matched</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.text }}>14 Recipes Ready</Typography>
                </Box>
              </Paper>

              {/* Bottom Floating Mini Card */}
              <Paper
                className="animate-float"
                elevation={0}
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  left: -10,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: colors.glassBg,
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: colors.secondaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.secondary,
                  }}
                >
                  <ShoppingCartIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>Smart List</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.text }}>Auto-Generated</Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
