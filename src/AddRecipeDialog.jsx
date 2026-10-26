import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, Typography, IconButton, MenuItem, FormControl, InputLabel, Select,
  Grid, Paper, Chip
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenuOutlined';
import SuggestionInput from './SuggestionInput';
import { useTheme } from './ThemeContext';

const units = ['pieces', 'kg', 'g', 'bag', 'packet', 'box', 'containers', 'lbs', 'loaf', 'tbsp', 'tsp', 'cup'];

export default function AddRecipeDialog({ open, onClose, onSave, inventoryItems = [] }) {
  const [form, setForm] = useState({ name: '', description: '', items: [] });
  const { colors } = useTheme();

  useEffect(() => {
    if (open) setForm({ name: '', description: '', items: [] });
  }, [open]);

  const handleAddItem = () => {
    setForm(f => ({
      ...f,
      items: [...f.items, { name: '', fromInventory: false, inventoryId: '', quantity: 1, unit: 'pieces' }]
    }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    }));
  };

  const handleRemoveItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
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
      <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestaurantMenuIcon sx={{ color: colors.primary }} />
        Create New Recipe
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label="Recipe Name (e.g. Garlic Butter Paneer)"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          fullWidth
          required
        />
        
        <TextField
          label="Brief Description or Notes (optional)"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          fullWidth
          multiline
          minRows={2}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.text }}>
            Required Ingredients ({form.items.length})
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{ color: colors.primary, fontWeight: 600 }}
          >
            Add Ingredient
          </Button>
        </Box>

        {form.items.length === 0 ? (
          <Box
            sx={{
              p: 3,
              borderRadius: '12px',
              border: `1px dashed ${colors.border}`,
              textAlign: 'center',
              bgcolor: colors.hover,
            }}
          >
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              No ingredients added yet. Click "+ Add Ingredient" below to list the required items.
            </Typography>
          </Box>
        ) : (
          form.items.map((item, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '14px',
                border: `1px solid ${colors.border}`,
                bgcolor: colors.hover,
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.textSecondary }}>
                  INGREDIENT #{idx + 1}
                </Typography>
                <IconButton size="small" color="error" onClick={() => handleRemoveItem(idx)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>

              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Source</InputLabel>
                <Select
                  value={item.fromInventory ? 'inventory' : 'custom'}
                  label="Source"
                  onChange={e => handleItemChange(idx, 'fromInventory', e.target.value === 'inventory')}
                >
                  <MenuItem value="inventory">Select from Kitchen Inventory</MenuItem>
                  <MenuItem value="custom">Custom Ingredient</MenuItem>
                </Select>
              </FormControl>

              {item.fromInventory ? (
                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                  <InputLabel>Inventory Item</InputLabel>
                  <Select
                    value={item.inventoryId}
                    label="Inventory Item"
                    onChange={e => {
                      const selectedInv = inventoryItems.find(inv => inv.id === e.target.value);
                      handleItemChange(idx, 'inventoryId', e.target.value);
                      if (selectedInv) {
                        handleItemChange(idx, 'name', selectedInv.name);
                        handleItemChange(idx, 'unit', selectedInv.unit || item.unit);
                      }
                    }}
                  >
                    {inventoryItems.map(inv => (
                      <MenuItem key={inv.id} value={inv.id}>{inv.name} ({inv.quantity} {inv.unit || ''})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Box sx={{ mb: 1.5 }}>
                  <SuggestionInput
                    label="Ingredient Name"
                    size="small"
                    value={item.name}
                    onChange={e => handleItemChange(idx, 'name', e.target.value)}
                    required
                  />
                </Box>
              )}

              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <TextField
                    label="Quantity"
                    size="small"
                    type="number"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={item.unit}
                      label="Unit"
                      onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                    >
                      {units.map(u => (
                        <MenuItem key={u} value={u}>{u}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          ))
        )}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          fullWidth
          sx={{
            py: 1,
            borderRadius: '12px',
            borderColor: colors.border,
            color: colors.text,
            borderStyle: 'dashed',
            '&:hover': { borderColor: colors.primary, bgcolor: colors.primaryLight },
          }}
        >
          Add Another Ingredient
        </Button>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: colors.textSecondary }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onSave(form)}
          disabled={!form.name.trim() || form.items.length === 0}
          sx={{
            background: colors.gradientPrimary,
            borderRadius: '10px',
            px: 3,
            fontWeight: 700,
          }}
        >
          Save Recipe
        </Button>
      </DialogActions>
    </Dialog>
  );
}
