import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, TextField, Select, MenuItem, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import { useTheme } from './ThemeContext';

const UNIT_OPTIONS = [
  'pieces', 'kg', 'g', 'bag', 'packet', 'box', 'containers', 'lbs', 'loaf', 'tbsp', 'tsp', 'cup'
];

export default function IngredientUsageDialog({ open, onClose, ingredients = [], onConfirm }) {
  const [rows, setRows] = useState([]);
  const { colors } = useTheme();

  useEffect(() => {
    if (open) {
      setRows(
        (ingredients || []).map(name => ({
          name,
          quantity: '1',
          unit: 'pieces'
        }))
      );
    }
  }, [open, ingredients]);

  if (!open) return null;

  const handleChange = (idx, field, value) => {
    setRows(rows =>
      rows.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(rows);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.paper,
          p: 1,
          borderRadius: '24px',
          boxShadow: colors.cardShadow,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: colors.text }}>
          Confirm Ingredient Usage
        </Typography>
        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
          Adjust quantities used so your kitchen inventory is accurately updated
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {rows.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: colors.hover, borderRadius: '12px' }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                No ingredient details found for this meal. Click Confirm to mark as completed.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '14px' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.hover }}>
                    <TableCell sx={{ color: colors.textSecondary, fontWeight: 700, fontSize: '0.8rem' }}>Ingredient</TableCell>
                    <TableCell sx={{ color: colors.textSecondary, fontWeight: 700, fontSize: '0.8rem', width: 110 }}>Quantity</TableCell>
                    <TableCell sx={{ color: colors.textSecondary, fontWeight: 700, fontSize: '0.8rem', width: 120 }}>Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={idx} sx={{ borderBottom: `1px solid ${colors.divider}` }}>
                      <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                        {row.name}
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: 'any' }}
                          value={row.quantity}
                          onChange={e => handleChange(idx, 'quantity', e.target.value)}
                          required
                          sx={{ width: 90 }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ width: 110 }}>
                          <Select
                            value={row.unit}
                            onChange={e => handleChange(idx, 'unit', e.target.value)}
                          >
                            {UNIT_OPTIONS.map(opt => (
                              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ color: colors.textSecondary }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              background: colors.gradientPrimary,
              borderRadius: '10px',
              px: 3,
              fontWeight: 700,
            }}
          >
            Update Inventory & Complete
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}