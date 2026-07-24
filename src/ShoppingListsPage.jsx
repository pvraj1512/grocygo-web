import React, { useEffect, useState, useRef } from 'react';
import { getShoppingLists, addShoppingList, updateShoppingList, deleteShoppingList } from './api';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, FormControl, InputLabel, Box
} from '@mui/material';
import ShoppingSuggestionInput from './ShoppingSuggestionInput';
import { useTheme } from './ThemeContext';

// Fetch smart shopping suggestions from backend (returns [{item, needed_for: [...]}, ...])
// Uses GET /api/shopping/suggestions, which uses the user's inventory and recipes
async function getShoppingSuggestions() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("User not authenticated");
  const res = await fetch('https://grocygo.onrender.com/api/shopping/suggestions', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key': process.env.REACT_APP_API_KEY
    }
  });
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && data.error) throw new Error(data.error);
  return [];
}


const units = ['pcs', 'kg', 'packet', 'box', 'loaf', 'container'];
const categories = ['fruits', 'vegetables', 'namkeen', 'meat & fish', 'dairy', 'pantry'];

// Module-level cache for shopping lists (persists while app is loaded)
let shoppingListsCache = null;

export default function ShoppingListsPage() {
  // In-memory cache for AI shopping suggestions (per session)
  const aiShoppingSuggestCacheRef = useRef({});
  const [lists, setLists] = useState([]);
  const [items, setItems] = useState([
    { name: '', quantity: 1, unit: '', category: '' }
  ]);
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);
  const [suggestionPrompt, setSuggestionPrompt] = useState("");
  const theme = useTheme();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  const [loading, setLoading] = useState(false);
  const firstLoad = useRef(true);


  useEffect(() => {
    if (user && firstLoad.current) {
      // Restore shopping lists from cache if available
      if (shoppingListsCache) {
        setLists(shoppingListsCache);
      } else {
        fetchLists();
      }
      // Restore AI shopping suggestions from in-memory cache or localStorage
      const aiCacheKey = 'default';
      let cached = aiShoppingSuggestCacheRef.current[aiCacheKey];
      if (!cached) {
        try {
          const local = localStorage.getItem('aiShoppingSuggestions');
          if (local) {
            cached = JSON.parse(local);
            aiShoppingSuggestCacheRef.current[aiCacheKey] = cached;
          }
        } catch {}
      }
      if (cached) {
        setSuggestions(cached);
      } else {
        setSuggestions([]);
      }
      firstLoad.current = false;
    }
  }, [user]);


  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await getShoppingLists();
      setLists(res.data);
      shoppingListsCache = res.data; // Update cache
    } finally {
      setLoading(false);
    }
  };

  const [rawSuggestions, setRawSuggestions] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const fetchSuggestions = async () => {
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    setRawSuggestions(null);
    const aiCacheKey = 'default'; // You can expand this if you add filters/prompts
    if (aiShoppingSuggestCacheRef.current[aiCacheKey]) {
      setSuggestions(aiShoppingSuggestCacheRef.current[aiCacheKey]);
      setSuggestionsLoading(false);
      return;
    }
    try {
      const data = await getShoppingSuggestions();
      const arr = Array.isArray(data) ? data : [];
      setSuggestions(arr);
      setRawSuggestions(data);
      setShowSmartSuggestions(true);
      aiShoppingSuggestCacheRef.current[aiCacheKey] = arr;
      // Persist to localStorage
      try {
        localStorage.setItem('aiShoppingSuggestions', JSON.stringify(arr));
      } catch {}
      // Log backend response for debugging
      console.log('AI Shopping Suggestions backend response:', data);
    } catch (err) {
      setSuggestionsError(err.message || 'Failed to fetch suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    let updatedLists = [...lists];
    for (const item of items) {
      if (item.name && item.quantity && item.unit && item.category) {
        const key = `${item.name.trim().toLowerCase()}|${item.unit}|${item.category}`;
        const existing = updatedLists.find(
          l => `${(l.name || l.item || '').trim().toLowerCase()}|${l.unit}|${l.category}` === key
        );
        if (existing) {
          const updated = {
            ...existing,
            quantity: Number(existing.quantity || 1) + Number(item.quantity)
          };
          await updateShoppingList(existing.id, updated);
          updatedLists = updatedLists.map(l => l.id === existing.id ? updated : l);
        } else {
          const res = await addShoppingList({ ...item, quantity: Number(item.quantity) });
          updatedLists.push(res.data || { ...item, quantity: Number(item.quantity) });
        }
      }
    }
    setLists(updatedLists);
    setItems([{ name: '', quantity: 1, unit: '', category: '' }]);
    setDialogOpen(false);
    // Only fetchLists on dialog close, not after every add
  };

  const handleDelete = async (id) => {
    await deleteShoppingList(id);
    setLists(lists => lists.filter(l => l.id !== id));
  };

  const handleAddFromSuggestion = async (item) => {
    // Accept both {item, needed_for} and {name, ...}
    const name = item.name || item.item || '';
    const unit = item.unit || '';
    const category = item.category || '';
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
      const res = await addShoppingList({
        name,
        quantity: 1,
        unit,
        category
      });
      updatedLists.push(res.data || { name, quantity: 1, unit, category });
    }
    setLists(updatedLists);
    // No fetchLists here
  };

  if (!user) {
    let email, password;
    return (
      <form onSubmit={async e => {
        e.preventDefault();
        await signInWithEmailAndPassword(auth, email.value, password.value);
      }}>
        <input placeholder="Email" ref={el => email = el} />
        <input placeholder="Password" type="password" ref={el => password = el} />
        <button type="submit">Login</button>
      </form>
    );
  }

  // Calculate completed and estimated total (mocked)
  const completed = 0;
  const estimatedTotal = lists.reduce((sum, item) => sum + (item.price || 0), 0);
  return (
    <div className="shopping-page-root" style={{
      background: theme.colors.background,
      minHeight: '100vh'
    }}>
      <style>{`
        .shopping-page-root {
          background: none !important;
        }
        .shopping-layout {
          display: flex;
          gap: 32px;
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        @media (max-width: 1024px) {
          .shopping-layout {
            flex-direction: column;
            padding: 16px;
            gap: 16px;
          }
        }
      `}</style>
      <div className="shopping-layout">
        <div style={{
          flex: '1 1 auto',
          minWidth: 0,
          maxWidth: '100%'
        }}>
          <h1 style={{ margin: '0 0 8px 0', color: theme.colors.text }}>Shopping Lists</h1>
          <div style={{ color: theme.colors.textSecondary, marginBottom: 24 }}>Smart shopping lists based on your inventory and meal plans</div>
          <Box sx={{
            background: theme.colors.paper,
            borderRadius: 2,
            p: { xs: 2, sm: 3 },
            boxShadow: '0 2px 8px #0001',
            mb: 3,
            border: `1px solid ${theme.colors.divider}`
          }}>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2,
              mb: 2
            }}>
              <h2 style={{ margin: 0, flex: 1, minWidth: '200px', color: theme.colors.text }}>Shopping List</h2>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{completed}/{lists.length} completed</span>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setDialogOpen(true)}
                  sx={{ color: theme.colors.text, borderColor: theme.colors.divider }}
                >+ Add</Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={fetchLists}
                  disabled={loading}
                  sx={{ color: theme.colors.text, borderColor: theme.colors.divider }}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </Box>
            </Box>
            <div style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>Estimated total: ${estimatedTotal.toFixed(2)}</div>
            <form onSubmit={e => { e.preventDefault(); setDialogOpen(true); }}>
              <TextField
                fullWidth
                placeholder="Add new item..."
                onFocus={() => setDialogOpen(true)}
                sx={{ mb: 2 }}
                value=""
                InputProps={{
                  endAdornment: (
                    <Button variant="contained" onClick={() => setDialogOpen(true)} sx={{ minWidth: 40, p: 0, background: theme.colors.primary, color: theme.colors.paper }}>+</Button>
                  )
                }}
                inputProps={{ readOnly: true }}
              />
            </form>
            {loading ? (
              <div style={{ color: theme.colors.textSecondary, textAlign: 'center', margin: '48px 0', fontSize: 18 }}>Loading...</div>
            ) : (
              <>
                {lists.length === 0 ? (
                  <div style={{ color: theme.colors.textSecondary, textAlign: 'center', margin: '48px 0' }}>
                    Your shopping list is empty.<br />Add items using the input above.
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {Object.values(lists.reduce((acc, list) => {
                      const name = list.name || list.item || '(No name)';
                      const unit = list.unit || '';
                      const category = list.category || '';
                      const key = `${name.toLowerCase()}|${unit}|${category}`;
                      if (!acc[key]) {
                        acc[key] = { ...list, name, quantity: Number(list.quantity) || 1 };
                      } else {
                        acc[key].quantity += Number(list.quantity) || 1;
                      }
                      return acc;
                    }, {})).map(list => (
                      <li key={list.name + '|' + list.unit + '|' + list.category} style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: `1px solid ${theme.colors.divider}`,
                        padding: '12px 0'
                      }}>
                        <div style={{
                          flex: '1 1 250px',
                          minWidth: 0
                        }}>
                          <div style={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: theme.colors.text
                          }}>{list.name}</div>
                          <div style={{
                            color: theme.colors.textSecondary,
                            fontSize: '0.9em',
                            marginTop: '4px'
                          }}>
                            {list.quantity} {list.unit} {list.category && `| ${list.category}`}
                          </div>
                        </div>
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(list.id)}
                          sx={{ color: theme.colors.error }}
                        >Delete</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </Box>
        </div>
        <div style={{
          flex: '0 0 380px',
          background: theme.colors.paper,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px #0001',
          minWidth: 280,
          maxWidth: '100%',
          alignSelf: 'flex-start',
          position: 'sticky',
          top: 32,
          border: `1px solid ${theme.colors.divider}`,
          boxSizing: 'border-box',
          height: 'max-content',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          color: theme.colors.text
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 16 }}>
            <h2 style={{ margin: 0, flex: 1, fontSize: '1.5rem', color: theme.colors.text }}>Smart Suggestions</h2>
          </div>
          <Button
            variant="contained"
            sx={{ background: theme.colors.primary, color: theme.colors.paper, width: '100%', mb: 2, '&:hover': { background: theme.colors.primary } }}
            onClick={fetchSuggestions}
            disabled={suggestionsLoading}
          >{suggestionsLoading ? 'Generating...' : 'Auto Generate'}</Button>
          {suggestionsError && (
            <div style={{ color: theme.colors.error, textAlign: 'center', margin: '16px 0' }}>{suggestionsError}</div>
          )}
          {(!suggestionsLoading && suggestions.length === 0 && !suggestionsError) && (
            <div style={{ color: theme.colors.textSecondary, textAlign: 'center', margin: '32px 0' }}>
              No smart suggestions available.<br />
              <span style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                This may happen if your inventory and meal plans are empty, or the AI could not generate suggestions for your data.<br />
                Try adding items to your inventory or meal plans, or adjust your prompt above.<br />
              </span>
              <Button variant="outlined" sx={{ mt: 2, mr: 2, color: theme.colors.text, borderColor: theme.colors.divider }} onClick={() => fetchSuggestions(suggestionPrompt)}>
                Regenerate Suggestions
              </Button>
              {rawSuggestions !== null && (
                <Button variant="text" sx={{ mt: 2, color: theme.colors.primary }} onClick={() => setShowRaw(v => !v)}>
                  {showRaw ? 'Hide' : 'Show'} Debug Info
                </Button>
              )}
              {showRaw && rawSuggestions !== null && (
                <pre style={{
                  textAlign: 'left',
                  marginTop: 12,
                  background: theme.colors.hover,
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 12,
                  maxHeight: 200,
                  overflow: 'auto',
                  color: theme.colors.text
                }}>
                  {JSON.stringify(rawSuggestions, null, 2)}
                </pre>
              )}
            </div>
          )}
          {suggestionsLoading && (
            <div style={{ color: theme.colors.textSecondary, textAlign: 'center', margin: '32px 0' }}>Loading suggestions...</div>
          )}
          {suggestions.length > 0 && !suggestionsLoading && (
            <>
              {suggestions.map((item, idx) => {
                const displayName = item.name || item.item;
                // Deduplicate and limit needed_for list for readability
                let neededFor = Array.isArray(item.needed_for)
                  ? Array.from(new Set(item.needed_for.filter(Boolean)))
                  : [];
                const neededForDisplay = neededFor.length > 0
                  ? neededFor.slice(0, 3).join(', ') + (neededFor.length > 3 ? `, +${neededFor.length - 3} more` : '')
                  : '';
                if (!displayName) return null;
                return (
                  <div key={displayName + idx} style={{
                    border: `1px solid ${theme.colors.divider}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: theme.colors.hover,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: theme.colors.text
                      }}>{displayName}</div>
                      {neededForDisplay && (
                        <div style={{
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          marginTop: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          Needed for: {neededForDisplay}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ minWidth: 32, height: 32, p: 0, color: theme.colors.primary, borderColor: theme.colors.primary }}
                      onClick={() => handleAddFromSuggestion(item)}
                    >+</Button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{
          style: {
            background: theme.colors.paper,
            color: theme.colors.text
          }
        }}
      >
        <DialogTitle>Add Items</DialogTitle>
        <form onSubmit={handleAdd}>
          <DialogContent>
            {items.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2, border: `1px solid ${theme.colors.divider}`, borderRadius: 2, p: 2, position: 'relative', background: theme.colors.hover }}>
                <ShoppingSuggestionInput
                  label="Item Name"
                  value={item.name}
                  onChange={e => setItems(arr => arr.map((it, i) => i === idx ? {
                    ...it,
                    name: e.target.value,
                    category: e.category || it.category
                  } : it))}
                  required
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={e => setItems(arr => arr.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it))}
                  required
                  sx={{ mb: 1 }}
                  InputProps={{
                    style: { color: theme.colors.text }
                  }}
                />
                <FormControl fullWidth required sx={{ mb: 1 }}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={item.unit}
                    label="Unit"
                    onChange={e => setItems(arr => arr.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it))}
                  >
                    {units.map(unit => (
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={item.category}
                    label="Category"
                    onChange={e => setItems(arr => arr.map((it, i) => i === idx ? { ...it, category: e.target.value } : it))}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {items.length > 1 && (
                  <Button
                    size="small"
                    color="error"
                    sx={{ position: 'absolute', top: 8, right: 8, color: theme.colors.error }}
                    onClick={() => setItems(arr => arr.filter((_, i) => i !== idx))}
                  >Remove</Button>
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => setItems(arr => [...arr, { name: '', quantity: 1, unit: '', category: '' }])}
              sx={{ mb: 2, color: theme.colors.text, borderColor: theme.colors.divider }}
              fullWidth
            >+ Add Another Item</Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDialogOpen(false);
              setItems([{ name: '', quantity: 1, unit: '', category: '' }]);
            }} sx={{ color: theme.colors.text }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ background: theme.colors.primary, color: theme.colors.paper }}>Add All</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
