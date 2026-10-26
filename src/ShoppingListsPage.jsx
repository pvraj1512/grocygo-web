import React, { useEffect, useState, useRef } from 'react';
import {
  Typography, Grid, Box, Button, TextField, IconButton,
  Paper, Card, Chip, Tooltip, Stack, Checkbox, FormControl,
  InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Snackbar, InputAdornment
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import ShoppingSuggestionInput from './ShoppingSuggestionInput';
import { getShoppingLists, addShoppingList, updateShoppingList, deleteShoppingList, getShoppingSuggestions } from './api';
import { auth } from './firebase';
import { useTheme } from './ThemeContext';
import { fireConfetti } from './utils/confetti';

const units = ['pcs', 'kg', 'g', 'packet', 'box', 'loaf', 'container', 'bottle', 'liter', 'bunch'];
const categories = ['fruits', 'vegetables', 'dairy', 'meat & fish', 'namkeen', 'pantry'];

let shoppingListsCache = null;

export default function ShoppingListsPage() {
  const { colors, isDarkMode } = useTheme();
  const [user, setUser] = useState(auth.currentUser);
  const [lists, setLists] = useState([]);
  const [items, setItems] = useState([{ name: '', quantity: 1, unit: 'pcs', category: 'vegetables' }]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [completedMap, setCompletedMap] = useState({});
  const [snackbar, setSnackbar] = useState(null);

  const aiShoppingSuggestCacheRef = useRef({});
  const firstLoad = useRef(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (user && firstLoad.current) {
      if (shoppingListsCache) {
        setLists(shoppingListsCache);
      } else {
        fetchLists();
      }
      try {
        const local = localStorage.getItem('aiShoppingSuggestions');
        if (local) {
          const cached = JSON.parse(local);
          setSuggestions(cached);
          aiShoppingSuggestCacheRef.current['default'] = cached;
        }
      } catch {}
      firstLoad.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const pending = localStorage.getItem('pendingShoppingItems');
    if (!pending) return;
    localStorage.removeItem('pendingShoppingItems');
    try {
      const pendingItems = JSON.parse(pending);
      Promise.all(pendingItems.map(item => addShoppingList(item)))
        .then(() => {
          fetchLists();
          setSnackbar({ open: true, message: 'Missing meal ingredients added to your shopping list.', severity: 'success' });
        })
        .catch(() => setSnackbar({ open: true, message: 'Could not add missing ingredients to the shopping list.', severity: 'error' }));
    } catch {
      setSnackbar({ open: true, message: 'Could not read the missing ingredients.', severity: 'error' });
    }
  }, [user]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await getShoppingLists();
      const listData = res.data || [];
      setLists(listData);
      shoppingListsCache = listData;
    } catch (e) {
      setLists([]);
      shoppingListsCache = [];
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    try {
      const data = await getShoppingSuggestions();
      const arr = Array.isArray(data) ? data : [];
      setSuggestions(arr);
      aiShoppingSuggestCacheRef.current['default'] = arr;
      localStorage.setItem('aiShoppingSuggestions', JSON.stringify(arr));
    } catch (err) {
      setSuggestionsError('Could not fetch suggestions. Please ensure inventory and meal plans have items.');
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleAddDialogSubmit = async (e) => {
    e.preventDefault();
    let updatedLists = [...lists];
    for (const item of items) {
      if (item.name && item.name.trim()) {
        const key = `${item.name.trim().toLowerCase()}|${item.unit}|${item.category}`;
        const existing = updatedLists.find(
          l => `${(l.name || l.item || '').trim().toLowerCase()}|${l.unit}|${l.category}` === key
        );
        if (existing) {
          const updated = {
            ...existing,
            quantity: Number(existing.quantity || 1) + Number(item.quantity || 1)
          };
          await updateShoppingList(existing.id, updated);
          updatedLists = updatedLists.map(l => l.id === existing.id ? updated : l);
        } else {
          const res = await addShoppingList({ ...item, quantity: Number(item.quantity || 1) });
          updatedLists.push(res.data || { ...item, quantity: Number(item.quantity || 1) });
        }
      }
    }
    setLists(updatedLists);
    shoppingListsCache = updatedLists;
    setItems([{ name: '', quantity: 1, unit: 'pcs', category: 'vegetables' }]);
    setDialogOpen(false);
    fireConfetti({ count: 35 });
    setSnackbar({ open: true, message: 'Shopping list updated!', severity: 'success' });
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const name = quickInput.trim();
    const item = { name, quantity: 1, unit: 'pcs', category: 'pantry' };
    const res = await addShoppingList(item);
    const updated = [...lists, res.data || item];
    setLists(updated);
    shoppingListsCache = updated;
    setQuickInput('');
    setSnackbar({ open: true, message: `Added "${name}" to shopping list!`, severity: 'success' });
  };

  const handleDelete = async (id) => {
    await deleteShoppingList(id);
    const updated = lists.filter(l => l.id !== id);
    setLists(updated);
    shoppingListsCache = updated;
  };

  const handleQuantityAdjust = async (list, delta) => {
    const newQty = Math.max(1, (Number(list.quantity) || 1) + delta);
    const updated = { ...list, quantity: newQty };
    const updatedLists = lists.map(l => (l.id === list.rawId || l.id === list.id) ? updated : l);
    setLists(updatedLists);
    shoppingListsCache = updatedLists;
    await updateShoppingList(list.rawId || list.id, updated);
  };

  const handleAddFromSuggestion = async (item) => {
    const name = item.name || item.item || '';
    const unit = item.unit || 'pcs';
    const category = item.category || 'pantry';
    const key = `${name.trim().toLowerCase()}|${unit}|${category}`;
    const existing = lists.find(
      l => `${(l.name || l.item || '').trim().toLowerCase()}|${l.unit}|${l.category}` === key
    );

    let updatedLists = [...lists];
    if (existing) {
      const updated = {
        ...existing,
        quantity: Number(existing.quantity || 1) + 1
      };
      await updateShoppingList(existing.id, updated);
      updatedLists = updatedLists.map(l => l.id === existing.id ? updated : l);
    } else {
      const res = await addShoppingList({ name, quantity: 1, unit, category });
      updatedLists.push(res.data || { name, quantity: 1, unit, category });
    }
    setLists(updatedLists);
    shoppingListsCache = updatedLists;
    fireConfetti({ count: 30, origin: { x: 0.8, y: 0.6 } });
    setSnackbar({ open: true, message: `Added "${name}" to your shopping list!`, severity: 'success' });
  };

  const toggleComplete = (key) => {
    setCompletedMap(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const total = groupedLists.length;
      const completed = groupedLists.filter(l => next[`${l.name}|${l.unit}|${l.category}`]).length;
      if (completed === total && total > 0) {
        fireConfetti({ count: 80, origin: { x: 0.5, y: 0.5 } });
      }
      return next;
    });
  };

  // Group items by name/unit/category
  const groupedLists = Object.values(lists.reduce((acc, list) => {
    const name = list.name || list.item || '(Unnamed Item)';
    const unit = list.unit || '';
    const category = list.category || '';
    const key = `${name.toLowerCase()}|${unit}|${category}`;
    if (!acc[key]) {
      acc[key] = { ...list, name, quantity: Number(list.quantity) || 1, rawId: list.id };
    } else {
      acc[key].quantity += Number(list.quantity) || 1;
    }
    return acc;
  }, {}));

  const totalItemsCount = groupedLists.length;
  const completedCount = groupedLists.filter(l => completedMap[`${l.name}|${l.unit}|${l.category}`]).length;

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

      {/* Page Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text, letterSpacing: '-0.02em' }}>
            Shopping & Grocery Lists
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Automated grocery list generated from meal plans and depleted kitchen inventory
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon sx={{ animation: loading ? 'spin 1s infinite' : 'none' }} />}
            onClick={fetchLists}
            disabled={loading}
            sx={{ borderColor: colors.border, color: colors.text, borderRadius: '10px', fontWeight: 600 }}
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
            Add Items
          </Button>
        </Stack>
      </Box>

      {/* Main Grid: Checklist on Left (8 cols), AI Smart Suggestions on Right (4 cols) */}
      <Grid container spacing={3.5}>
        {/* Left Column: Interactive Shopping List */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '24px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
            }}
          >
            {/* List Header & Progress Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    bgcolor: colors.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primary,
                  }}
                >
                  <ShoppingCartOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text }}>
                    Active Shopping List
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    {completedCount} of {totalItemsCount} items collected
                  </Typography>
                </Box>
              </Box>

              {totalItemsCount > 0 && (
                <Chip
                  label={`${Math.round((completedCount / totalItemsCount) * 100)}% Complete`}
                  size="small"
                  sx={{
                    bgcolor: completedCount === totalItemsCount ? `${colors.success}22` : colors.hover,
                    color: completedCount === totalItemsCount ? colors.success : colors.text,
                    fontWeight: 800,
                    px: 1,
                  }}
                />
              )}
            </Box>

            {/* Quick Add Bar */}
            <Box component="form" onSubmit={handleQuickAdd} sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Quick add item (e.g., Greek yogurt, olive oil)..."
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                sx={{
                  bgcolor: colors.hover,
                  borderRadius: '10px',
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!quickInput.trim()}
                sx={{
                  background: colors.gradientPrimary,
                  borderRadius: '10px',
                  px: 3,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                + Add
              </Button>
            </Box>

            {/* Items List */}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={36} sx={{ color: colors.primary, mb: 1.5 }} />
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Loading shopping list...</Typography>
              </Box>
            ) : groupedLists.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: colors.hover, borderRadius: '16px', border: `1px dashed ${colors.border}` }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
                  Your shopping list is clear!
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2.5 }}>
                  Add items using the quick input above or explore AI smart recommendations on the right.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogOpen(true)}
                  sx={{ background: colors.gradientPrimary, borderRadius: '10px', fontWeight: 600 }}
                >
                  Create New List
                </Button>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {groupedLists.map(list => {
                  const itemKey = `${list.name}|${list.unit}|${list.category}`;
                  const isChecked = Boolean(completedMap[itemKey]);

                  return (
                    <Paper
                      key={itemKey}
                      elevation={0}
                      className="glow-card-hover"
                      sx={{
                        p: 2,
                        minHeight: 74,
                        borderRadius: '16px',
                        bgcolor: isChecked ? colors.hover : colors.paper,
                        border: `1px solid ${isChecked ? colors.divider : colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        transition: 'all 0.2s',
                        opacity: isChecked ? 0.6 : 1,
                      }}
                    >
                      {/* Checkbox & Item Details */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                        <Checkbox
                          checked={isChecked}
                          onChange={() => toggleComplete(itemKey)}
                          icon={<RadioButtonUncheckedIcon sx={{ color: colors.textSecondary }} />}
                          checkedIcon={<CheckCircleIcon sx={{ color: colors.success }} />}
                          sx={{ p: 0.5 }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 700,
                              color: colors.text,
                              textDecoration: isChecked ? 'line-through' : 'none',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {list.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                              {list.quantity} {list.unit || 'pcs'}
                            </Typography>
                            {list.category && (
                              <Chip
                                label={list.category}
                                size="small"
                                sx={{ height: 18, fontSize: '0.65rem', textTransform: 'capitalize', bgcolor: colors.hover }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Quantity Steppers & Delete Button */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: colors.hover, borderRadius: '8px', border: `1px solid ${colors.divider}`, p: 0.2 }}>
                          <IconButton size="small" onClick={() => handleQuantityAdjust(list, -1)} sx={{ p: 0.3, color: colors.text }}>
                            <RemoveIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: colors.text, px: 0.8 }}>
                            {list.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => handleQuantityAdjust(list, 1)} sx={{ p: 0.3, color: colors.text }}>
                            <AddIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => handleDelete(list.rawId || list.id)}
                          sx={{
                            color: colors.textSecondary,
                            '&:hover': { color: colors.error, bgcolor: `${colors.error}18` },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Right Column: AI Smart Suggestions Panel */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              position: { lg: 'sticky' },
              top: { lg: 90 },
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: colors.accentLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.accent,
                }}
              >
                <AutoAwesomeIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text }}>
                  Smart Suggestions
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Missing ingredients for scheduled meals
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              startIcon={<AutoAwesomeIcon />}
              onClick={fetchSuggestions}
              disabled={suggestionsLoading}
              sx={{
                background: colors.gradientAccent,
                borderRadius: '10px',
                fontWeight: 700,
                py: 1.2,
                mb: 3,
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
              }}
            >
              {suggestionsLoading ? 'Analyzing Needs...' : 'Auto-Detect Missing Items'}
            </Button>

            {suggestionsError && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
                {suggestionsError}
              </Alert>
            )}

            {/* Suggestion Cards */}
            {suggestionsLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={30} sx={{ color: colors.accent, mb: 1 }} />
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Checking recipes...</Typography>
              </Box>
            ) : suggestions.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: colors.hover, borderRadius: '16px', border: `1px dashed ${colors.border}` }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  No missing items detected for your planned meals right now.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5} sx={{ maxHeight: 460, overflowY: 'auto', pr: 0.5 }}>
                {suggestions.map((item, idx) => {
                  const displayName = item.name || item.item;
                  if (!displayName) return null;

                  let neededFor = Array.isArray(item.needed_for)
                    ? Array.from(new Set(item.needed_for.filter(Boolean)))
                    : [];
                  const neededForText = neededFor.slice(0, 2).join(', ');

                  return (
                    <Paper
                      key={displayName + idx}
                      elevation={0}
                      className="glow-card-hover"
                      sx={{
                        p: 2,
                        minHeight: 74,
                        borderRadius: '16px',
                        bgcolor: colors.hover,
                        border: `1px solid ${colors.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: colors.primaryLight,
                          borderColor: colors.primary,
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {displayName}
                        </Typography>
                        {neededForText && (
                          <Typography variant="caption" sx={{ color: colors.primary, display: 'block', mt: 0.2 }}>
                            Needed for: {neededForText}
                          </Typography>
                        )}
                      </Box>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleAddFromSuggestion(item)}
                        sx={{
                          minWidth: 36,
                          height: 36,
                          borderRadius: '8px',
                          p: 0,
                          background: colors.gradientPrimary,
                          fontWeight: 700,
                        }}
                      >
                        +
                      </Button>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Multi-Item Add Dialog */}
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
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: colors.text }}>
            Add Shopping Items
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            Add multiple groceries to your active shopping list
          </Typography>
        </DialogTitle>

        <Box component="form" onSubmit={handleAddDialogSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {items.map((item, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  border: `1px solid ${colors.border}`,
                  bgcolor: colors.hover,
                  position: 'relative',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.textSecondary }}>
                    ITEM #{idx + 1}
                  </Typography>
                  {items.length > 1 && (
                    <IconButton size="small" color="error" onClick={() => setItems(arr => arr.filter((_, i) => i !== idx))}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <ShoppingSuggestionInput
                    label="Item Name"
                    size="small"
                    value={item.name}
                    onChange={e => setItems(arr => arr.map((it, i) => i === idx ? {
                      ...it,
                      name: e.target.value,
                      category: e.category || it.category
                    } : it))}
                    required
                  />
                </Box>

                <Grid container spacing={1.5}>
                  <Grid item xs={4}>
                    <TextField
                      label="Quantity"
                      size="small"
                      type="number"
                      inputProps={{ min: 1 }}
                      value={item.quantity}
                      onChange={e => setItems(arr => arr.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it))}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl size="small" fullWidth required>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={item.unit}
                        label="Unit"
                        onChange={e => setItems(arr => arr.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it))}
                      >
                        {units.map(u => (
                          <MenuItem key={u} value={u}>{u}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl size="small" fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={item.category}
                        label="Category"
                        onChange={e => setItems(arr => arr.map((it, i) => i === idx ? { ...it, category: e.target.value } : it))}
                      >
                        {categories.map(c => (
                          <MenuItem key={c} value={c}>{c}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setItems(arr => [...arr, { name: '', quantity: 1, unit: 'pcs', category: 'vegetables' }])}
              fullWidth
              sx={{
                py: 1,
                borderRadius: '12px',
                borderColor: colors.border,
                color: colors.text,
                borderStyle: 'dashed',
                '&:hover': { borderColor: colors.primary, bgcolor: colors.primaryLight },
              }}
            >
              + Add Another Item
            </Button>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: colors.textSecondary }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: colors.gradientPrimary,
                borderRadius: '10px',
                px: 3,
                fontWeight: 700,
              }}
            >
              Add All to Shopping List
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
