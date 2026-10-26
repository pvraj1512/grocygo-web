import React, { useState, useEffect } from 'react';
import { TextField, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { getSuggestions } from './api';
import { useTheme } from './ThemeContext';

export default function SuggestionInput({ label, value, onChange, ...props }) {
  const [input, setInput] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    setInput(value || '');
  }, [value]);

  useEffect(() => {
    if (input.length > 0) {
      getSuggestions(input)
        .then(res => setSuggestions(res.data || []))
        .catch(() => setSuggestions([]));
      setOpen(true);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [input]);

  const handleSelect = (s) => {
    setInput(s.product);
    setOpen(false);
    if (onChange) onChange({ target: { value: s.product, category: s.category } });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <TextField
        label={label}
        value={input}
        onChange={e => {
          setInput(e.target.value);
          if (onChange) onChange({ target: { value: e.target.value } });
        }}
        autoComplete="off"
        fullWidth
        {...props}
      />
      {open && suggestions.length > 0 && (
        <Paper
          elevation={8}
          style={{
            position: 'absolute',
            zIndex: 1400,
            left: 0,
            right: 0,
            marginTop: 4,
            maxHeight: 220,
            overflowY: 'auto',
            backgroundColor: colors.paper,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            boxShadow: colors.cardShadow,
          }}
        >
          <List disablePadding>
            {suggestions.map((s, i) => (
              <ListItem disablePadding key={i}>
                <ListItemButton
                  onClick={() => handleSelect(s)}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': {
                      bgcolor: colors.hover,
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                        {s.product}
                      </Typography>
                    }
                    secondary={
                      s.category && (
                        <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 500 }}>
                          {s.category}
                        </Typography>
                      )
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}
