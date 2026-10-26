import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Paper
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenuOutlined';
import { useTheme } from './ThemeContext';

export default function CompleteMealDialog({ open, onClose, onConfirm, onNotMade, plan }) {
  const { colors } = useTheme();
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.paper,
          p: 1.5,
          borderRadius: '24px',
          boxShadow: colors.cardShadow,
          textAlign: 'center',
        },
      }}
    >
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: colors.primaryLight,
            color: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 36 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: colors.text, mb: 1 }}>
          Meal Completed?
        </Typography>

        <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 2 }}>
          Did you prepare <strong style={{ color: colors.text }}>"{plan?.name}"</strong>?
        </Typography>

        <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', bgcolor: colors.hover, p: 1.5, borderRadius: '12px' }}>
          Confirming will let you review used ingredients and automatically deduct them from your kitchen inventory.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={() => onNotMade(plan)}
          sx={{
            borderRadius: '10px',
            color: colors.textSecondary,
            borderColor: colors.border,
            px: 3,
          }}
        >
          Not Made
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirm(plan)}
          sx={{
            background: colors.gradientPrimary,
            borderRadius: '10px',
            px: 3,
            fontWeight: 700,
          }}
        >
          Yes, I Cooked It!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
