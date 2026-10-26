import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Grid, Box, Button, IconButton, Paper, Card,
  CardContent, Chip, Tooltip, Stack, FormControl, InputLabel,
  Select, MenuItem, CircularProgress, Divider, Avatar
  , Snackbar
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HistoryIcon from '@mui/icons-material/History';

import AddMealDialog from './AddMealDialog';
import IngredientUsageDialog from './IngredientUsageDialog';
import CompleteMealDialog from './CompleteMealDialog';
import AIRecipeDetailsDialog from './AIRecipeDetailsDialog';
import { getMealPlans, getMealHistory, addMealPlan, deleteMealPlan, getRecipes, fetchWeeklyMealPlans, getMealSuggestions, getInventory } from './api';
import { auth } from './firebase';
import { useTheme } from './ThemeContext';
import { fireConfetti } from './utils/confetti';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealSlots = [
  { name: 'Breakfast', icon: '🍳', defaultTime: '8:00 AM' },
  { name: 'Lunch', icon: '🥗', defaultTime: '12:30 PM' },
  { name: 'Dinner', icon: '🍲', defaultTime: '7:30 PM' },
];

const DIET_OPTIONS = [
  'All Diets', 'Vegetarian', 'High Protein Vegetarian', 'Non Vegeterian',
  'No Onion No Garlic (Sattvic)', 'High Protein Non Vegetarian', 'Diabetic Friendly',
  'Eggetarian', 'Vegan', 'Gluten Free', 'Sugar Free Diet'
];

