import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

export default function AIRecipeDetailsDialog({ open, onClose, recipe }) {
  if (!recipe) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{recipe.name || recipe.recipe_title}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          {recipe.mealType || recipe.course} &nbsp;|&nbsp; {recipe.cook_time || recipe.prep_time}
        </Typography>
        {recipe.description && (
          <Typography variant="body2" sx={{ mb: 2 }}>{recipe.description}</Typography>
        )}
        {recipe.ingredients && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Ingredients:</Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {recipe.ingredients.split('|').map((ing, idx) => (
                <li key={idx}>{ing.trim()}</li>
              ))}
            </ul>
          </Box>
        )}
        {recipe.instructions && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Instructions:</Typography>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {recipe.instructions.split('|').map((step, idx) => (
                <li key={idx}>{step.trim()}</li>
              ))}
            </ol>
          </Box>
        )}
        {recipe.ingredientsAvailable !== undefined && recipe.ingredientsTotal !== undefined && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>Ingredients available:</b> {recipe.ingredientsAvailable} / {recipe.ingredientsTotal}
          </Typography>
        )}
        {recipe.url && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <a href={recipe.url} target="_blank" rel="noopener noreferrer">View Source</a>
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
