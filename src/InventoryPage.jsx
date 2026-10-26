import React, { useEffect, useState } from 'react';
import SuggestionInput from './SuggestionInput';
import { getInventory, addInventory, deleteInventory } from './api';
import { useTheme } from './ThemeContext';
import { fireConfetti } from './utils/confetti';
import {
  Typography, Grid, IconButton, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, FormControl,
  InputLabel, InputAdornment, Tooltip, Snackbar, Alert,
  Chip, Avatar, Paper, Stack, CircularProgress, ToggleButtonGroup, ToggleButton,
  Card, CardContent, CardMedia
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KitchenOutlinedIcon from '@mui/icons-material/KitchenOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const units = ['pieces', 'kg', 'g', 'bag', 'packet', 'box', 'containers', 'lbs', 'loaf', 'liter', 'ml', 'bunch'];
const locations = ['Fridge', 'Pantry', 'Freezer', 'Counter'];
const categories = [
  { key: 'all', label: 'All Items', icon: '🍽️' },
  { key: 'fruits', label: 'Fruits', icon: '🍎' },
  { key: 'vegetables', label: 'Vegetables', icon: '🥦' },
  { key: 'dairy', label: 'Dairy', icon: '🧀' },
  { key: 'meat & fish', label: 'Meat & Fish', icon: '🥩' },
  { key: 'namkeen', label: 'Namkeen / Snacks', icon: '🥨' },
  { key: 'pantry', label: 'Pantry', icon: '🥫' },
];

const getLocationIcon = (loc) => {
  switch (loc?.toLowerCase()) {
    case 'fridge': return '❄️ Fridge';
    case 'freezer': return '🧊 Freezer';
    case 'pantry': return '📦 Pantry';
    case 'counter': return '🧺 Counter';
    default: return `📍 ${loc || 'General'}`;
  }
};

const getCategoryEmoji = (cat) => {
  switch (cat?.toLowerCase()) {
    case 'fruits': return '🍎';
    case 'vegetables': return '🥦';
    case 'dairy': return '🧀';
    case 'meat & fish': return '🥩';
    case 'namkeen': return '🥨';
    case 'pantry': return '🥫';
    default: return '🥑';
  }
};

let inventoryCache = null;

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('inventoryViewMode') || 'grid'); // 'grid' or 'table'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: 1, unit: 'pieces', location: 'Fridge', expiryDate: '', category: 'vegetables' });
  const [snackbar, setSnackbar] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const { colors, isDarkMode } = useTheme();
  const navigate = useNavigate();

  const toDateOnly = (value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      const normalized = value.trim().split('T')[0];
      return normalized || null;
    }
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    if (typeof value === 'object') {
      if (typeof value.toDate === 'function') {
        return value.toDate().toISOString().split('T')[0];
      }
      if (typeof value.seconds === 'number') {
        return new Date(value.seconds * 1000).toISOString().split('T')[0];
      }
    }
    return String(value).split('T')[0] || null;
  };

  useEffect(() => {
    localStorage.setItem('inventoryViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    if (inventoryCache && Array.isArray(inventoryCache)) {
      setItems(inventoryCache);
      setLoading(false);
    } else {
      getInventory()
        .then(res => {
          const arr = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
          if (!ignore) {
            setItems(arr);
            inventoryCache = arr;
          }
        })
        .catch(() => {
          if (!ignore) {
            setItems([]);
            inventoryCache = [];
          }
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }
    return () => { ignore = true; };
  }, [refresh]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const itemToAdd = {
        name: form.name.trim(),
        quantity: parseInt(form.quantity) || 1,
        unit: form.unit,
        location: form.location,
        expiryDate: form.expiryDate ? toDateOnly(form.expiryDate) : null,
        category: form.category,
      };
      const addedItem = await addInventory(itemToAdd);
      setItems(prev => {
        const updated = [...prev, addedItem];
        inventoryCache = updated;
        return updated;
      });
      setDialogOpen(false);
      setForm({ name: '', quantity: 1, unit: 'pieces', location: 'Fridge', expiryDate: '', category: 'vegetables' });
      fireConfetti({ count: 40, origin: { x: 0.5, y: 0.5 } });
      setSnackbar({ open: true, message: `"${itemToAdd.name}" added to stock!`, severity: 'success' });
    } catch (error) {
      console.error('Failed to add item:', error);
      const message = error.response?.data?.error || error.message || 'Failed to add item.';
      setSnackbar({ open: true, message: `Failed to add item: ${message}`, severity: 'error' });
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await deleteInventory(id);
      setItems(prev => {
        const updated = prev.filter(item => item.id !== id);
        inventoryCache = updated;
        return updated;
      });
      setSnackbar({ open: true, message: `Removed "${name || 'item'}" from inventory`, severity: 'info' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to delete item.', severity: 'error' });
    }
  };

  const handleQuantityChange = async (item, delta) => {
    const newQty = Math.max(0, (Number(item.quantity) || 1) + delta);
    if (newQty === 0) {
      await handleDelete(item.id, item.name);
      return;
    }
    const updatedItem = { ...item, quantity: newQty };
    setItems(prev => {
      const updated = prev.map(i => i.id === item.id ? updatedItem : i);
      inventoryCache = updated;
      return updated;
    });
    try {
      const api = await import('./api');
      if (api.updateInventory) {
        await api.updateInventory(item.id, updatedItem);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const getExpiryStatus = (date) => {
    if (!date) return { text: 'No Expiry Set', color: colors.textSecondary, bg: colors.hover, isExpiringSoon: false };
    const expiryDateString = toDateOnly(date);
    if (!expiryDateString) return { text: 'No Expiry Set', color: colors.textSecondary, bg: colors.hover, isExpiringSoon: false };
    const expiryDate = new Date(`${expiryDateString}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExpiry = Math.round((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { text: `Expired (${Math.abs(daysUntilExpiry)}d ago)`, color: colors.error, bg: `${colors.error}22`, isExpiringSoon: true, isExpired: true };
    }
    if (daysUntilExpiry === 0) {
      return { text: 'Expires Today!', color: colors.error, bg: `${colors.error}22`, isExpiringSoon: true };
    }
    if (daysUntilExpiry <= 3) {
      return { text: `Expires in ${daysUntilExpiry} days`, color: colors.warning, bg: `${colors.warning}22`, isExpiringSoon: true };
    }
    return { text: `Fresh (${daysUntilExpiry} days)`, color: colors.success, bg: `${colors.success}22`, isExpiringSoon: false };
  };

  // KPI Calculations
  const totalItems = items.length;
  const expiringItems = items.filter(item => {
    const status = getExpiryStatus(item.expiryDate);
    return status.isExpiringSoon;
  });
  const expiringItemsCount = expiringItems.length;
  const freshItemsCount = totalItems - expiringItemsCount;
  const uniqueLocationsCount = new Set(items.map(i => i.location).filter(Boolean)).size;

  // Category counts
  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat.key === 'all') {
      acc['all'] = items.length;
    } else {
      acc[cat.key] = items.filter(i => (i.category || '').toLowerCase() === cat.key.toLowerCase()).length;
    }
    return acc;
  }, {});

  // Filtering
  const filteredItems = items.filter(item => {
    if (!item || typeof item.name !== 'string') return false;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
                            (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 2 }}>
      {/* Toast Notification */}
      <Snackbar
        open={!!snackbar?.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity={snackbar?.severity || 'info'} sx={{ width: '100%', borderRadius: '12px', boxShadow: 6 }}>
          {snackbar?.message}
        </Alert>
      </Snackbar>

      {/* Expiry Urgency Banner */}
      {expiringItemsCount > 0 && (
        <Paper
          elevation={0}
          className="badge-pop"
          sx={{
            p: 2,
            mb: 3.5,
            borderRadius: '16px',
            bgcolor: isDarkMode ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
            border: `1px solid ${colors.error}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              className="pulse-glow-error"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: colors.error,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WarningAmberOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDarkMode ? '#FCA5A5' : '#991B1B' }}>
                {expiringItemsCount} {expiringItemsCount === 1 ? 'item needs' : 'items need'} attention!
              </Typography>
              <Typography variant="caption" sx={{ color: isDarkMode ? '#F87171' : '#B91C1C' }}>
                {expiringItems.slice(0, 3).map(i => i.name).join(', ')} {expiringItemsCount > 3 ? `+${expiringItemsCount - 3} more` : ''}
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/recipes')}
            sx={{
              bgcolor: colors.error,
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 700,
              '&:hover': { bgcolor: '#DC2626' },
            }}
          >
            Cook With These
          </Button>
        </Paper>
      )}

      {/* Page Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text, letterSpacing: '-0.02em' }}>
            Kitchen Inventory
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Live stock tracking, automated freshness monitor, and location manager
          </Typography>
        </Box>

        {/* Top Actions & View Switcher */}
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            sx={{
              bgcolor: colors.hover,
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              p: 0.3,
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '8px !important',
                px: 1.5,
                color: colors.textSecondary,
                fontWeight: 600,
                '&.Mui-selected': {
                  bgcolor: colors.cardBg,
                  color: colors.primary,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                },
              },
            }}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewOutlinedIcon sx={{ fontSize: 18, mr: 0.5 }} /> Cards
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <ViewListOutlinedIcon sx={{ fontSize: 18, mr: 0.5 }} /> Table
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon sx={{ color: colors.accent }} />}
            onClick={() => navigate('/recipes')}
            sx={{
              borderColor: colors.border,
              color: colors.text,
              borderRadius: '10px',
              fontWeight: 600,
              '&:hover': { borderColor: colors.accent, bgcolor: colors.accentLight },
            }}
          >
            AI Recipes
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon sx={{ animation: loading ? 'spin 1s infinite' : 'none' }} />}
            onClick={() => {
              inventoryCache = null;
              setLoading(true);
              setRefresh(r => r + 1);
            }}
            disabled={loading}
            sx={{
              borderColor: colors.border,
              color: colors.text,
              borderRadius: '10px',
              fontWeight: 600,
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              background: colors.gradientPrimary,
              borderRadius: '10px',
              fontWeight: 700,
              px: 2.5,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            Add Item
          </Button>
        </Stack>
      </Box>

      {/* KPI Stats Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper
            className="hover-lift glow-card-hover"
            elevation={0}
            sx={{
              width: '100%',
              minHeight: 112,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: '0.04em' }}>TOTAL ITEMS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text, mt: 0.5 }}>{totalItems}</Typography>
            </Box>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
              <Inventory2OutlinedIcon />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper
            className="hover-lift glow-card-hover"
            elevation={0}
            sx={{
              width: '100%',
              minHeight: 112,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: '0.04em' }}>EXPIRING SOON</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: expiringItemsCount > 0 ? colors.error : colors.text, mt: 0.5 }}>
                {expiringItemsCount}
              </Typography>
            </Box>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: `${colors.error}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.error }}>
              <WarningAmberOutlinedIcon />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper
            className="hover-lift glow-card-hover"
            elevation={0}
            sx={{
              width: '100%',
              minHeight: 112,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: '0.04em' }}>FRESH IN STOCK</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.success, mt: 0.5 }}>{freshItemsCount}</Typography>
            </Box>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: `${colors.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.success }}>
              <CheckCircleOutlineIcon />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper
            className="hover-lift glow-card-hover"
            elevation={0}
            sx={{
              width: '100%',
              minHeight: 112,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: '0.04em' }}>STORAGE ZONES</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.accent, mt: 0.5 }}>{uniqueLocationsCount}</Typography>
            </Box>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: colors.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent }}>
              <KitchenOutlinedIcon />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Search & Category Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '20px',
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
          mb: 3.5,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search groceries by item name, location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>      
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Category Filter Pills with Counts */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: { xs: 1, md: 0 } }}>
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.key;
                const count = categoryCounts[cat.key] || 0;
                return (
                  <Chip
                    key={cat.key}
                    label={`${cat.icon} ${cat.label} (${count})`}
                    onClick={() => setSelectedCategory(cat.key)}
                    clickable
                    sx={{
                      fontWeight: isSelected ? 800 : 600,
                      bgcolor: isSelected ? colors.primary : colors.hover,
                      color: isSelected ? '#fff' : colors.text,
                      border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        bgcolor: isSelected ? colors.primaryHover : colors.primaryLight,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* DUAL VIEW CONTENT: GRID CARDS VIEW OR FROSTED TABLE VIEW */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <CircularProgress size={44} sx={{ color: colors.primary, mb: 2 }} />
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>Syncing kitchen inventory...</Typography>
        </Box>
      ) : filteredItems.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: '24px',
            bgcolor: colors.cardBg,
            border: `1px dashed ${colors.border}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: colors.text, mb: 1 }}>
            No groceries found
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
            {searchTerm ? 'Try tweaking your search keywords or choosing another category.' : 'Your kitchen inventory is empty.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ background: colors.gradientPrimary, borderRadius: '10px', fontWeight: 700, px: 3 }}
          >
            Add New Item
          </Button>
        </Paper>
      ) : viewMode === 'grid' ? (
        /* --- VISUAL GRID CARDS VIEW WITH IDENTICAL CARD SIZES --- */
        <Box className="uniform-inventory-grid">
          {filteredItems.map((item, idx) => {
            const status = getExpiryStatus(item.expiryDate);
            const emoji = getCategoryEmoji(item.category);

            return (
              <Card
                key={item.id || idx}
                className="interactive-card glow-card-hover"
                elevation={0}
                sx={{
                  width: '100%',
                  height: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '22px',
                  bgcolor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: colors.cardShadow,
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Item Image / Emoji Artwork Banner: exactly 140px high */}
                <Box
                  sx={{
                    position: 'relative',
                    height: 140,
                    width: '100%',
                    bgcolor: colors.hover,
                    background: isDarkMode
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                      : 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: 56, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
                      {emoji}
                    </Typography>
                  )}

                  {/* Expiry Pill Tag: pinned top right */}
                  <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                    <Chip
                      className={status.isExpiringSoon ? 'pulse-glow-error' : ''}
                      label={status.text}
                      size="small"
                      sx={{
                        bgcolor: status.bg,
                        color: status.color,
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${status.color}33`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    />
                  </Box>

                  {/* Location Tag: pinned bottom left */}
                  <Box sx={{ position: 'absolute', bottom: 10, left: 10, zIndex: 1 }}>
                    <Chip
                      label={getLocationIcon(item.location)}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(10px)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                      }}
                    />
                  </Box>
                </Box>

                {/* Card Content: exactly 180px high, identical vertical rhythm */}
                <CardContent
                  sx={{
                    p: 2.2,
                    height: 180,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Header: Title and Category (fixed height 52px) */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: 52 }}>
                    <Box sx={{ minWidth: 0, pr: 1, flex: 1 }}>
                      <Typography
                        variant="h6"
                        className="line-clamp-1"
                        title={item.name}
                        sx={{
                          fontWeight: 800,
                          color: colors.text,
                          fontSize: '1.05rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.primary,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          fontSize: '0.7rem',
                          display: 'block',
                          mt: 0.3,
                        }}
                      >
                        {item.category || 'General'}
                      </Typography>
                    </Box>

                    <Tooltip title="Delete Item">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item.id, item.name)}
                        sx={{
                          color: colors.textSecondary,
                          transition: 'all 0.2s',
                          p: 0.6,
                          '&:hover': { color: colors.error, bgcolor: `${colors.error}15` },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Quantity Stepper: pinned to bottom (fixed height 44px) */}
                  <Box
                    sx={{
                      pt: 1.5,
                      borderTop: `1px solid ${colors.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: 44,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: colors.textSecondary, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                      QUANTITY
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                        bgcolor: colors.hover,
                        borderRadius: '10px',
                        px: 0.8,
                        py: 0.3,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, -1)}
                        sx={{
                          p: 0.3,
                          color: colors.text,
                          '&:hover': { bgcolor: colors.cardBg },
                        }}
                      >
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: colors.text,
                          minWidth: 22,
                          textAlign: 'center',
                        }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, 1)}
                        sx={{
                          p: 0.3,
                          color: colors.text,
                          '&:hover': { bgcolor: colors.cardBg },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, pr: 0.5, fontWeight: 700 }}>
                        {item.unit || 'pcs'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        /* --- FROSTED TABLE VIEW --- */
        <Paper
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            boxShadow: colors.cardShadow,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
              <thead>
                <tr style={{ backgroundColor: isDarkMode ? '#172233' : '#F1F5F9', borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '16px 20px', color: colors.textSecondary, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</th>
                  <th style={{ padding: '16px 20px', color: colors.textSecondary, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                  <th style={{ padding: '16px 20px', color: colors.textSecondary, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</th>
                  <th style={{ padding: '16px 20px', color: colors.textSecondary, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                  <th style={{ padding: '16px 20px', color: colors.textSecondary, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expiry Status</th>
                  <th style={{ padding: '16px 20px', color: colors.textSecondary, fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const status = getExpiryStatus(item.expiryDate);
                  const emoji = getCategoryEmoji(item.category);

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: `1px solid ${colors.divider}`,
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.hover}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              style={{ width: 42, height: 42, borderRadius: '10px', objectFit: 'cover', border: `1px solid ${colors.border}` }}
                            />
                          ) : (
                            <Avatar sx={{ width: 42, height: 42, borderRadius: '10px', bgcolor: colors.hover, border: `1px solid ${colors.border}`, fontSize: 20 }}>
                              {emoji}
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: colors.text }}>
                              {item.name}
                            </Typography>
                            {item.expiryDate && (
                              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                Expiry: {toDateOnly(item.expiryDate)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <Chip
                          label={item.category || 'General'}
                          size="small"
                          sx={{
                            bgcolor: colors.hover,
                            color: colors.text,
                            border: `1px solid ${colors.divider}`,
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        />
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1, py: 0.3, borderRadius: '8px', bgcolor: colors.hover, border: `1px solid ${colors.divider}` }}>
                          <IconButton size="small" onClick={() => handleQuantityChange(item, -1)} sx={{ p: 0.2, color: colors.text }}>
                            <RemoveIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: colors.text }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => handleQuantityChange(item, 1)} sx={{ p: 0.2, color: colors.text }}>
                            <AddIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            {item.unit || 'pcs'}
                          </Typography>
                        </Box>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>
                          {getLocationIcon(item.location)}
                        </Typography>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <Box
                          className={status.isExpiringSoon ? 'pulse-glow-error' : ''}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.8,
                            px: 1.5,
                            py: 0.6,
                            borderRadius: '20px',
                            bgcolor: status.bg,
                            color: status.color,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: status.color }} />
                          {status.text}
                        </Box>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <Tooltip title="Delete Item">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id, item.name)}
                            sx={{
                              color: colors.textSecondary,
                              transition: 'all 0.2s',
                              '&:hover': { color: colors.error, bgcolor: `${colors.error}18` },
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Add New Item Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: colors.text, pb: 1 }}>
          Add Item to Inventory
        </DialogTitle>
        <Box component="form" onSubmit={handleAdd}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <SuggestionInput
              label="Item Name (e.g., Organic Milk, Fresh Spinach)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value, category: e.target.category || f.category }))}
              required
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Quantity"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={form.unit}
                    label="Unit"
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  >
                    {units.map(u => (
                      <MenuItem key={u} value={u}>{u}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Storage Location</InputLabel>
                  <Select
                    value={form.location}
                    label="Storage Location"
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  >
                    {locations.map(loc => (
                      <MenuItem key={loc} value={loc}>{getLocationIcon(loc)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={form.category}
                    label="Category"
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {categories.filter(c => c.key !== 'all').map(cat => (
                      <MenuItem key={cat.key} value={cat.key}>{cat.icon} {cat.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Expiry Date"
              type="date"
              value={form.expiryDate}
              onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
              helperText="Set an expiry date to receive automatic alerts"
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: colors.textSecondary }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!form.name.trim()}
              sx={{
                background: colors.gradientPrimary,
                borderRadius: '10px',
                px: 3,
                fontWeight: 700,
              }}
            >
              Add to Stock
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}