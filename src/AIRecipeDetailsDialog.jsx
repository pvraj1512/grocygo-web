import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Chip, Stack, Divider, Link
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenuOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTheme } from './ThemeContext';

export default function AIRecipeDetailsDialog({ open, onClose, recipe, onSave }) {
  const { colors } = useTheme();
  if (!recipe) return null;

  const title = recipe.name || recipe.recipe_title || 'Recipe Details';
  const ingredientsArr = typeof recipe.ingredients === 'string'
    ? recipe.ingredients.split('|').map(x => x.trim()).filter(Boolean)
    : Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map(x => x?.name || String(x)).filter(Boolean)
    : [];

  const instructionsArr = typeof recipe.instructions === 'string'
    ? recipe.instructions.split('|').map(x => x.trim()).filter(Boolean)
    : Array.isArray(recipe.instructions)
    ? recipe.instructions
    : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.paper,
          p: 1,
          borderRadius: '24px',
          boxShadow: colors.cardShadow,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: colors.text }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            {recipe.course && (
              <Chip label={recipe.course} size="small" sx={{ bgcolor: colors.primaryLight, color: colors.primary, fontWeight: 700 }} />
            )}
            {recipe.diet && (
              <Chip label={recipe.diet} size="small" sx={{ bgcolor: colors.secondaryLight, color: colors.secondary, fontWeight: 700 }} />
            )}
          </Stack>
        </Box>
        {(recipe.prep_time || recipe.cook_time) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: colors.textSecondary }}>
            <AccessTimeIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Prep / Cook Time: {recipe.prep_time || recipe.cook_time}
            </Typography>
          </Box>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: colors.divider }}>
        {/* Recipe Image */}
        {recipe.recipe_image && (
          <Box sx={{ width: '100%', maxHeight: 320, borderRadius: '16px', overflow: 'hidden', mb: 3, border: `1px solid ${colors.border}` }}>
            <img
              src={recipe.recipe_image}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </Box>
        )}

        {/* Description */}
        {recipe.description && (
          <Typography variant="body1" sx={{ color: colors.textSecondary, lineHeight: 1.6, mb: 3 }}>
            {recipe.description}
          </Typography>
        )}

        {/* Ingredients Grid */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, mb: 1.5 }}>
          Ingredients ({ingredientsArr.length})
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {ingredientsArr.map((ing, idx) => {
            const isMatched = recipe.matched_ingredients?.some(m => m.toLowerCase() === ing.toLowerCase());
            const isMissing = recipe.missing_ingredients?.some(m => m.toLowerCase() === ing.toLowerCase());

            return (
              <Chip
                key={idx}
                icon={isMatched ? <CheckCircleIcon sx={{ fontSize: '16px !important' }} /> : isMissing ? <HighlightOffIcon sx={{ fontSize: '16px !important' }} /> : undefined}
                label={ing}
                sx={{
                  bgcolor: isMatched ? `${colors.success}20` : isMissing ? `${colors.error}20` : colors.hover,
                  color: isMatched ? colors.success : isMissing ? colors.error : colors.text,
                  border: `1px solid ${isMatched ? colors.success : isMissing ? colors.error : colors.divider}`,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              />
            );
          })}
        </Box>

        {/* Instructions */}
        {instructionsArr.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, mb: 1.5 }}>
              Instructions
            </Typography>
            <Stack spacing={1.5}>
              {instructionsArr.map((step, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: colors.hover,
                    border: `1px solid ${colors.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 26,
                      height: 26,
                      borderRadius: '50%',
                      bgcolor: colors.primary,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      mt: 0.2,
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.text, lineHeight: 1.5 }}>
                    {step}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Recipe Source Link */}
        {recipe.url && (
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${colors.divider}` }}>
            <Link
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: colors.primary,
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              View Full Source Recipe <OpenInNewIcon fontSize="small" />
            </Link>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ color: colors.textSecondary }}>
          Close
        </Button>
        {onSave && (
          <Button
            variant="contained"
            onClick={() => {
              onSave(recipe);
              onClose();
            }}
            sx={{
              background: colors.gradientPrimary,
              borderRadius: '10px',
              fontWeight: 700,
            }}
          >
            Save to My Recipes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
