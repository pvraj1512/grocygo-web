import React, { useEffect, useState, useRef } from 'react';
import SuggestionInput from './SuggestionInput';
import { getInventory, addInventory, deleteInventory } from './api';
import { useTheme } from './ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  Card, CardContent, Typography, Grid, IconButton, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, FormControl,
  InputLabel, InputAdornment, Tooltip, Snackbar, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ScanIcon from '@mui/icons-material/QrCodeScanner';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';

const COLORS = ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0', '#ffeb3b'];
const units = ['pieces', 'kg', 'bag', 'packet', 'box', 'containers', 'lbs', 'loaf'];
const locations = ['Counter', 'Fridge', 'Freezer', 'Pantry'];
const categories = ['fruits', 'vegetables', 'namkeen', 'meat & fish', 'dairy', 'pantry'];

// Module-level cache for inventory
let inventoryCache = null;

export default function InventoryPage() {
  // --- State and hooks ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: 1, unit: '', location: '', expiryDate: null, category: '' });
  const [snackbar, setSnackbar] = useState(null);
  const [refresh, setRefresh] = useState(0); // trigger for manual refresh
  const theme = useTheme();
  const navigate = useNavigate();

  // --- Fetch items from backend ---
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    if (inventoryCache && Array.isArray(inventoryCache)) {
      setItems(inventoryCache);
      setLoading(false);
    } else {
      getInventory()
        .then(res => {
          let arr = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
          if (!ignore) {
            setItems(arr);
            inventoryCache = arr;
          }
        })
        .catch(() => {
          if (!ignore) setItems([]);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }
    return () => { ignore = true; };
  }, [refresh]);

  // --- Handlers ---
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      // Prepare the item data to send to the backend
      const itemToAdd = {
        name: form.name,
        quantity: parseInt(form.quantity),
        unit: form.unit,
        location: form.location,
        expiryDate: form.expiryDate ? form.expiryDate : null,
        category: form.category,
      };
      const addedItem = await addInventory(itemToAdd); // Call the API to add the item
      setItems(prev => {
        const updated = [...prev, addedItem]; // Add the item returned by the API (which includes the ID)
        inventoryCache = updated;
        return updated;
      });
      setDialogOpen(false);
      setForm({ name: '', quantity: 1, unit: '', location: '', expiryDate: null, category: '' });
      setSnackbar({ open: true, message: 'Item added!', severity: 'success' });
    } catch (error) {
      console.error('Failed to add item:', error);
      setSnackbar({ open: true, message: 'Failed to add item!', severity: 'error' });
    }
  };

  // Update handleDelete to call backend API
  const handleDelete = async (id) => {
    try {
      await deleteInventory(id); // <-- Call backend to delete from Firebase
      setItems(prev => {
        const updated = prev.filter(item => item.id !== id);
        inventoryCache = updated;
        return updated;
      });
      setSnackbar({ open: true, message: 'Item deleted!', severity: 'info' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to delete item!', severity: 'error' });
    }
  };

  const getExpiryStatus = (date) => {
    if (!date) return null;
    const expiryDate = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return { text: 'Expired', color: theme.colors.error };
    if (daysUntilExpiry === 0) return { text: 'Expires Today', color: theme.colors.error };
    if (daysUntilExpiry <= 3) return { text: `Expires in ${daysUntilExpiry} days`, color: theme.colors.secondary };
    return { text: `Expires in ${daysUntilExpiry} days`, color: theme.colors.success };
  };
  const filteredItems = items.filter(item =>
    item && typeof item.name === 'string' && item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render ---
  return (
    <Box sx={{ minHeight: '100vh', background: theme.colors.background, p: 3 }}>
      <Snackbar
        open={!!snackbar?.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity={snackbar?.severity || 'info'} sx={{ width: '100%' }}>
          {snackbar?.message}
        </Alert>
      </Snackbar>

      <Box sx={{ background: theme.colors.paper, color: theme.colors.text, borderRadius: 2, boxShadow: 2, mb: 3, p: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.colors.text }}>Inventory</Typography>
          </Grid>
          <Grid item xs={12} sm={8} md={9}>
            <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center' }}>
              <Button onClick={() => navigate('/recipes')} variant="outlined" size="small" sx={{ color: theme.colors.text, borderColor: theme.colors.divider, '&:hover': { borderColor: theme.colors.primary, background: theme.colors.hover } }}>Suggested Recipes</Button>
              <Button startIcon={<AddIcon />} variant="contained" color="primary" size="small" onClick={() => setDialogOpen(true)} sx={{ background: theme.colors.primary, color: theme.colors.text, '&:hover': { background: theme.colors.hover } }}>Add Item</Button>
              <Button
                variant="outlined"
                onClick={() => {
                  inventoryCache = null; // Clear cache to force API fetch
                  setLoading(true);
                  setRefresh(r => r + 1);
                }}
                disabled={loading}
                size="small"
                sx={{ color: theme.colors.text, borderColor: theme.colors.divider, '&:hover': { borderColor: theme.colors.primary, background: theme.colors.hover } }}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="subtitle1" sx={{ color: theme.colors.textSecondary, mb: 3 }}>Manage your kitchen items and track expiry dates</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, borderRadius: 2}}>
        <TextField
          fullWidth
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.colors.textSecondary }} />
              </InputAdornment>
            ),
          }}
          sx={{ background: theme.colors.paper, color: theme.colors.text, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: theme.colors.divider }, '&:hover fieldset': { borderColor: theme.colors.primary } }, '& .MuiInputBase-input': { color: theme.colors.text } }}
        />
      </Box>

      <Box sx={{ width: '100%', overflowX: 'auto', mb: 4, background: theme.colors.cardBg, borderRadius: 2, p: 2, boxShadow: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ background: theme.colors.cardBg, color: theme.colors.text, fontWeight: 600, padding: '12px 16px', textAlign: 'left' }}>Name</th>
              <th style={{ background: theme.colors.cardBg, color: theme.colors.text, fontWeight: 600, padding: '12px 16px', textAlign: 'left' }}>Quantity</th>
              <th style={{ background: theme.colors.cardBg, color: theme.colors.text, fontWeight: 600, padding: '12px 16px', textAlign: 'left' }}>Unit</th>
              <th style={{ background: theme.colors.cardBg, color: theme.colors.text, fontWeight: 600, padding: '12px 16px', textAlign: 'left' }}>Location</th>
              <th style={{ background: theme.colors.cardBg, color: theme.colors.text, fontWeight: 600, padding: '12px 16px', textAlign: 'left' }}>Expiry</th>
              <th style={{ background: theme.colors.cardBg, color: theme.colors.text, fontWeight: 600, padding: '12px 16px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                  <Typography variant="body1" sx={{ color: theme.colors.textSecondary }}>Loading...</Typography>
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${theme.colors.border}`, transition: 'all 0.2s' }}>
                  <td style={{ color: theme.colors.text, padding: '10px 16px' }}>{item.name}</td>
                  <td style={{ color: theme.colors.text, padding: '10px 16px' }}>{item.quantity}</td>
                  <td style={{ color: theme.colors.text, padding: '10px 16px' }}>{item.unit}</td>
                  <td style={{ color: theme.colors.text, padding: '10px 16px' }}>{item.location}</td>
                  <td style={{ color: theme.colors.text, padding: '10px 16px' }}>
                    {item.expiryDate && (
                      <Typography variant="body2" sx={{ color: getExpiryStatus(item.expiryDate).color, bgcolor: getExpiryStatus(item.expiryDate).color + '22', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                        {getExpiryStatus(item.expiryDate).text}
                      </Typography>
                    )}
                  </td>
                  <td style={{ color: theme.colors.text, padding: '10px 16px', textAlign: 'center' }}>
                    <IconButton onClick={() => handleDelete(item.id)} size="small" sx={{ color: theme.colors.textSecondary }}>
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: theme.colors.paper, color: theme.colors.text } }}>
        <DialogTitle sx={{ color: theme.colors.text }}>Add New Item</DialogTitle>
        <form onSubmit={handleAdd}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                fullWidth
                sx={{
                  background: theme.colors.paper,
                  color: theme.colors.text,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: theme.colors.divider },
                    '&:hover fieldset': { borderColor: theme.colors.primary }
                  },
                  '& .MuiInputBase-input': { color: theme.colors.text }
                }}
              />
              <TextField
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                required
                fullWidth
                sx={{
                  background: theme.colors.paper,
                  color: theme.colors.text,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: theme.colors.divider },
                    '&:hover fieldset': { borderColor: theme.colors.primary }
                  },
                  '& .MuiInputBase-input': { color: theme.colors.text }
                }}
              />
              <FormControl fullWidth required sx={{
                background: theme.colors.paper,
                color: theme.colors.text,
                '& .MuiInputLabel-root': { color: theme.colors.textSecondary },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: theme.colors.divider },
                  '&:hover fieldset': { borderColor: theme.colors.primary }
                }
              }}>
                <InputLabel sx={{ color: theme.colors.textSecondary }}>Unit</InputLabel>
                <Select
                  value={form.unit}
                  label="Unit"
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  sx={{
                    background: theme.colors.paper,
                    color: theme.colors.text,
                    '& .MuiMenu-paper': { background: theme.colors.paper, color: theme.colors.text }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: theme.colors.paper,
                        color: theme.colors.text
                      }
                    }
                  }}
                >
                  {units.map(unit => (
                    <MenuItem key={unit} value={unit} sx={{ color: theme.colors.text }}>{unit}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required sx={{
                background: theme.colors.paper,
                color: theme.colors.text,
                '& .MuiInputLabel-root': { color: theme.colors.textSecondary },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: theme.colors.divider },
                  '&:hover fieldset': { borderColor: theme.colors.primary }
                }
              }}>
                <InputLabel sx={{ color: theme.colors.textSecondary }}>Location</InputLabel>
                <Select
                  value={form.location}
                  label="Location"
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  sx={{
                    background: theme.colors.paper,
                    color: theme.colors.text,
                    '& .MuiMenu-paper': { background: theme.colors.paper, color: theme.colors.text }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: theme.colors.paper,
                        color: theme.colors.text
                      }
                    }
                  }}
                >
                  {locations.map(loc => (
                    <MenuItem key={loc} value={loc} sx={{ color: theme.colors.text }}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required sx={{
                background: theme.colors.paper,
                color: theme.colors.text,
                '& .MuiInputLabel-root': { color: theme.colors.textSecondary },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: theme.colors.divider },
                  '&:hover fieldset': { borderColor: theme.colors.primary }
                }
              }}>
                <InputLabel sx={{ color: theme.colors.textSecondary }}>Category</InputLabel>
                <Select
                  value={form.category}
                  label="Category"
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  sx={{
                    background: theme.colors.paper,
                    color: theme.colors.text,
                    '& .MuiMenu-paper': { background: theme.colors.paper, color: theme.colors.text }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: theme.colors.paper,
                        color: theme.colors.text
                      }
                    }
                  }}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat} sx={{ color: theme.colors.text }}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Expiry Date"
                type="date"
                value={form.expiryDate || ''}
                onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  background: theme.colors.paper,
                  color: theme.colors.text,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: theme.colors.divider },
                    '&:hover fieldset': { borderColor: theme.colors.primary }
                  },
                  '& .MuiInputBase-input': { color: theme.colors.text }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: theme.colors.text }}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ background: theme.colors.primary, color: theme.colors.text, '&:hover': { background: theme.colors.hover } }}>Add Item</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}