import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function CompleteMealDialog({ open, onClose, onConfirm, plan }) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Complete Meal</DialogTitle>
      <DialogContent>
        <Typography>
          Did you make the meal "{plan?.name}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>No</Button>
        <Button onClick={() => onConfirm(plan)} variant="contained">Yes</Button>
      </DialogActions>
    </Dialog>
  );
}
