import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemText, Typography, Box, Avatar, Chip
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import { useTheme } from './ThemeContext';

export default function CategoryListDialog({ open, onClose, items = [], category }) {
  const { colors } = useTheme();

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: colors.primaryLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.primary,
            }}
          >
            <CategoryIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: colors.text, textTransform: 'capitalize' }}>
              {category || 'Category'} Items
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              {items.length} groceries tracked in this group
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {items.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center', bgcolor: colors.hover, borderRadius: '14px', border: `1px dashed ${colors.border}` }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              No inventory items currently logged in "{category}".
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map((item, idx) => (
              <ListItem
                key={item.id || idx}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: colors.hover,
                  border: `1px solid ${colors.divider}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 700, color: colors.text }}>
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    item.location && (
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Location: {item.location}
                      </Typography>
                    )
                  }
                />
                {item.quantity && (
                  <Chip
                    label={`${item.quantity} ${item.unit || ''}`}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: colors.cardBg, color: colors.text }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained" sx={{ background: colors.gradientPrimary, borderRadius: '10px', px: 3, fontWeight: 700 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
