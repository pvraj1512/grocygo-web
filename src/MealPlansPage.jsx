import React, { useEffect, useState, useRef } from 'react';
import { getMealPlans, addMealPlan, deleteMealPlan, getRecipes, fetchWeeklyMealPlans, getMealSuggestions } from './api';
import AddMealDialog from './AddMealDialog';
import IngredientUsageDialog from './IngredientUsageDialog';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useTheme } from './ThemeContext'; // <-- Add this line

import CompleteMealDialog from './CompleteMealDialog';




const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];
const mealSlots = ['Breakfast', 'Lunch', 'Dinner'];

// Module-level cache for meal plans (persists while app is loaded)
let mealPlansCache = null;
const MEAL_PLANS_LS_KEY = 'mealPlansCache';
const AI_SUGGEST_LS_KEY = 'aiMealSuggestCache';


export default function MealPlansPage() {
  // State declarations must come first!
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [selectedAISuggestion, setSelectedAISuggestion] = useState(null);
  const [plans, setPlans] = useState({});
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDay, setDialogDay] = useState('');
  const [dialogMealType, setDialogMealType] = useState('');
  const [dialogDate, setDialogDate] = useState(null); // New state for date in dialog
  const [completeDialog, setCompleteDialog] = useState({ open: false, plan: null });
  const [ingredientDialog, setIngredientDialog] = useState({ open: false, plan: null, ingredients: [] });
  const [completedMeals, setCompletedMeals] = useState({}); // { planId: true }
  // Persist selectedDiet in localStorage, restore on mount
  const [selectedDiet, setSelectedDiet] = useState(() => localStorage.getItem('mealPlanDiet') || '');
  const [deletingPlanId, setDeletingPlanId] = useState(null);

  const [loading, setLoading] = useState(false);
  const firstLoad = useRef(true);
  // In-memory cache for AI meal suggestions (per session)
  const aiSuggestCacheRef = useRef({});
  // Persist selectedDiet to localStorage when changed
  useEffect(() => {
    localStorage.setItem('mealPlanDiet', selectedDiet);
  }, [selectedDiet]);

  // State for weekly view
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday of the current week
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0); // Set to start of the day
    return monday;
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  // On user login, restore meal plans and recipes, but do not fetch AI suggestions yet
  useEffect(() => {
    if (user && firstLoad.current) {
      fetchPlans(); // Always fetch from API for weekly view
      fetchRecipes();
      firstLoad.current = false;
    }
    // eslint-disable-next-line
  }, [user, currentWeekStart]); // Re-fetch when week changes

  // On mount, restore AI suggestions cache from localStorage (only once)
  useEffect(() => {
    const ls = localStorage.getItem(AI_SUGGEST_LS_KEY);
    if (ls) {
      try {
        aiSuggestCacheRef.current = JSON.parse(ls);
      } catch {}
    }
    // No suggestions update here!
    // eslint-disable-next-line
  }, []);

  // When user/recipes/diet changes, show cached suggestions if available
  useEffect(() => {
    if (user && recipes.length > 0) {
      const inventory = recipes.flatMap(r => r.items?.map(i => i.name) || []);
      const aiCacheKey = JSON.stringify({ diet: selectedDiet, inventory });
      if (aiSuggestCacheRef.current[aiCacheKey]) {
        setSuggestions(aiSuggestCacheRef.current[aiCacheKey]);
      }
      // Do not clear suggestions if not found; just leave as is
    }
    // eslint-disable-next-line
  }, [user, recipes, selectedDiet]);

  // Only fetch AI suggestions when user clicks "AI Generate"
  const fetchSuggestions = async () => {
    const inventory = recipes.flatMap(r => r.items?.map(i => i.name) || []);
    const aiCacheKey = JSON.stringify({ diet: selectedDiet, inventory });
    if (aiSuggestCacheRef.current[aiCacheKey]) {
      setSuggestions(aiSuggestCacheRef.current[aiCacheKey]);
      return;
    }
    const data = await getMealSuggestions(inventory, selectedDiet);
    setSuggestions(data);
    aiSuggestCacheRef.current[aiCacheKey] = data;
    // Save to localStorage
    try {
      localStorage.setItem(AI_SUGGEST_LS_KEY, JSON.stringify(aiSuggestCacheRef.current));
    } catch {}
  };

  const fetchRecipes = async () => {
    const res = await getRecipes();
    setRecipes(res.data);
  };

  const fetchPlans = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6); // End of the week (Sunday)
      currentWeekEnd.setHours(23, 59, 59, 999); // Set to end of the day

      const res = await fetchWeeklyMealPlans(currentWeekStart.toISOString(), currentWeekEnd.toISOString());
      // Transform to { Monday: { Breakfast: {...}, ... }, ... }
      const week = {};
      daysOfWeek.forEach(day => {
        week[day] = { Breakfast: null, Lunch: null, Dinner: null };
      });

      res.data.forEach(plan => {
        const planDate = new Date(plan.date); // Ensure it's a Date object
        const dayName = daysOfWeek[planDate.getDay() === 0 ? 6 : planDate.getDay() - 1]; // Adjust for Monday start
        if (week[dayName] && plan.mealType) {
          week[dayName][plan.mealType] = plan;
        }
      });
      setPlans(week);
      mealPlansCache = week; // Update cache
      // Save to localStorage
      try {
        localStorage.setItem(MEAL_PLANS_LS_KEY, JSON.stringify(week));
      } catch {}
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleAddMeal = (day, mealType, date) => {
    setDialogDay(day);
    setDialogMealType(mealType);
    setDialogDate(date); // Set the date for the dialog
    setDialogOpen(true);
  };

  const handleSaveMeal = async (data) => {
    let name = '';
    let recipeId = null;
    let recipePayload = null; // To hold the recipe object

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
        // AI suggestions might not have a stable 'id', so we pass the whole object
        recipePayload = aiSuggestion;
      }
    } else if (data.type === 'custom') {
      name = data.name;
    }

    if (!name) return;

    const payload = {
      day: dialogDay,
      mealType: dialogMealType,
      name,
      date: dialogDate.toISOString().split('T')[0],
      recipe: recipePayload, // Add the recipe object to the payload
    };
    if (recipeId) {
      payload.recipeId = recipeId;
    }

    await addMealPlan(payload);
    setDialogOpen(false);
    fetchPlans();
  };

  const handleDeleteMeal = async (planId) => {
    setDeletingPlanId(planId);
    await deleteMealPlan(planId);
    await fetchPlans(false); // Don't show global loading spinner
    setDeletingPlanId(null);
  };

  // Helper: check if meal is in the past (older than now)
  function isMealPast(mealDate, slot) {
    const now = new Date();
    const mealDateTime = new Date(mealDate);
    mealDateTime.setHours(0, 0, 0, 0); // Start with date comparison

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If the meal's date is before today, it's definitely in the past.
    if (mealDateTime < today) {
      return true;
    }

    // If the meal's date is today, check the time slot.
    if (mealDateTime.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      if (slot === 'Breakfast' && currentHour >= 10) return true; // 10 AM
      if (slot === 'Lunch' && currentHour >= 15) return true; // 3 PM
      if (slot === 'Dinner' && currentHour >= 22) return true; // 10 PM
    }

    return false;
  }

  // Open "Did you make this meal?" dialog
  const handleCompleteMeal = (plan) => {
    setCompleteDialog({ open: true, plan });
  };
  
  const handleCloseCompleteMealDialog = () => {
    setCompleteDialog({ open: false, plan: null });
  };

  // After user says "Yes, I made it"
  const handleMadeMeal = (plan) => {
    // Find ingredients for this plan
    let ingredients = [];
    if (plan.recipeId) {
      // User's recipe
      const recipe = recipes.find(r => r.id === plan.recipeId);
      if (recipe && recipe.items) {
        ingredients = recipe.items.map(i => i.name);
      }
    } else if (plan.name) {
      // Try to find in AI suggestions (for AI/CSV recipes)
      const ai = suggestions.find(r => (r.name === plan.name || r.recipe_title === plan.name));
      if (ai && (ai.ingredients || ai.ingredient_list)) {
        const ingredientStr = ai.ingredients || ai.ingredient_list;
        ingredients = ingredientStr.split('|').map(i => i.trim()).filter(Boolean);
      }
    }
    setIngredientDialog({ open: true, plan, ingredients });
    setCompleteDialog({ open: false, plan: null });
  };

  // After user says "No, I didn't make it"
  const handleNotMadeMeal = () => {
    setCompleteDialog({ open: false, plan: null });
  };

  // After ingredient usage confirm
  const handleConfirmIngredients = async (rows) => {
    try {
      if (rows && rows.length > 0) {
        await import('./api').then(api =>
          api.useIngredients({ ingredients: rows, planId: ingredientDialog.plan?.id })
        );
        await fetchPlans(false); // Always refresh plans after ingredient usage
      }
      setCompletedMeals(cm => ({ ...cm, [ingredientDialog.plan?.id]: true }));
    } catch (e) {
      alert('Failed to update inventory: ' + (e.message || e));
    }
    setIngredientDialog({ open: false, plan: null, ingredients: [] });
  };

  const theme = useTheme();

  // Add this function to handle AI suggestion click
  const handleAISuggestionClick = (suggestion) => {
    setSelectedAISuggestion(suggestion);
    setAIDialogOpen(true);
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

  const getWeekRange = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
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

  // Map suggestions by course for easy access
  // Map suggestions by slot using partial match (case-insensitive)
  const suggestionByCourse = {};
  if (Array.isArray(suggestions)) {
    ['breakfast', 'lunch', 'dinner'].forEach(slot => {
      // Find the first suggestion whose course includes the slot word
      suggestionByCourse[slot] = suggestions.find(s =>
        typeof s.course === 'string' && s.course.toLowerCase().includes(slot)
      );
    });
  }

  // --- Responsive layout strategy ---
  // 1. Use a single flex row container for both boxes.
  // 2. On desktop: Weekly Meal Plan (left), AI Meal Suggestions (right).
  // 3. On mobile: Stack vertically, both boxes always visible.
  // 4. No conditional rendering/hiding for either box.
  // 5. Each box uses full width on mobile, fixed width for AI box on desktop.

  return (
    <div className="mealplans-page-root" style={{
      background: theme.colors.background,
      minHeight: '100vh',
    }}>
      <style>{`
        .mealplans-page-root {
          background: none !important;
        }
        .mealplans-layout {
          display: flex;
          flex-direction: row;
          gap: 32px;
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        @media (max-width: 1024px) {
          .mealplans-layout {
            flex-direction: column;
            padding: 16px;
            gap: 16px;
          }
          .mealplans-layout > .mealplans-main,
          .mealplans-layout > .mealplans-responsive-ai {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            display: block !important;
          }
        }
        @media (max-width: 600px) {
          .mealplans-layout {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .mealplans-layout > .mealplans-main,
          .mealplans-layout > .mealplans-responsive-ai {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            display: block !important;
          }
        }
      `}</style>
      <CompleteMealDialog
        open={completeDialog.open}
        onClose={handleCloseCompleteMealDialog}
        onConfirm={handleMadeMeal}
        plan={completeDialog.plan}
      />
      <IngredientUsageDialog
        open={ingredientDialog.open}
        onClose={() => setIngredientDialog({ open: false, plan: null, ingredients: [] })}
        ingredients={ingredientDialog.ingredients}
        onConfirm={handleConfirmIngredients}
      />
      <div className="mealplans-layout">
        {/* Weekly Meal Plan box (left/main) */}
        <div className="mealplans-main"
          style={{
            flex: '1 1 0',
            minWidth: 0,
            maxWidth: '100%',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h1 style={{ color: theme.colors.text }}>Meal Planning</h1>
          <div style={{ color: theme.colors.textSecondary, marginBottom: 24 }}>Plan your meals based on available ingredients</div>
          <div style={{
            background: theme.colors.paper,
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 2px 8px #0001',
            border: `1px solid ${theme.colors.divider}`,
            marginBottom: 0, // Remove marginBottom so AI box stays beside
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, flex: 1, color: theme.colors.text }}>Weekly Meal Plan</h2>
              <button
                style={{
                  background: theme.colors.primary,
                  color: theme.colors.paper,
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginLeft: 12
                }}
                onClick={() => fetchPlans(true)}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Date Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button onClick={goToPreviousWeek} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: theme.colors.text }}>&lt;</button>
              <h3 style={{ margin: 0, color: theme.colors.text }}>{getWeekRange()}</h3>
              <button onClick={goToNextWeek} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: theme.colors.text }}>&gt;</button>
            </div>

            {loading ? (
              <div style={{ color: theme.colors.textSecondary, textAlign: 'center', margin: '48px 0', fontSize: 18 }}>Loading...</div>
            ) : (
              <>
                {daysOfWeek.map((day, index) => {
                  const dayDate = new Date(currentWeekStart);
                  dayDate.setDate(currentWeekStart.getDate() + index);
                  return (
                    <div key={day} style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: theme.colors.text }}>
                        {day} - {dayDate.toLocaleDateString()}
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        {mealSlots.map(slot => {
                          const plan = plans[day]?.[slot];
                          const isPast = plan && isMealPast(plan.date, slot);
                          const isCompleted = plan && completedMeals[plan.id];
                          return (
                            <div key={slot} style={{
                              flex: 1,
                              border: `1px solid ${theme.colors.divider}`,
                              borderRadius: 8,
                              padding: 16,
                              minHeight: 80,
                              background: plan ? theme.colors.cardBg : theme.colors.hover,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              justifyContent: 'center',
                              position: 'relative',
                              color: theme.colors.text
                            }}>
                              <div style={{ fontWeight: 500, color: theme.colors.textSecondary, marginBottom: 4 }}>{slot}</div>
                              {plan ? (
                                <>
                                  <div style={{ fontWeight: 600, color: theme.colors.text }}>{plan.name}</div>
                                  <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>{plan.time || (slot === 'Breakfast' ? '8:00 AM' : slot === 'Lunch' ? '12:30 PM' : '7:00 PM')}</div>
                                  <button
                                    style={{
                                      position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: theme.colors.error, cursor: deletingPlanId === plan.id ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={() => handleDeleteMeal(plan.id)}
                                    disabled={deletingPlanId === plan.id}
                                    title="Delete"
                                  >
                                    {deletingPlanId === plan.id ? (
                                      <span style={{ fontSize: 14 }}>Deleting...</span>
                                    ) : (
                                      '✕'
                                    )}
                                  </button>
                                  {/* Show completed status or "Completed" button if in the past */}
                                  {isPast && !isCompleted && (
                                    <button
                                      style={{
                                        marginTop: 8,
                                        background: theme.colors.primary,
                                        color: theme.colors.paper,
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '4px 12px',
                                        cursor: 'pointer',
                                        fontSize: 14
                                      }}
                                      onClick={() => handleCompleteMeal(plan)}
                                    >Completed?</button>
                                  )}
                                  {isCompleted && (
                                    <div style={{ marginTop: 8, color: theme.colors.primary, fontWeight: 500 }}>✔ Marked as made & inventory updated</div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button
                                    style={{
                                      background: theme.colors.hover,
                                      border: `1px dashed ${theme.colors.divider}`,
                                      borderRadius: 6,
                                      padding: '6px 12px',
                                      color: theme.colors.textSecondary,
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => handleAddMeal(day, slot, dayDate)} // Pass dayDate
                                  >+ Add {slot.toLowerCase()}</button>
                                  <AddMealDialog
                                    open={dialogOpen}
                                    onClose={() => setDialogOpen(false)}
                                    onSave={handleSaveMeal}
                                    recipes={recipes}
                                    aiSuggestions={(() => {
                                      if (!Array.isArray(suggestions)) return [];
                                      // Show all unique AI suggestions for the week (all 3 courses)
                                      const seen = new Set();
                                      const arr = suggestions.filter(s => {
                                        const key = (s.recipe_title || s.name || '') + (s.course || '');
                                        if (seen.has(key)) return false;
                                        seen.add(key);
                                        return true;
                                      });
                                      return arr.map((s, idx) => ({
                                        id: s.id || s.recipe_id || idx, // fallback to idx if no id
                                        name: s.recipe_title || s.name || '',
                                        ...s
                                      }));
                                    })()}
                                  />
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
        {/* AI Meal Suggestions box (right/sidebar) */}
        <div
          className="mealplans-responsive-ai"
          style={{
            flex: '0 0 380px',
            background: theme.colors.paper,
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 2px 8px #0001',
            width: '380px',
            margin: 0,
            overflow: 'hidden',
            position: 'sticky',
            top: 32,
            alignSelf: 'flex-start',
            boxSizing: 'border-box',
            height: 'max-content',
            maxHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
            border: `1px solid ${theme.colors.divider}`,
            color: theme.colors.text
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 16,
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ margin: 0, flex: 1, fontSize: 22, color: theme.colors.text }}>AI Meal Suggestions</h2>
            <select
              value={selectedDiet}
              onChange={e => setSelectedDiet(e.target.value)}
              style={{
                padding: '6px 8px',
                borderRadius: 6,
                border: `1px solid ${theme.colors.divider}`,
                color: theme.colors.text,
                background: theme.colors.hover,
                minWidth: 120,
                fontSize: 15,
              }}
              title="Filter by diet"
            >
              <option value="">All Diets</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="High Protein Vegetarian">High Protein Vegetarian</option>
              <option value="Non Vegeterian">Non Vegeterian</option>
              <option value="No Onion No Garlic (Sattvic)">No Onion No Garlic (Sattvic)</option>
              <option value="High Protein Non Vegetarian">High Protein Non Vegetarian</option>
              <option value="Diabetic Friendly">Diabetic Friendly</option>
              <option value="Eggetarian">Eggetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten Free">Gluten Free</option>
              <option value="Sugar Free Diet">Sugar Free Diet</option>
            </select>
            <button
              style={{
                background: theme.colors.primary,
                color: theme.colors.paper,
                border: 'none',
                borderRadius: 6,
                padding: '6px 16px',
                cursor: 'pointer',
                fontSize: 15,
                minWidth: 100,
              }}
              onClick={fetchSuggestions}
            >
              AI Generate
            </button>
          </div>
          {/* Show only recipe names for Breakfast, Lunch, Dinner */}
          {['Breakfast', 'Lunch', 'Dinner'].map(slot => {
            const s = suggestionByCourse[slot.toLowerCase()];
            // Icon path for each meal slot
            const iconMap = {
              breakfast: '/assets/icons/breakfast.png',
              lunch: '/assets/icons/lunch.png',
              dinner: '/assets/icons/dinner.png',
            };
            const iconSrc = iconMap[slot.toLowerCase()];
            return (
              <div
                key={slot}
                style={{
                  border: `1px solid ${theme.colors.divider}`,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: s ? 'pointer' : 'not-allowed',
                  background: theme.colors.hover,
                  opacity: s ? 1 : 0.5,
                  minHeight: 72,
                  width: '100%',
                  boxSizing: 'border-box',
                  flexWrap: 'wrap',
                  color: theme.colors.text
                }}
                onClick={() => s && handleAISuggestionClick(s)}
              >
                {/* Icon on the left */}
                <img
                  src={iconSrc}
                  alt={slot + ' icon'}
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: 'contain',
                    marginRight: 8,
                    flexShrink: 0,
                    filter: s ? 'none' : 'grayscale(1)',
                  }}
                />
                {/* Recipe info */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minWidth: 0,
                  }}
                >
                  <div style={{ fontWeight: 600, color: theme.colors.text, fontSize: 17, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s ? s.recipe_title : 'No suggestion'}
                  </div>
                  <div style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: 500, marginBottom: 2, minHeight: 16 }}>
                    {s && s.course ? s.course : ''}
                  </div>
                  {/* Ingredient availability */}
                  {s && (
                    <div style={{ fontSize: 13, color: theme.colors.primary, fontWeight: 600 }}>
                      {typeof s.ingredients_available === 'number' && typeof s.ingredients_total === 'number'
                        ? `${s.ingredients_available} / ${s.ingredients_total} ingredients`
                        : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        {/* AI Suggestion Dialog */}
        {aiDialogOpen && selectedAISuggestion && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: '#0008', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div
              style={{
                background: theme.colors.paper,
                borderRadius: 12,
                padding: 0,
                minWidth: 340,
                maxWidth: 540,
                boxShadow: '0 2px 12px #0002',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                color: theme.colors.text
              }}
              tabIndex={0}
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                padding: 32,
                overflowY: 'auto',
                maxHeight: 'calc(90vh - 60px)',
                minHeight: 0,
                flex: 1,
                boxSizing: 'border-box',
              }}>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>{selectedAISuggestion.recipe_title}</div>
                <div style={{ color: theme.colors.textSecondary, fontSize: 15, marginBottom: 8 }}>
                  {selectedAISuggestion.course}
                  {selectedAISuggestion.diet ? <span> &middot; {selectedAISuggestion.diet}</span> : null}
                  {selectedAISuggestion.prep_time ? <span> &middot; {selectedAISuggestion.prep_time}</span> : null}
                </div>
                {selectedAISuggestion.recipe_image && (
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <img
                      src={selectedAISuggestion.recipe_image}
                      alt={selectedAISuggestion.recipe_title}
                      style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, border: `1px solid ${theme.colors.divider}` }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                {selectedAISuggestion.description && (
                  <div style={{ color: theme.colors.textSecondary, fontSize: 14, marginBottom: 12 }}>{selectedAISuggestion.description}</div>
                )}
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Ingredients:</div>
                {selectedAISuggestion.ingredients ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {selectedAISuggestion.ingredients.split('|').filter(i => i.trim()).map((ing, idx) => {
                      const isAvailable = selectedAISuggestion.matched_ingredients?.includes(ing.toLowerCase());
                      const isMissing = selectedAISuggestion.missing_ingredients?.includes(ing.toLowerCase());
                      return (
                        <li key={idx} style={{
                          marginBottom: 4,
                          color: isAvailable ? theme.colors.primary : isMissing ? theme.colors.error : theme.colors.text,
                          fontWeight: isAvailable ? 600 : isMissing ? 600 : 400
                        }}>
                          {ing}
                          {isAvailable && <span style={{ marginLeft: 8, fontSize: 12, color: theme.colors.primary }}>(In Inventory)</span>}
                          {isMissing && <span style={{ marginLeft: 8, fontSize: 12, color: theme.colors.error }}>(Missing)</span>}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div style={{ color: theme.colors.textSecondary, fontSize: 14, marginBottom: 8 }}>No ingredients found for this recipe.</div>
                )}
                {selectedAISuggestion.instructions && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Instructions:</div>
                    <ol style={{ margin: 0, paddingLeft: 18 }}>
                      {selectedAISuggestion.instructions.split('|').map((step, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{step.trim()}</li>
                      ))}
                      </ol>
                  </div>
                )}
                <div style={{ marginTop: 10, fontSize: 14, color: theme.colors.text }}>
                  <b>Ingredients available:</b> {selectedAISuggestion.ingredients_available} / {selectedAISuggestion.ingredients_total}
                </div>
                {selectedAISuggestion.url && (
                  <div style={{ marginTop: 10 }}>
                    <a href={selectedAISuggestion.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.primary, textDecoration: 'underline' }}>
                      View Full Recipe
                    </a>
                  </div>
                  
                )}
              </div>
              <div style={{
                padding: '16px 32px',
                borderTop: `1px solid ${theme.colors.divider}`,
                background: theme.colors.hover,
                textAlign: 'right',
              }}>
                <button
                  style={{ background: theme.colors.hover, color: theme.colors.text, border: 'none', borderRadius: 6, padding: '8px 24px', fontSize: 16, cursor: 'pointer' }}
                  onClick={() => { setAIDialogOpen(false); setSelectedAISuggestion(null); }}
                >Close</button>
              </div>
            </div>
          </div>
        )}
          {!Array.isArray(suggestions) && suggestions && suggestions.error && (
            <div style={{ color: theme.colors.error }}>{suggestions.error}</div>
          )}
          </div>
        </div>
        </div>
        );
}