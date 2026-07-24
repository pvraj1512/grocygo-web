import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, IconButton, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
const units = ['pieces', 'kg', 'bag', 'packet', 'box', 'containers', 'lbs', 'loaf'];
import SuggestionInput from './SuggestionInput';

export default function AddRecipeDialog({ open, onClose, onSave, inventoryItems }) {
  const [form, setForm] = useState({ name: '', description: '', items: [] });

  useEffect(() => {
    if (open) setForm({ name: '', description: '', items: [] });
  }, [open]);

  const handleAddItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { name: '', fromInventory: false, inventoryId: '', quantity: 1, unit: '' }] }));
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Recipe</DialogTitle>
      <DialogContent>
        <TextField
          label="Recipe Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description (optional)"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          fullWidth
          multiline
          minRows={2}
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Need Items</Typography>
        {form.items.map((item, idx) => (
          <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, position: 'relative' }}>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel>Source</InputLabel>
              <Select
                value={item.fromInventory ? 'inventory' : 'custom'}
                label="Source"
                onChange={e => handleItemChange(idx, 'fromInventory', e.target.value === 'inventory')}
              >
                <MenuItem value="inventory">Select Inventory Item</MenuItem>
                <MenuItem value="custom">Add Custom Item</MenuItem>
              </Select>
            </FormControl>
            {item.fromInventory ? (
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Inventory Item</InputLabel>
                <Select
                  value={item.inventoryId}
                  label="Inventory Item"
                  onChange={e => handleItemChange(idx, 'inventoryId', e.target.value)}
                >
                  {inventoryItems.map(inv => (
                    <MenuItem key={inv.id} value={inv.id}>{inv.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <SuggestionInput
                label="Item Name"
                value={item.name}
                onChange={e => handleItemChange(idx, 'name', e.target.value)}
                required
                sx={{ mb: 1 }}
              />
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                sx={{ flex: 1 }}
                required
              />
              <FormControl fullWidth required sx={{ flex: 1 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={item.unit}
                  label="Unit"
                  onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                >
                  {units.map(unit => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button size="small" color="error" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => handleRemoveItem(idx)}>Remove</Button>
          </Box>
        ))}
        <Button variant="outlined" onClick={handleAddItem} fullWidth sx={{ mb: 2 }}>+ Add Item</Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(form)} disabled={!form.name || form.items.length === 0}>Save Recipe</Button>
      </DialogActions>
    </Dialog>
  );
}