let mealPlansCache = null;
const MEAL_PLANS_LS_KEY = 'mealPlansCache';
const AI_SUGGEST_LS_KEY = 'aiMealSuggestCache';

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MealPlansPage() {
  const { colors, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [plans, setPlans] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [mealHistory, setMealHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDay, setDialogDay] = useState('');
  const [dialogMealType, setDialogMealType] = useState('');
  const [dialogDate, setDialogDate] = useState(null);
  const [completeDialog, setCompleteDialog] = useState({ open: false, plan: null });
  const [ingredientDialog, setIngredientDialog] = useState({ open: false, plan: null, ingredients: [] });
  const [selectedAISuggestion, setSelectedAISuggestion] = useState(null);
  const [completedMeals, setCompletedMeals] = useState({});
  const [selectedDiet, setSelectedDiet] = useState(() => localStorage.getItem('mealPlanDiet') || '');
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const [notice, setNotice] = useState(null);

  const firstLoad = useRef(true);
  const aiSuggestCacheRef = useRef({});

  // Current week start (Monday)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  useEffect(() => {
    localStorage.setItem('mealPlanDiet', selectedDiet);
  }, [selectedDiet]);

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchMealHistory();
      fetchRecipes();
      fetchInventory();
    }
  }, [user, currentWeekStart]);

  useEffect(() => {
    const ls = localStorage.getItem(AI_SUGGEST_LS_KEY);
    if (ls) {
      try {
        aiSuggestCacheRef.current = JSON.parse(ls);
      } catch {}
    }
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await getRecipes();
      setRecipes(res.data || []);
    } catch (e) {
      setRecipes([]);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await getInventory();
      setInventoryItems(res.data || []);
    } catch (e) {
      setInventoryItems([]);
    }
  };

  const fetchMealHistory = async () => {
    try {
      const res = await getMealHistory();
      setMealHistory(res.data || []);
    } catch (e) {
      console.error('Failed to load meal history', e);
      setMealHistory([]);
    }
  };

  const fetchPlans = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const week = {};
    daysOfWeek.forEach(day => {
      week[day] = { Breakfast: null, Lunch: null, Dinner: null };
    });

    try {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
      currentWeekEnd.setHours(23, 59, 59, 999);

      const res = await fetchWeeklyMealPlans(currentWeekStart.toISOString(), currentWeekEnd.toISOString());
      (res.data || []).forEach(plan => {
        const dateKey = String(plan.date).split('T')[0];
        const [year, month, day] = dateKey.split('-').map(Number);
        const planDate = new Date(year, month - 1, day);
        const dayName = daysOfWeek[planDate.getDay() === 0 ? 6 : planDate.getDay() - 1];
        if (week[dayName] && plan.mealType) {
          week[dayName][plan.mealType] = plan;
        }
      });
    } catch (e) {
      console.error('Failed to load meal plans', e);
    } finally {
      setPlans(week);
      mealPlansCache = week;
      if (showLoading) setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    setAiLoading(true);
    const inventory = inventoryItems.map(item => item.name).filter(Boolean);
    const aiCacheKey = JSON.stringify({ diet: selectedDiet, inventory });
    if (aiSuggestCacheRef.current[aiCacheKey]) {
      setSuggestions(aiSuggestCacheRef.current[aiCacheKey]);
      setAiLoading(false);
      return;
    }
    try {
      const data = await getMealSuggestions(inventory, selectedDiet);
      setSuggestions(data || []);
      aiSuggestCacheRef.current[aiCacheKey] = data;
      localStorage.setItem(AI_SUGGEST_LS_KEY, JSON.stringify(aiSuggestCacheRef.current));
    } catch (e) {
      setSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddMeal = (day, mealType, date) => {
    if (formatLocalDate(date) < formatLocalDate(new Date())) {
      setNotice({ severity: 'warning', message: 'You cannot add a meal for a past date.' });
      return;
    }
    setDialogDay(day);
    setDialogMealType(mealType);
    setDialogDate(date);
    setDialogOpen(true);
  };

  const handleSaveMeal = async (data) => {
    let name = '';
    let recipeId = null;
    let recipePayload = null;

    if (data.type === 'my') {
      const recipe = recipes.find(r => r.id === data.recipeId);
      if (recipe) {
        name = recipe.name;
        recipeId = recipe.id;
        recipePayload = recipe;
      }
    } else if (data.type === 'ai') {
      const aiSuggestion = Array.isArray(suggestions)
        ? suggestions.find(r => (r.id || r.recipe_id) == data.recipeId)
        : null;
      if (aiSuggestion) {
        name = aiSuggestion.recipe_title || aiSuggestion.name || '';
        recipePayload = aiSuggestion;
      }
    } else if (data.type === 'custom') {
      name = data.name;
    }

    if (!name) return;

    const ingredients = String(recipePayload?.ingredients || recipePayload?.ingredient_list || '')
      .split('|').map(item => item.trim()).filter(Boolean);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usableInventoryNames = new Set(inventoryItems.filter(item => {
      if (!item.expiryDate) return true;
      const expiryDate = new Date(`${String(item.expiryDate).split('T')[0]}T00:00:00`);
      return isNaN(expiryDate.getTime()) || expiryDate >= today;
    }).map(item => String(item.name || '').trim().toLowerCase()));
    const missingIngredients = ingredients.filter(item => !usableInventoryNames.has(item.toLowerCase()));

    const payload = {
      day: dialogDay,
      mealType: dialogMealType,
      name,
      date: dialogDate ? formatLocalDate(dialogDate) : formatLocalDate(new Date()),
      recipe: recipePayload,
    };
    if (recipeId) payload.recipeId = recipeId;

    try {
      await addMealPlan(payload);
      setDialogOpen(false);
      if (missingIngredients.length > 0) {
        setNotice({ severity: 'warning', message: `Add these missing ingredients to your inventory: ${missingIngredients.join(', ')}` });
      }
      await fetchPlans(false);
    } catch (err) {
      console.error('Failed to add meal plan:', err);
      setNotice({ severity: 'error', message: err.response?.data?.error || 'Failed to add meal plan.' });
    }
  };

  const handleDeleteMeal = async (planId) => {
    setDeletingPlanId(planId);
    await deleteMealPlan(planId);
    await fetchPlans(false);
    setDeletingPlanId(null);
  };

  const getMissingIngredients = (plan) => {
    const recipe = plan.recipe || (plan.recipeId && recipes.find(item => item.id === plan.recipeId));
    const rawIngredients = recipe?.ingredients || recipe?.ingredient_list || recipe?.items;
    const ingredients = Array.isArray(rawIngredients)
      ? rawIngredients.map(item => item?.name || item).filter(Boolean)
      : String(rawIngredients || '').split('|').map(item => item.trim()).filter(Boolean);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usableNames = new Set(inventoryItems.filter(item => {
      if (!item.expiryDate) return true;
      const expiry = new Date(`${String(item.expiryDate).split('T')[0]}T00:00:00`);
      return isNaN(expiry.getTime()) || expiry >= today;
    }).map(item => String(item.name || '').trim().toLowerCase()));
    return ingredients.filter(item => !usableNames.has(String(item).toLowerCase()));
  };

  const addMissingToShoppingList = (plan) => {
    const missing = getMissingIngredients(plan);
    if (!missing.length) {
      setNotice({ severity: 'info', message: 'All ingredients are already available in your inventory.' });
      return;
    }
    localStorage.setItem('pendingShoppingItems', JSON.stringify(missing.map(name => ({
      name, quantity: 1, unit: 'pcs', category: 'pantry'
    }))));
    navigate('/shopping-lists');
  };

  function isMealPast(mealDate, slot) {
    if (!mealDate) return false;
    const now = new Date();
    const dateKey = typeof mealDate === 'string'
      ? mealDate.split('T')[0]
      : formatLocalDate(mealDate);
    const [year, month, day] = dateKey.split('-').map(Number);
    const mealDateTime = new Date(year, month - 1, day);
    mealDateTime.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (mealDateTime < today) return true;

    if (mealDateTime.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      if (slot === 'Breakfast' && currentHour >= 11) return true;
      if (slot === 'Lunch' && currentHour >= 15) return true;
      if (slot === 'Dinner' && currentHour >= 22) return true;
    }
    return false;
  }

  const handleMadeMeal = (plan) => {
    let ingredients = [];
    if (plan.recipeId) {
      const recipe = recipes.find(r => r.id === plan.recipeId);
      if (recipe && recipe.items) ingredients = recipe.items.map(i => i.name);
    } else if (plan.recipe?.ingredients || plan.recipe?.ingredient_list) {
      const ingredientStr = plan.recipe.ingredients || plan.recipe.ingredient_list;
      ingredients = ingredientStr.split('|').map(i => i.trim()).filter(Boolean);
    } else if (plan.name) {
      const ai = suggestions.find(r => (r.name === plan.name || r.recipe_title === plan.name));
      if (ai && (ai.ingredients || ai.ingredient_list)) {
        const ingredientStr = ai.ingredients || ai.ingredient_list;
        ingredients = ingredientStr.split('|').map(i => i.trim()).filter(Boolean);
      }
    }
    setIngredientDialog({ open: true, plan, ingredients });
    setCompleteDialog({ open: false, plan: null });
  };

  const handleNotMadeMeal = async (plan) => {
    try {
      await (await import('./api')).updateMealPlan(plan.id, { status: 'not-made' });
      setCompleteDialog({ open: false, plan: null });
      setNotice({ severity: 'info', message: `Marked "${plan.name}" as not made. Inventory was not changed.` });
      await fetchPlans(false);
    } catch (e) {
      console.error('Failed to mark meal as not made:', e);
      setNotice({ severity: 'error', message: e.response?.data?.error || 'Could not update the meal status.' });
    }
  };

  const handleConfirmIngredients = async (rows) => {
    try {
      const api = await import('./api');
      await api.useIngredients({ ingredients: rows || [], planId: ingredientDialog.plan?.id });
      await fetchPlans(false);
      await fetchMealHistory();
      setCompletedMeals(cm => ({ ...cm, [ingredientDialog.plan?.id]: true }));
      fireConfetti({ count: 60, origin: { x: 0.5, y: 0.5 } });
    } catch (e) {
      console.error('Failed to update inventory:', e);
      setNotice({ severity: 'error', message: e.response?.data?.error || 'Some ingredients are missing or expired.' });
    }
    setIngredientDialog({ open: false, plan: null, ingredients: [] });
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const endOfWeek = new Date(currentWeekStart);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  const weekRangeText = `${currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const todayDateString = formatLocalDate(new Date());

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text, letterSpacing: '-0.02em' }}>
            Weekly Meal Planner
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Organize daily nutrition, schedule family meals, and streamline kitchen workflow
          </Typography>
        </Box>

        {/* Week Date Navigation Controls */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 0.8,
            borderRadius: '14px',
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <IconButton size="small" onClick={goToPreviousWeek} sx={{ color: colors.text }}>
            <ChevronLeftIcon />
          </IconButton>
          <Button
            size="small"
            onClick={goToCurrentWeek}
            sx={{ fontWeight: 700, color: colors.text, px: 1.5 }}
          >
            {weekRangeText}
          </Button>
          <IconButton size="small" onClick={goToNextWeek} sx={{ color: colors.text }}>
            <ChevronRightIcon />
          </IconButton>
        </Paper>
      </Box>

      {/* Main Grid: Weekly Schedule on Left (8-9 cols), AI Sidebar on Right (3-4 cols) */}
      <Grid container spacing={3.5}>
        {/* Left Column: 7-Day Interactive Planner */}
        <Grid item xs={12} lg={8.5}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CircularProgress size={40} sx={{ color: colors.primary, mb: 2 }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>Loading meal schedules...</Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {daysOfWeek.map((day, index) => {
                const dayDate = new Date(currentWeekStart);
                dayDate.setDate(currentWeekStart.getDate() + index);
                const dayDateStr = formatLocalDate(dayDate);
                const isToday = dayDateStr === todayDateString;

                return (
                  <Paper
                    key={day}
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: '20px',
                      bgcolor: colors.cardBg,
                      border: isToday ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                      boxShadow: isToday ? `0 0 20px ${colors.primary}22` : colors.cardShadow,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Day Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text }}>
                          {day}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                          {dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Typography>
                        {isToday && (
                          <Chip
                            label="TODAY"
                            size="small"
                            sx={{
                              bgcolor: colors.primary,
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Meal Slots Grid: Breakfast, Lunch, Dinner */}
                    <Grid container spacing={2}>
                      {mealSlots.map(slot => {
                        const plan = plans[day]?.[slot.name];
                        const isPast = plan && isMealPast(plan.date, slot.name);
                        const isDatePast = dayDateStr < todayDateString;
                        const isCompleted = plan && completedMeals[plan.id];
                        const missingCount = plan ? getMissingIngredients(plan).length : 0;

                        return (
                          <Grid item xs={12} sm={4} key={slot.name} sx={{ display: 'flex' }}>
                            <Card
                              className="glow-card-hover"
                              elevation={0}
                              sx={{
                                width: '100%',
                                height: '100%',
                                minHeight: 180,
                                p: 2.2,
                                borderRadius: '18px',
                                bgcolor: plan ? colors.paper : colors.cardBg,
                                border: `1px solid ${plan ? colors.primary + '44' : colors.border}`,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                boxShadow: colors.cardShadow,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: colors.primary,
                                },
                              }}
                            >
                              {/* Slot Tag & Icon Header */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 28, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <Typography sx={{ fontSize: 16 }}>{slot.icon}</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: colors.textSecondary, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                                    {slot.name}
                                  </Typography>
                                </Box>
                                {plan && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteMeal(plan.id)}
                                    disabled={deletingPlanId === plan.id}
                                    sx={{
                                      p: 0.4,
                                      color: colors.textSecondary,
                                      '&:hover': { color: colors.error, bgcolor: `${colors.error}15` },
                                    }}
                                  >
                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                )}
                              </Box>

                              {/* Planned Meal or Empty State Body */}
                              {plan ? (
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', my: 0.5 }}>
                                  <Box>
                                    <Typography
                                      variant="subtitle2"
                                      className="line-clamp-2"
                                      title={plan.name}
                                      sx={{
                                        fontWeight: 800,
                                        color: colors.text,
                                        lineHeight: 1.3,
                                        fontSize: '0.95rem',
                                        minHeight: 38,
                                        mb: 0.5,
                                      }}
                                    >
                                      {plan.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <AccessTimeIcon sx={{ fontSize: 13 }} />
                                      {plan.time || slot.defaultTime}
                                    </Typography>
                                  </Box>

                                  {/* Bottom status / actions inside planned slot */}
                                  <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${colors.divider}` }}>
                                    {missingCount > 0 && (
                                      <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => addMissingToShoppingList(plan)}
                                        sx={{
                                          p: 0,
                                          mb: 0.5,
                                          color: colors.warning,
                                          fontWeight: 700,
                                          fontSize: '0.7rem',
                                          textAlign: 'left',
                                          justifyContent: 'flex-start',
                                          width: '100%',
                                        }}
                                      >
                                        🛒 Add {missingCount} missing items
                                      </Button>
                                    )}

                                    {plan.status === 'not-made' ? (
                                      <Typography variant="caption" sx={{ color: colors.warning, fontWeight: 700, display: 'block' }}>
                                        Not made (Inventory untouched)
                                      </Typography>
                                    ) : isPast && !isCompleted ? (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => setCompleteDialog({ open: true, plan })}
                                        sx={{
                                          py: 0.4,
                                          fontSize: '0.72rem',
                                          borderRadius: '8px',
                                          color: colors.primary,
                                          borderColor: colors.primary,
                                          fontWeight: 700,
                                        }}
                                      >
                                        Mark as Made?
                                      </Button>
                                    ) : isCompleted ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: colors.success }}>
                                        <CheckCircleIcon sx={{ fontSize: 15 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                          Done & Deducted
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 700 }}>
                                        Scheduled
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              ) : (
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', my: 0.5 }}>
                                  <Box sx={{ my: 'auto', textAlign: 'center', py: 1 }}>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic', fontSize: '0.8rem' }}>
                                      No meal planned
                                    </Typography>
                                  </Box>

                                  <Box sx={{ mt: 'auto', pt: 1, borderTop: `1px solid ${colors.divider}` }}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      fullWidth
                                      startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                                      onClick={() => handleAddMeal(day, slot.name, dayDate)}
                                      disabled={isDatePast}
                                      sx={{
                                        py: 0.5,
                                        borderRadius: '8px',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        borderColor: colors.border,
                                        color: isDatePast ? colors.textSecondary : colors.text,
                                        '&:hover': { borderColor: colors.primary, color: colors.primary, bgcolor: colors.primaryLight },
                                      }}
                                    >
                                      {isDatePast ? 'Date Passed' : `Plan ${slot.name}`}
                                    </Button>
                                  </Box>
                                </Box>
                              )}
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Grid>

        {/* Right Column: AI Meal Suggestions Sidebar */}
        <Grid item xs={12} lg={3.5}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
                  AI Meal Ideas
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Smart weekly recommendations
                </Typography>
              </Box>
            </Box>

            {/* Diet Filter & Generator */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Diet Preference</InputLabel>
                <Select
                  value={selectedDiet || 'All Diets'}
                  label="Diet Preference"
                  onChange={e => setSelectedDiet(e.target.value === 'All Diets' ? '' : e.target.value)}
                >
                  {DIET_OPTIONS.map(d => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<AutoAwesomeIcon />}
                onClick={fetchSuggestions}
                disabled={aiLoading}
                sx={{
                  background: colors.gradientAccent,
                  borderRadius: '10px',
                  fontWeight: 700,
                  py: 1,
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                }}
              >
                {aiLoading ? 'Thinking...' : 'AI Generate Menu'}
              </Button>
            </Stack>

            {/* Suggestions Cards List */}
            {aiLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={30} sx={{ color: colors.accent, mb: 1 }} />
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Crafting meal plan...</Typography>
              </Box>
            ) : suggestions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3, bgcolor: colors.hover, borderRadius: '14px', border: `1px dashed ${colors.border}` }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                  Click "AI Generate Menu" to get suggested meals based on your inventory.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5} sx={{ maxHeight: 480, overflowY: 'auto', pr: 0.5 }}>
                {suggestions.slice(0, 6).map((item, idx) => {
                  const title = item.recipe_title || item.name;
                  if (!title) return null;

                  return (
                    <Paper
                      key={idx}
                      elevation={0}
                      onClick={() => setSelectedAISuggestion(item)}
                      sx={{
                        p: 1.5,
                        borderRadius: '14px',
                        bgcolor: colors.hover,
                        border: `1px solid ${colors.divider}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: colors.primaryLight,
                          borderColor: colors.primary,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.text }}>
                          {title}
                        </Typography>
                        {item.course && (
                          <Chip label={item.course} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: colors.cardBg }} />
                        )}
                      </Box>
                      {item.ingredients_available !== undefined && item.ingredients_total !== undefined && (
                        <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 700 }}>
                          ✨ {item.ingredients_available} / {item.ingredients_total} ingredients ready
                        </Typography>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Completed meal history */}
      <Paper
        elevation={0}
        sx={{
          mt: 3.5,
          p: { xs: 2, sm: 3 },
          borderRadius: '20px',
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
          boxShadow: colors.cardShadow,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <HistoryIcon sx={{ color: colors.primary }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text }}>
                Recently eaten
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                Your completed meals and recipes
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${mealHistory.length} recorded`}
            size="small"
            sx={{ color: colors.primary, bgcolor: colors.primaryLight, fontWeight: 700 }}
          />
        </Box>

        {mealHistory.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', bgcolor: colors.hover, borderRadius: '14px', border: `1px dashed ${colors.border}` }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Meals you mark as made will appear here for future diet summaries.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {mealHistory.map((meal) => {
              const completedDate = meal.completedAt ? new Date(meal.completedAt) : new Date(meal.date);
              return (
                <Box
                  key={meal.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    px: 1.5,
                    py: 1.2,
                    borderRadius: '12px',
                    bgcolor: colors.hover,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {meal.name || 'Unnamed meal'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      {[meal.mealType, meal.date && new Date(`${String(meal.date).split('T')[0]}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })].filter(Boolean).join(' · ')}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: colors.success, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Eaten {completedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      {/* Dialogs */}
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={6000}
        onClose={() => setNotice(null)}
        message={notice?.message}
      />
      <AddMealDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveMeal}
        recipes={recipes}
        aiSuggestions={suggestions.map((s, i) => ({ id: s.id || s.recipe_id || i, name: s.recipe_title || s.name, ...s }))}
        dayName={dialogDay}
        mealType={dialogMealType}
      />

      <CompleteMealDialog
        open={completeDialog.open}
        onClose={() => setCompleteDialog({ open: false, plan: null })}
        onConfirm={handleMadeMeal}
        onNotMade={handleNotMadeMeal}
        plan={completeDialog.plan}
      />

      <IngredientUsageDialog
        open={ingredientDialog.open}
        onClose={() => setIngredientDialog({ open: false, plan: null, ingredients: [] })}
        ingredients={ingredientDialog.ingredients}
        onConfirm={handleConfirmIngredients}
      />

      <AIRecipeDetailsDialog
        open={Boolean(selectedAISuggestion)}
        onClose={() => setSelectedAISuggestion(null)}
        recipe={selectedAISuggestion}
      />
    </Box>
  );
}