import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, MenuItem, FormControl, InputLabel, Select,
  TextField, Stack, Chip, Tabs, Tab
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenuOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTheme } from './ThemeContext';

export default function AddMealDialog({ open, onClose, onSave, recipes = [], aiSuggestions = [], selectedDate, dayName, mealType }) {
  const [tab, setTab] = useState(0); // 0: My Recipes, 1: AI Suggested, 2: Custom
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [customRecipe, setCustomRecipe] = useState('');
  const { colors } = useTheme();

  useEffect(() => {
    if (open) {
      setTab(0);
      setSelectedRecipe('');
      setCustomRecipe('');
    }
  }, [open]);

  const handleSave = () => {
    if (tab === 0 && selectedRecipe) {
      onSave({ type: 'my', recipeId: selectedRecipe });
    } else if (tab === 1 && selectedRecipe) {
      onSave({ type: 'ai', recipeId: selectedRecipe });
    } else if (tab === 2 && customRecipe.trim()) {
      onSave({ type: 'custom', name: customRecipe.trim() });
    }
  };

  const isSaveDisabled = (tab === 0 && !selectedRecipe) ||
                         (tab === 1 && !selectedRecipe) ||
                         (tab === 2 && !customRecipe.trim());

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
          Add {mealType || 'Meal'} {dayName ? `for ${dayName}` : ''}
        </Typography>
        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
          Choose from your saved recipes, AI recommendations, or create a custom dish
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Segmented Tab Controls */}
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setSelectedRecipe(''); setCustomRecipe(''); }}
          variant="fullWidth"
          sx={{
            mb: 3,
            bgcolor: colors.hover,
            borderRadius: '12px',
            p: 0.5,
            minHeight: 40,
            '& .MuiTabs-indicator': {
              height: '100%',
              borderRadius: '10px',
              bgcolor: colors.cardBg,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 0,
            },
            '& .MuiTab-root': {
              minHeight: 36,
              zIndex: 1,
              fontWeight: 700,
              fontSize: '0.85rem',
              color: colors.textSecondary,
              '&.Mui-selected': {
                color: colors.text,
              },
            },
          }}
        >
          <Tab icon={<RestaurantMenuIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="My Recipes" disableRipple />
          <Tab icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="AI Suggested" disableRipple />
          <Tab icon={<EditOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Custom" disableRipple />
        </Tabs>

        {/* Tab 0: My Recipes */}
        {tab === 0 && (
          <Box sx={{ minHeight: 120 }}>
            {recipes.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: colors.hover, borderRadius: '12px', border: `1px dashed ${colors.border}` }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  You don't have any saved recipes yet. Choose "AI Suggested" or "Custom" instead!
                </Typography>
              </Box>
            ) : (
              <FormControl fullWidth required>
                <InputLabel>Select From My Recipes</InputLabel>
                <Select
                  value={selectedRecipe}
                  label="Select From My Recipes"
                  onChange={e => setSelectedRecipe(e.target.value)}
                >
                  {recipes.map(r => (
                    <MenuItem key={r.id} value={r.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                        {r.course && <Chip label={r.course} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {/* Tab 1: AI Suggested */}
        {tab === 1 && (
          <Box sx={{ minHeight: 120 }}>
            {aiSuggestions.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: colors.hover, borderRadius: '12px', border: `1px dashed ${colors.border}` }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  No AI suggestions available right now. Enter a custom meal name!
                </Typography>
              </Box>
            ) : (
              <FormControl fullWidth required>
                <InputLabel>Select AI Meal Suggestion</InputLabel>
                <Select
                  value={selectedRecipe}
                  label="Select AI Meal Suggestion"
                  onChange={e => setSelectedRecipe(e.target.value)}
                >
                  {aiSuggestions.map(r => (
                    <MenuItem key={r.id || r.recipe_id || r.recipe_title || r.name} value={r.id || r.recipe_id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                        {r.course && <Chip label={r.course} size="small" sx={{ bgcolor: colors.accentLight, color: colors.accent, height: 20, fontSize: '0.7rem' }} />}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {/* Tab 2: Custom */}
        {tab === 2 && (
          <Box sx={{ minHeight: 120 }}>
            <TextField
              label="Dish / Meal Name (e.g. Grilled Salmon with Asparagus)"
              value={customRecipe}
              onChange={e => setCustomRecipe(e.target.value)}
              fullWidth
              autoFocus
              required
              helperText="Type any meal name you wish to plan"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: colors.textSecondary }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaveDisabled}
          sx={{
            background: colors.gradientPrimary,
            borderRadius: '10px',
            px: 3,
            fontWeight: 700,
          }}
        >
          Add to Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
