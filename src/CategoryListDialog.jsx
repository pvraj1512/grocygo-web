import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

export default function CategoryListDialog({ open, onClose, items, category }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Items in "{category}"</DialogTitle>
      <DialogContent>
        {items.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', margin: '32px 0' }}>No items in this category.</div>
        ) : (
          <List>
            {items.map(item => (
              <ListItem key={item.id}>
                <ListItemText primary={item.name} secondary={item.quantity ? `${item.quantity} ${item.unit || ''}` : ''} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
