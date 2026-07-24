import React, { useState, useEffect } from 'react';
import { TextField, List, ListItem, ListItemButton, ListItemText, Paper } from '@mui/material';
import { getSuggestions } from './api';

export default function SuggestionInput({ label, value, onChange, ...props }) {
  const [input, setInput] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setInput(value || '');
  }, [value]);

  useEffect(() => {
    if (input.length > 0) {
      getSuggestions(input).then(res => setSuggestions(res.data));
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
    <div style={{ position: 'relative' }}>
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
        <Paper style={{ position: 'absolute', zIndex: 10, left: 0, right: 0, maxHeight: 200, overflowY: 'auto' }}>
          <List>
            {suggestions.map((s, i) => (
              <ListItem disablePadding key={i}>
                <ListItemButton onClick={() => handleSelect(s)}>
                  <ListItemText primary={s.product} secondary={s.category} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}
