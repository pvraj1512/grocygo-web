import React, { useEffect, useState, useRef } from 'react';
import {
  Typography, Grid, Box, Button, TextField, IconButton,
  Card, CardContent, CardMedia, Chip, Paper, Stack,
  FormControl, InputLabel, Select, MenuItem, LinearProgress,
  Tooltip, CircularProgress, Alert, Snackbar
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenuOutlined';
import BarChartIcon from '@mui/icons-material/BarChartOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GrassIcon from '@mui/icons-material/Grass';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';

import AddRecipeDialog from './AddRecipeDialog';
import AIRecipeDetailsDialog from './AIRecipeDetailsDialog';
import { getRecipes, getInventory, addRecipe, deleteRecipe, getSuggestedRecipes } from './api';
import { auth } from './firebase';
import { useTheme } from './ThemeContext';
import { fireConfetti } from './utils/confetti';

let recipesCache = null;
let inventoryCache = null;

const COURSE_OPTIONS = [
  'All Courses', 'Dinner', 'Lunch', 'Side Dish', 'South Indian Breakfast',
  'Snack', 'Dessert', 'Appetizer', 'Main Course', 'World Breakfast',
  'Indian Breakfast', 'North Indian Breakfast', 'One Pot Dish', 'Brunch'
];

const DIET_OPTIONS = [
  'All Diets', 'Vegetarian', 'High Protein Vegetarian', 'Non Vegeterian',
  'No Onion No Garlic (Sattvic)', 'High Protein Non Vegetarian', 'Diabetic Friendly',
  'Eggetarian', 'Vegan', 'Gluten Free', 'Sugar Free Diet'
];

const QUICK_INSPIRATION_TAGS = [
  { label: '⚡ 15-Min Quick', course: 'Snack', diet: '' },
  { label: '🥗 High Protein', course: '', diet: 'High Protein Vegetarian' },
  { label: '🍲 One-Pot Meal', course: 'One Pot Dish', diet: '' },
  { label: '🥦 100% Vegan', course: '', diet: 'Vegan' },
  { label: '🥞 Breakfast Feasts', course: 'Indian Breakfast', diet: '' },
];

const CHART_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'];

export default function RecipesPage({ forceOpenDialog }) {
  const { colors, isDarkMode } = useTheme();
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState(auth.currentUser);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const aiSuggestCacheRef = useRef({});
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [aiCourse, setAiCourse] = useState(() => localStorage.getItem('aiCourse') || '');
  const [aiDiet, setAiDiet] = useState(() => localStorage.getItem('aiDiet') || '');
  const [recipesRefresh, setRecipesRefresh] = useState(0);
  const [suggestRefresh, setSuggestRefresh] = useState(0);
  const [selectedDetailRecipe, setSelectedDetailRecipe] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [savedRecipeTitles, setSavedRecipeTitles] = useState(new Set());

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      let recipesPromise, inventoryPromise;
      if (recipesCache && Array.isArray(recipesCache)) {
        setRecipes(recipesCache);
        recipesPromise = Promise.resolve();
      } else {
        recipesPromise = fetchRecipes();
      }
      if (inventoryCache && Array.isArray(inventoryCache)) {
        setInventoryItems(inventoryCache);
        inventoryPromise = Promise.resolve();
      } else {
        inventoryPromise = fetchInventory();
      }
      Promise.all([recipesPromise, inventoryPromise]).then(() => setLoading(false));
    }
  }, [user, recipesRefresh]);

  useEffect(() => {
    setSuggestLoading(true);
    const aiIngredients = inventoryItems.map(i => i?.name || i);
    const cacheKey = JSON.stringify({ aiIngredients, aiCourse, aiDiet });

    if (aiSuggestCacheRef.current[cacheKey]) {
      setSuggestedRecipes(aiSuggestCacheRef.current[cacheKey]);
      setSuggestLoading(false);
    } else {
      getSuggestedRecipes(aiIngredients, aiCourse, aiDiet)
        .then(res => {
          const suggestions = Array.isArray(res) ? res : [];
          setSuggestedRecipes(suggestions);
          aiSuggestCacheRef.current[cacheKey] = suggestions;
        })
        .catch(() => {
          setSuggestedRecipes([]);
          aiSuggestCacheRef.current[cacheKey] = [];
        })
        .finally(() => setSuggestLoading(false));
    }
  }, [inventoryItems, aiCourse, aiDiet, suggestRefresh]);

  useEffect(() => {
    localStorage.setItem('aiCourse', aiCourse);
  }, [aiCourse]);

  useEffect(() => {
    localStorage.setItem('aiDiet', aiDiet);
  }, [aiDiet]);

  useEffect(() => {
    if (forceOpenDialog) setDialogOpen(true);
  }, [forceOpenDialog]);

  const fetchRecipes = async () => {
    try {
      const res = await getRecipes();
      const arr = Array.isArray(res.data) ? res.data.filter(Boolean) : [];
      setRecipes(arr);
      recipesCache = arr;
    } catch (e) {
      setRecipes([]);
      recipesCache = [];
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await getInventory();
      const arr = Array.isArray(res.data) ? res.data.filter(Boolean) : [];
      setInventoryItems(arr);
      inventoryCache = arr;
    } catch (e) {
      setInventoryItems([]);
    }
  };

  const handleAddRecipe = async (recipe) => {
    await addRecipe(recipe);
    setDialogOpen(false);
    setRecipes(prev => {
      const updated = [...prev, recipe];
      recipesCache = updated;
      return updated;
    });
    fireConfetti({ count: 40 });
    setSnackbar({ open: true, message: `Recipe "${recipe.name}" saved!`, severity: 'success' });
  };

  const handleDelete = async (id, name) => {
    await deleteRecipe(id);
    setRecipes(prev => {
      const updated = prev.filter(r => r.id !== id);
      recipesCache = updated;
      return updated;
    });
    setSnackbar({ open: true, message: `Deleted recipe "${name || 'Recipe'}"`, severity: 'info' });
  };

  const handleSaveToMyRecipes = async (recipe) => {
    const title = recipe.recipe_title || recipe.name;
    try {
      const payload = {
        name: title,
        description: recipe.description || '',
        url: recipe.url || '',
        recipe_image: recipe.recipe_image || '',
        prep_time: recipe.prep_time || '',
        course: recipe.course || '',
        diet: recipe.diet || '',
        instructions: recipe.instructions || '',
        cuisine: recipe.cuisine || 'Fusion',
        items: recipe.ingredients
          ? (typeof recipe.ingredients === 'string'
              ? recipe.ingredients.split('|').map(ing => ({ name: ing.trim(), quantity: '', unit: '', fromInventory: false }))
              : recipe.ingredients)
          : [],
        recipe: recipe,
      };
      await addRecipe(payload);
      setSavedRecipeTitles(prev => new Set(prev).add(title));
      setRecipes(prev => {
        const updated = [...prev, payload];
        recipesCache = updated;
        return updated;
      });
      fireConfetti({ count: 50, origin: { x: 0.7, y: 0.5 } });
      setSnackbar({ open: true, message: `Saved "${title}" to your recipes! 🎉`, severity: 'success' });
    } catch (e) {
      console.error('Failed to save recipe:', e);
      setSnackbar({ open: true, message: 'Failed to save recipe.', severity: 'error' });
    }
  };

  const handleQuickTagClick = (tag) => {
    setAiCourse(tag.course);
    setAiDiet(tag.diet);
  };

  // Cuisine breakdown for chart
  const cuisineData = Object.values(
    recipes.reduce((acc, r) => {
      if (!r) return acc;
      const cuisine = r.cuisine || r.course || 'General';
      acc[cuisine] = acc[cuisine] || { cuisine, count: 0 };
      acc[cuisine].count += 1;
      return acc;
    }, {})
  ).slice(0, 7);

  const invNames = (inventoryItems || []).map(x => (x?.name || '').toLowerCase());

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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text, letterSpacing: '-0.02em' }}>
            Recipes & Culinary AI
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Discover smart recipe recommendations matched to your kitchen stock and curate your favorite meals
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon sx={{ animation: loading ? 'spin 1s infinite' : 'none' }} />}
            onClick={() => {
              recipesCache = null;
              inventoryCache = null;
              aiSuggestCacheRef.current = {};
              setRecipesRefresh(r => r + 1);
              setSuggestRefresh(r => r + 1);
            }}
            disabled={loading || suggestLoading}
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
            Create Recipe
          </Button>
        </Stack>
      </Box>

      {/* Quick Inspiration Pills */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 1, mb: 3.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.textSecondary, whiteSpace: 'nowrap', mr: 0.5 }}>
          QUICK INSPIRATION:
        </Typography>
        {QUICK_INSPIRATION_TAGS.map((tag, idx) => (
          <Chip
            key={idx}
            label={tag.label}
            onClick={() => handleQuickTagClick(tag)}
            clickable
            sx={{
              bgcolor: (aiCourse === tag.course && aiDiet === tag.diet) ? colors.accent : colors.hover,
              color: (aiCourse === tag.course && aiDiet === tag.diet) ? '#fff' : colors.text,
              fontWeight: 700,
              border: `1px solid ${colors.border}`,
              '&:hover': { bgcolor: colors.accentLight, borderColor: colors.accent },
            }}
          />
        ))}
      </Box>

      {/* SECTION 1: AI SUGGESTED RECIPES */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '24px',
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
          mb: 5,
        }}
      >
        {/* Header & Filter Controls */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                bgcolor: colors.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.accent,
              }}
            >
              <AutoAwesomeIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: colors.text }}>
                AI Suggested Recipes
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                Ranked by ingredients already in your fridge & pantry ({inventoryItems.length} items available)
              </Typography>
            </Box>
          </Box>

          {/* Filters */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Course</InputLabel>
              <Select
                value={aiCourse || 'All Courses'}
                label="Course"
                onChange={e => setAiCourse(e.target.value === 'All Courses' ? '' : e.target.value)}
              >
                {COURSE_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Diet</InputLabel>
              <Select
                value={aiDiet || 'All Diets'}
                label="Diet"
                onChange={e => setAiDiet(e.target.value === 'All Diets' ? '' : e.target.value)}
              >
                {DIET_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* AI Suggested Cards Grid */}
        {suggestLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={44} sx={{ color: colors.accent, mb: 2 }} />
            <Typography variant="body1" sx={{ color: colors.text, fontWeight: 600 }}>
              AI Chef is analyzing your kitchen stock...
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 0.5 }}>
              Matching delicious meals to your available ingredients
            </Typography>
          </Box>
        ) : suggestedRecipes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              No AI suggested recipes found for your current inventory and filter criteria.
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.5 }}>
              Try selecting "All Courses" / "All Diets" or add more items to your kitchen inventory.
            </Typography>
          </Box>
        ) : (
          <Box className="uniform-recipe-grid">
            {suggestedRecipes.map((r, i) => {
              if (!r) return null;
              let ingredientsArr = [];
              if (typeof r.ingredients === 'string') {
                ingredientsArr = r.ingredients.split('|').map(x => x.trim().toLowerCase()).filter(Boolean);
              } else if (Array.isArray(r.ingredients)) {
                ingredientsArr = r.ingredients.map(x => (x?.name || String(x)).trim().toLowerCase()).filter(Boolean);
              }

              let matched = Array.isArray(r.matched_ingredients) ? r.matched_ingredients : [];
              let missing = Array.isArray(r.missing_ingredients) ? r.missing_ingredients : [];
              if (!matched.length && !missing.length && ingredientsArr.length > 0 && invNames.length > 0) {
                matched = ingredientsArr.filter(ing => invNames.includes(ing));
                missing = ingredientsArr.filter(ing => !invNames.includes(ing));
              }

              const totalIngs = Math.max(ingredientsArr.length, matched.length + missing.length, 1);
              const matchPercentage = Math.min(Math.round((matched.length / totalIngs) * 100), 100);
              const title = r.recipe_title || r.name;
              const isSaved = savedRecipeTitles.has(title);

              return (
                <Card
                  key={i}
                  className="interactive-card glow-card-hover"
                  elevation={0}
                  sx={{
                    width: '100%',
                    height: 480,
                    minHeight: 480,
                    maxHeight: 480,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '24px',
                    bgcolor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    overflow: 'hidden',
                    boxShadow: colors.cardShadow,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Recipe Image Banner: exactly 180px */}
                  <Box sx={{ position: 'relative', height: 180, width: '100%', bgcolor: colors.hover, overflow: 'hidden' }}>
                    {r.recipe_image ? (
                      <img
                        src={r.recipe_image}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                        🍲
                      </Box>
                    )}

                    {/* Match Badge Overlay */}
                    <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
                      <Chip
                        label={`${matchPercentage}% Ready`}
                        size="small"
                        sx={{
                          bgcolor: matchPercentage >= 70 ? colors.success : matchPercentage >= 40 ? colors.warning : colors.accent,
                          color: '#fff',
                          fontWeight: 800,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      />
                    </Box>

                    {r.prep_time && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          px: 1,
                          py: 0.4,
                          borderRadius: '6px',
                          bgcolor: 'rgba(0,0,0,0.65)',
                          backdropFilter: 'blur(8px)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          zIndex: 1,
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 13 }} />
                        {r.prep_time}
                      </Box>
                    )}
                  </Box>

                  {/* Card Content: exactly 300px (180 + 300 = 480) */}
                  <CardContent sx={{ p: 2.5, height: 300, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Course / Diet Chips: exactly 28px high */}
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', height: 28, overflow: 'hidden' }}>
                      {r.course && (
                        <Chip label={r.course} size="small" sx={{ bgcolor: colors.primaryLight, color: colors.primary, fontWeight: 700, height: 24, fontSize: '0.72rem' }} />
                      )}
                      {r.diet && (
                        <Chip label={r.diet} size="small" sx={{ bgcolor: colors.secondaryLight, color: colors.secondary, fontWeight: 700, height: 24, fontSize: '0.72rem' }} />
                      )}
                      {!r.course && !r.diet && (
                        <Chip label="Chef's Pick" size="small" sx={{ bgcolor: colors.hover, color: colors.textSecondary, fontWeight: 600, height: 24, fontSize: '0.72rem' }} />
                      )}
                    </Box>

                    {/* Recipe Title: exactly 52px high, 2-line clamp */}
                    <Box sx={{ height: 52, display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="h6"
                        className="line-clamp-2"
                        title={title}
                        onClick={() => setSelectedDetailRecipe(r)}
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          lineHeight: 1.3,
                          color: colors.text,
                          cursor: 'pointer',
                          '&:hover': { color: colors.primary },
                        }}
                      >
                        {title}
                      </Typography>
                    </Box>

                    {/* Match Progress Bar: exactly 50px high */}
                    <Box sx={{ height: 50, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: colors.textSecondary }}>
                          Ingredients: {matched.length} of {totalIngs} available
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: matchPercentage >= 70 ? colors.success : colors.warning }}>
                          {matchPercentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={matchPercentage}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          bgcolor: colors.hover,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: matchPercentage >= 70 ? colors.success : matchPercentage >= 40 ? colors.warning : colors.accent,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    {/* Action Buttons: exactly 44px high */}
                    <Box sx={{ pt: 1.5, borderTop: `1px solid ${colors.divider}`, display: 'flex', gap: 1.2, height: 44, alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => setSelectedDetailRecipe(r)}
                        sx={{ borderRadius: '10px', color: colors.text, borderColor: colors.border, fontWeight: 700 }}
                      >
                        View Steps
                      </Button>
                      <Button
                        variant={isSaved ? 'outlined' : 'contained'}
                        size="small"
                        fullWidth
                        disabled={isSaved}
                        startIcon={isSaved ? <BookmarkAddedIcon /> : <BookmarkAddOutlinedIcon />}
                        onClick={() => handleSaveToMyRecipes(r)}
                        sx={{
                          borderRadius: '10px',
                          background: isSaved ? 'transparent' : colors.gradientPrimary,
                          fontWeight: 700,
                        }}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* SECTION 2: MY SAVED RECIPES */}
      <Box sx={{ mb: 5 }}>
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
              <RestaurantMenuIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: colors.text }}>
                My Saved Recipes ({recipes.length})
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                Your personal cookbook and favorite kitchen creations
              </Typography>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={36} sx={{ color: colors.primary, mb: 1 }} />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Loading recipes...</Typography>
          </Box>
        ) : recipes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: '20px',
              bgcolor: colors.cardBg,
              border: `1px dashed ${colors.border}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
              No recipes saved yet
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2.5 }}>
              Save AI suggested recipes above or click "Create Recipe" to add your custom family recipes.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ background: colors.gradientPrimary, borderRadius: '10px', fontWeight: 600 }}
            >
              Create First Recipe
            </Button>
          </Paper>
        ) : (
          <Box className="uniform-recipe-grid">
            {recipes.map(recipe => {
              if (!recipe) return null;
              let ingredientsArr = [];
              if (typeof recipe.ingredients === 'string') {
                ingredientsArr = recipe.ingredients.split('|').map(x => x.trim().toLowerCase()).filter(Boolean);
              } else if (Array.isArray(recipe.ingredients)) {
                ingredientsArr = recipe.ingredients.map(x => (x?.name || String(x)).trim().toLowerCase()).filter(Boolean);
              } else if (Array.isArray(recipe.items)) {
                ingredientsArr = recipe.items.map(x => (x?.name || String(x)).trim().toLowerCase()).filter(Boolean);
              }

              const matched = ingredientsArr.filter(ing => invNames.includes(ing));
              const missing = ingredientsArr.filter(ing => !invNames.includes(ing));

              return (
                <Card
                  key={recipe.id || recipe.name}
                  className="interactive-card glow-card-hover"
                  elevation={0}
                  sx={{
                    width: '100%',
                    height: 380,
                    minHeight: 380,
                    maxHeight: 380,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '24px',
                    bgcolor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    overflow: 'hidden',
                    boxShadow: colors.cardShadow,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Image Banner: exactly 170px */}
                  <Box sx={{ position: 'relative', height: 170, width: '100%', bgcolor: colors.hover, overflow: 'hidden' }}>
                    {recipe.recipe_image ? (
                      <img
                        src={recipe.recipe_image}
                        alt={recipe.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                        🥗
                      </Box>
                    )}

                    <IconButton
                      size="small"
                      onClick={() => handleDelete(recipe.id, recipe.name)}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        '&:hover': { bgcolor: colors.error },
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Card Content: exactly 210px (170 + 210 = 380) */}
                  <CardContent sx={{ p: 2.5, height: 210, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Title: exactly 52px high, 2-line clamp */}
                    <Box sx={{ height: 52, display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="h6"
                        className="line-clamp-2"
                        title={recipe.name}
                        onClick={() => setSelectedDetailRecipe(recipe.recipe || recipe)}
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          lineHeight: 1.3,
                          color: colors.text,
                          cursor: 'pointer',
                          '&:hover': { color: colors.primary },
                        }}
                      >
                        {recipe.name}
                      </Typography>
                    </Box>

                    {/* Course / Prep time: exactly 28px high */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: 28, overflow: 'hidden' }}>
                      {recipe.course && (
                        <Chip label={recipe.course} size="small" sx={{ bgcolor: colors.hover, color: colors.text, fontSize: '0.75rem', fontWeight: 700, height: 24 }} />
                      )}
                      {recipe.prep_time && (
                        <Chip icon={<AccessTimeIcon sx={{ fontSize: '13px !important' }} />} label={recipe.prep_time} size="small" sx={{ bgcolor: colors.hover, color: colors.text, fontSize: '0.75rem', fontWeight: 600, height: 24 }} />
                      )}
                      {!recipe.course && !recipe.prep_time && (
                        <Chip label="Custom Dish" size="small" sx={{ bgcolor: colors.hover, color: colors.textSecondary, fontSize: '0.75rem', height: 24 }} />
                      )}
                    </Box>

                    {/* Inventory Status Chips: 48px high, pinned to bottom */}
                    <Box sx={{ pt: 1.5, borderTop: `1px solid ${colors.divider}`, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: colors.textSecondary, fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                        STOCK:
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: `${colors.success} !important` }} />}
                          label={`${matched.length} ready`}
                          size="small"
                          sx={{ bgcolor: `${colors.success}18`, color: colors.success, fontWeight: 700, fontSize: '0.75rem' }}
                        />
                        <Chip
                          icon={<HighlightOffIcon sx={{ fontSize: '14px !important', color: `${colors.error} !important` }} />}
                          label={`${missing.length} needed`}
                          size="small"
                          sx={{ bgcolor: `${colors.error}18`, color: colors.error, fontWeight: 700, fontSize: '0.75rem' }}
                        />
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {/* SECTION 3: CUISINE BREAKDOWN CHART */}
      {cuisineData.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            boxShadow: colors.cardShadow,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <BarChartIcon sx={{ color: colors.primary }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text }}>
              Saved Recipes by Cuisine / Category
            </Typography>
          </Box>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cuisineData}>
              <XAxis dataKey="cuisine" stroke={colors.textSecondary} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke={colors.textSecondary} tick={{ fontSize: 12 }} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: colors.paper,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  boxShadow: colors.cardShadow,
                  color: colors.text,
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {cuisineData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Dialogs */}
      <AddRecipeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleAddRecipe}
        inventoryItems={inventoryItems}
      />

      <AIRecipeDetailsDialog
        open={Boolean(selectedDetailRecipe)}
        onClose={() => setSelectedDetailRecipe(null)}
        recipe={selectedDetailRecipe}
        onSave={handleSaveToMyRecipes}
      />
    </Box>
  );
}