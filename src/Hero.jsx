import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function Hero({ onGetStarted }) {
  return (
    <Box sx={{
      minHeight: 500,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #4caf50 0%, #2196f3 100%)',
      borderRadius: 6,
      color: '#fff',
      p: 6,
      boxShadow: 6,
      mt: 6
    }}>
      <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, letterSpacing: 2 }}>
        GrocyGo
      </Typography>
      <Typography variant="h5" sx={{ mb: 3, maxWidth: 600 }}>
        Smart Grocery & Meal Management for the Future. <br />
        AI-powered, collaborative, and beautiful.
      </Typography>
      <Button variant="contained" size="large" color="secondary" sx={{ fontWeight: 700, fontSize: 20, px: 6, py: 1.5, borderRadius: 8 }} onClick={onGetStarted}>
        Get Started
      </Button>
    </Box>
  );
}
