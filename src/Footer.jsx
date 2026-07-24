import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{
      width: '100%',
      bgcolor: 'background.paper',
      borderTop: '1px solid #e0e0e0',
      py: 3,
      mt: 8,
      position: 'relative',
      bottom: 0,
      left: 0,
      zIndex: 100,
    }}>
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} GrocyGo. All rights reserved.
        </Typography>
        <Box>
          <Link href="#" color="inherit" underline="hover" sx={{ mx: 1 }}>Privacy Policy</Link>
          <Link href="#" color="inherit" underline="hover" sx={{ mx: 1 }}>Terms</Link>
          <Link href="#" color="inherit" underline="hover" sx={{ mx: 1 }}>Contact</Link>
        </Box>
      </Container>
    </Box>
  );
}
