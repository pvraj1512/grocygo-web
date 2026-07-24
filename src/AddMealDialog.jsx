import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, MenuItem, FormControl, InputLabel, Select, TextField } from '@mui/material';

export default function AddMealDialog({ open, onClose, onSave, recipes, aiSuggestions, selectedDate }) {
  const [tab, setTab] = useState('my');
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [customRecipe, setCustomRecipe] = useState('');

  useEffect(() => {
    if (open) {
      setTab('my');
      setSelectedRecipe('');
      setCustomRecipe('');
    }
  }, [open]);

  const handleSave = () => {
    if (tab === 'my' && selectedRecipe) {
      onSave({ type: 'my', recipeId: selectedRecipe });
    } else if (tab === 'ai' && selectedRecipe) {
      onSave({ type: 'ai', recipeId: selectedRecipe });
    } else if (tab === 'custom' && customRecipe) {
      // Instead of saving, trigger navigation to Recipes and open Add dialog
      localStorage.setItem('openAddRecipeDialog', '1');
      localStorage.setItem('switchToRecipesTab', '1');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Meal</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant={tab === 'my' ? 'contained' : 'outlined'} onClick={() => setTab('my')} fullWidth>My Recipes</Button>
          <Button variant={tab === 'ai' ? 'contained' : 'outlined'} onClick={() => setTab('ai')} fullWidth>AI Generated</Button>
          <Button variant={tab === 'custom' ? 'contained' : 'outlined'} onClick={() => setTab('custom')} fullWidth>Add Custom</Button>
        </Box>
        {tab === 'my' && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Recipe</InputLabel>
            <Select
              value={selectedRecipe}
              label="Select Recipe"
              onChange={e => setSelectedRecipe(e.target.value)}
            >
              {recipes.map(r => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {tab === 'ai' && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select AI Recipe</InputLabel>
            <Select
              value={selectedRecipe}
              label="Select AI Recipe"
              onChange={e => setSelectedRecipe(e.target.value)}
              renderValue={selected => {
                const meal = aiSuggestions.find(r => r.id === selected);
                return meal ? `${meal.name} (${meal.mealType || ''})` : '';
              }}
            >
              {aiSuggestions.map(r => (
                <MenuItem key={r.id} value={r.id}>
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                  {r.mealType && (
                    <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>({r.mealType})</span>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {tab === 'custom' && (
          <TextField
            label="Recipe Name"
            value={customRecipe}
            onChange={e => setCustomRecipe(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={
          (tab === 'my' && !selectedRecipe) ||
          (tab === 'ai' && !selectedRecipe) ||
          (tab === 'custom' && !customRecipe)
        }>Add</Button>
      </DialogActions>
    </Dialog>
  );
}
