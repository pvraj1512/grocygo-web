import DeleteIcon from '@mui/icons-material/Delete';
import AddRecipeDialog from './AddRecipeDialog';
import { getRecipes, getInventory, addRecipe, deleteRecipe, getSuggestedRecipes } from './api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useEffect, useState, useRef } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

import { auth } from './firebase';
import { useTheme } from './ThemeContext';
import { Card, CardContent, CardMedia, Typography, Grid, Box, Button, Link, TextField, IconButton } from '@mui/material';

// Module-level cache for recipes and inventory
let recipesCache = null;
let inventoryCache = null;

function RecipesPage({ forceOpenDialog }) {
  const theme = useTheme();
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  // In-memory cache for AI suggestions
  const aiSuggestCacheRef = useRef({});
  const [suggestLoading, setSuggestLoading] = useState(false);
  // New: AI filter states, persist in localStorage
  const [aiCourse, setAiCourse] = useState(() => localStorage.getItem('aiCourse') || '');
  const [aiDiet, setAiDiet] = useState(() => localStorage.getItem('aiDiet') || '');
  // Refresh triggers
  const [recipesRefresh, setRecipesRefresh] = useState(0);
  const [suggestRefresh, setSuggestRefresh] = useState(0);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  // Only load data on first mount or when refresh is pressed
  useEffect(() => {
    if (user) {
      setLoading(true);
      // Use cache if available
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
    // eslint-disable-next-line
  }, [user, recipesRefresh]);

  // Only fetch suggestions on first mount, filter change, or refresh
  useEffect(() => {
    setSuggestLoading(true);
    const aiIngredients = inventoryItems.map(i => i?.name || i);
    // Create a cache key based on ingredients, course, and diet
    const cacheKey = JSON.stringify({ aiIngredients, aiCourse, aiDiet });
    if (aiSuggestCacheRef.current[cacheKey]) {
      setSuggestedRecipes(aiSuggestCacheRef.current[cacheKey]);
      setSuggestLoading(false);
    } else {
      getSuggestedRecipes(aiIngredients, aiCourse, aiDiet)
        .then(res => {
          setSuggestedRecipes(res);
          aiSuggestCacheRef.current[cacheKey] = res;
        })
        .catch(() => setSuggestedRecipes([]))
        .finally(() => setSuggestLoading(false));
    }
    // eslint-disable-next-line
  }, [inventoryItems, aiCourse, aiDiet, suggestRefresh]);

  // Persist aiCourse and aiDiet to localStorage when changed
  useEffect(() => {
    localStorage.setItem('aiCourse', aiCourse);
  }, [aiCourse]);
  useEffect(() => {
    localStorage.setItem('aiDiet', aiDiet);
  }, [aiDiet]);

  // Open Add dialog if forced by parent (App)
  useEffect(() => {
    if (forceOpenDialog) setDialogOpen(true);
  }, [forceOpenDialog]);

  const fetchRecipes = async () => {
    try {
      const res = await getRecipes();
      const arr = Array.isArray(res.data) ? res.data.filter(r => r) : [];
      setRecipes(arr);
      recipesCache = arr;
    } catch (e) {
      setRecipes([]);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await getInventory();
      const arr = Array.isArray(res.data) ? res.data.filter(i => i) : [];
      setInventoryItems(arr);
      inventoryCache = arr;
    } catch (e) {
      setInventoryItems([]);
    }
  };

  const handleAddRecipe = async (recipe) => {
    await addRecipe(recipe);
    setDialogOpen(false);
    // Optimistically update cache and state
    setRecipes(prev => {
      const updated = [...prev, recipe];
      recipesCache = updated;
      return updated;
    });
  };

  const handleDelete = async (id) => {
    await deleteRecipe(id);
    setRecipes(prev => {
      const updated = prev.filter(r => r.id !== id);
      recipesCache = updated;
      return updated;
    });
  };

  const handleSaveToMyRecipes = async (recipe) => {
    try {
      // Save all details including image, instructions, prep_time, etc.
      const payload = {
        name: recipe.recipe_title,
        description: recipe.description || '',
        url: recipe.url || '',
        recipe_image: recipe.recipe_image || '',
        prep_time: recipe.prep_time || '',
        course: recipe.course || '',
        diet: recipe.diet || '',
        instructions: recipe.instructions || '',
        items: recipe.ingredients
          ? recipe.ingredients.split('|').map(ing => ({
            name: ing.trim(),
            quantity: '',
            unit: '',
            fromInventory: false,
          }))
          : [],
        recipe: recipe, // Add the full recipe object
      };
      await addRecipe(payload);
      alert('Recipe saved to your recipes!');
    } catch (e) {
      alert('Failed to save recipe.');
    }
  };

  // Bar chart data: recipes per cuisine
  const cuisineData = Object.values(
    recipes.reduce((acc, r) => {
      if (!r) return acc;
      const cuisine = r.cuisine || 'Other';
      acc[cuisine] = acc[cuisine] || { cuisine, count: 0 };
      acc[cuisine].count += 1;
      return acc;
    }, {})
  );

  if (!user) {
    let email, password;
    return (
      <form onSubmit={async e => {
        e.preventDefault();
        await signInWithEmailAndPassword(auth, email.value, password.value);
      }} style={{ maxWidth: 320, margin: '40px auto' }}>
        <TextField label="Email" inputRef={el => email = el} fullWidth margin="normal" />
        <TextField label="Password" type="password" inputRef={el => password = el} fullWidth margin="normal" />
        <Button type="submit" variant="contained" color="primary" fullWidth>Login</Button>
      </form>
    );
  }

  return (
    <Box sx={{ width: '100%', p: { xs: 1, md: 4 } }}>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Typography variant="h4" sx={{ mb: { xs: 1, sm: 0 } }}>Recipes</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                recipesCache = null;
                inventoryCache = null;
                setRecipesRefresh(r => r + 1);
              }}
              size="small"
            >Refresh</Button>
            <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)} size="small">Add Recipe</Button>
          </Box>
        </Grid>
      </Grid>
      <Typography variant="subtitle1" color="theme.color.text" sx={{ mb: 3 }}>
        Save and manage your favorite recipes
      </Typography>
      <Grid container spacing={2}>
        {/* Loading animation for recipes */}
        {loading ? (
          <Grid item xs={12}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 320,
              width: '100vw',
              position: 'relative',
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                minHeight: 320,
                zIndex: 1,
                background: 'transparent'
              }}>
                <Player
                  autoplay
                  loop
                  src="/loading/GlowLoading.json"
                  style={{ height: 120, width: 120 }}
                />
              </Box>
            </Box>
          </Grid>
        ) : (
          Array.isArray(recipes) && recipes.map(recipe => {
            if (!recipe) return null;
            // Parse ingredients string to array for all recipes
            let ingredientsArr = [];
            if (typeof recipe.ingredients === 'string') {
              ingredientsArr = recipe.ingredients.split('|').map(x => x.trim().toLowerCase()).filter(Boolean);
            } else if (Array.isArray(recipe.ingredients)) {
              ingredientsArr = recipe.ingredients.map(x => x?.name ? x.name.trim().toLowerCase() : String(x).trim().toLowerCase()).filter(Boolean);
            }
            let invNames = Array.isArray(inventoryItems)
              ? inventoryItems.map(x => (x?.name || '').toLowerCase())
              : [];
            let matched = ingredientsArr.filter(ing => invNames.includes(ing));
            let missing = ingredientsArr.filter(ing => !invNames.includes(ing));
            return (
              <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'stretch' },
                    mb: 2,
                    borderRadius: 3,
                    boxShadow: 2,
                    overflow: 'hidden',
                    background: theme.colors.paper,
                    height: '100%',
                  }}
                >
                  {/* Left: Image */}
                  <Box
                    sx={{
                      width: { xs: '100%', sm: 140, md: 180 },
                      minHeight: { xs: 140, sm: '100%' },
                      aspectRatio: '1',
                      background: '#f8f8f8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: { sm: '1px solid #eee', xs: 'none' },
                      borderBottom: { xs: '1px solid #eee', sm: 'none' },
                      flexShrink: 0,
                      overflow: 'hidden',
                      height: 'auto',
                    }}
                  >
                    {recipe.recipe_image ? (
                      <img
                        src={recipe.recipe_image}
                        alt={recipe.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          aspectRatio: '1',
                        }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <Box sx={{
                        width: '100%',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#bbb',
                        fontSize: 32,
                      }}>No Image</Box>
                    )}
                  </Box>
                  {/* Right: Details */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minWidth: 0, overflow: 'hidden', color: theme.colors.text }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {/* Show recipe name as clickable link if url exists */}
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, minHeight: 32, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {recipe.url ? (
                          <a href={recipe.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.primary, textDecoration: 'underline' }}>
                            {recipe.name}
                          </a>
                        ) : recipe.name}
                      </Typography>
                      <IconButton onClick={() => {
                        console.log('Attempting to delete recipe with ID:', recipe.id);
                        handleDelete(recipe.id);
                      }} size="small">
                        <DeleteIcon sx={{ color: theme.colors.text }} />
                      </IconButton>
                    </Box>
                    <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {recipe.course && <Typography variant="caption" color="primary" sx={{ mr: 1, fontWeight: 600, bgcolor: '#e3f2fd', px: 1, borderRadius: 1 }}>Course: {recipe.course}</Typography>}
                      {recipe.diet && <Typography variant="caption" color="secondary" sx={{ fontWeight: 600, bgcolor: '#fce4ec', px: 1, borderRadius: 1 }}>Diet: {recipe.diet}</Typography>}
                    </Box>
                    {recipe.ingredients && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'inline', mr: 1 }}>Ingredients:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                          {ingredientsArr.map((ing, idx) => (
                            <Box key={idx} sx={{ fontSize: 13, bgcolor: theme.colors.hover, px: 1, borderRadius: 1, mr: 0.5 }}>
                              {ing}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                    <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 2, color: theme.colors.text }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', display: 'flex', alignItems: 'center', color: theme.colors.text }}>
                          <span role="img" aria-label="check" style={{ marginRight: 4 }}>✔️</span>
                          You have ({matched.length}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {matched.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">None</Typography>
                          ) : matched.map((ing, idx) => (
                            <Box key={idx} sx={{ bgcolor: 'success.light', color: 'success.dark', px: 1, borderRadius: 1, fontSize: 12, whiteSpace: 'nowrap', color: theme.colors.text }}>{ing}</Box>
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main', display: 'flex', alignItems: 'center', color: theme.colors.text }}>
                          <span role="img" aria-label="cross" style={{ marginRight: 4 }}>❌</span>
                          Need to buy ({missing.length}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {missing.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">None</Typography>
                          ) : missing.map((ing, idx) => (
                            <Box key={idx} sx={{ bgcolor: 'error.light', color: 'error.dark', px: 1, borderRadius: 1, fontSize: 12, whiteSpace: 'nowrap', color: theme.colors.text }}>{ing}</Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Recipes per Cuisine</Typography>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={Object.values(
            recipes.reduce((acc, r) => {
              if (!r) return acc;
              const cuisine = r.cuisine || 'Other';
              acc[cuisine] = acc[cuisine] || { cuisine, count: 0 };
              acc[cuisine].count += 1;
              return acc;
            }, {})
          )}>
            <XAxis dataKey="cuisine" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#4caf50" name="Recipes" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <AddRecipeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleAddRecipe}
        inventoryItems={inventoryItems}
      />
      {/* AI Recipe Filters */}
      <Box
        sx={{
          mt: 4,
          mb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h4" sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}>Suggested Recipes (AI)</Typography>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 }, minWidth: 120 }}
          onClick={() => {
            aiSuggestCacheRef.current = {};
            setSuggestRefresh(r => r + 1);
          }}
        >Refresh</Button>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, flex: 1 }}>
          <select
            value={aiCourse}
            onChange={e => setAiCourse(e.target.value)}
            style={{
              marginRight: 0,
              width: '100%',
              maxWidth: 220,
              minWidth: 120,
              padding: 8,
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            <option value="">All Courses</option>
            {['Dinner', 'Lunch', 'Side Dish', 'South Indian Breakfast', 'Snack', 'Dessert', 'Appetizer', 'Main Course', 'World Breakfast', 'Indian Breakfast', 'North Indian Breakfast', 'One Pot Dish', 'Brunch'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select
            value={aiDiet}
            onChange={e => setAiDiet(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 220,
              minWidth: 120,
              padding: 8,
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            <option value="">All Diets</option>
            {['Vegetarian', 'High Protein Vegetarian', 'Non Vegeterian', 'No Onion No Garlic (Sattvic)', 'High Protein Non Vegetarian', 'Diabetic Friendly', 'Eggetarian', 'Vegan', 'Gluten Free', 'Sugar Free Diet'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </Box>
      </Box>
      <Box>
        {suggestLoading ? (
          <Typography>Loading suggestions...</Typography>
        ) : (() => {
          // Defensive: always treat suggestedRecipes as array, fallback to []
          let safeRecipes = Array.isArray(suggestedRecipes) ? suggestedRecipes : [];
          if (!Array.isArray(suggestedRecipes) && suggestedRecipes && typeof suggestedRecipes === 'object' && suggestedRecipes.error) {
            // If backend returned error object
            return <Typography color="error">{suggestedRecipes.error}</Typography>;
          }
          if (safeRecipes.length === 0) {
            return <Typography>No suggestions found.</Typography>;
          }
          // List view: image left, details right, vertical stack
          return (
            <Grid container spacing={2}>
              {safeRecipes.map((r, i) => {
                if (!r) return null;
                // Parse ingredients string to array
                let ingredientsArr = [];
                if (typeof r.ingredients === 'string') {
                  ingredientsArr = r.ingredients.split('|').map(x => x.trim().toLowerCase()).filter(Boolean);
                } else if (Array.isArray(r.ingredients)) {
                  ingredientsArr = r.ingredients.map(x => x?.name ? x.name.trim().toLowerCase() : String(x).trim().toLowerCase()).filter(Boolean);
                }
                let matched = Array.isArray(r.matched_ingredients) ? r.matched_ingredients : [];
                let missing = Array.isArray(r.missing_ingredients) ? r.missing_ingredients : [];
                if ((!matched.length && !missing.length) && Array.isArray(ingredientsArr) && Array.isArray(inventoryItems) && inventoryItems.length > 0) {
                  const invNames = inventoryItems.map(x => (x?.name || '').toLowerCase());
                  matched = ingredientsArr.filter(ing => invNames.includes(ing.toLowerCase()));
                  missing = ingredientsArr.filter(ing => !invNames.includes(ing.toLowerCase()));
                }
                return (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'stretch' },
                        mb: 2,
                        borderRadius: 3,
                        boxShadow: 2,
                        overflow: 'hidden',
                        background: theme.colors.paper,
                        height: '100%',
                      }}
                    >
                      {/* Left: Image */}
                      <Box
                        sx={{
                          width: { xs: '100%', sm: 140, md: 395 },
                          minHeight: { xs: 140, sm: '100%' },
                          aspectRatio: '1',
                          background: '#f8f8f8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRight: { sm: '1px solid #eee', xs: 'none' },
                          borderBottom: { xs: '1px solid #eee', sm: 'none' },
                          flexShrink: 0,
                          overflow: 'hidden',
                          height: 'auto',
                        }}
                      >
                        {r.recipe_image ? (
                          <img
                            src={r.recipe_image}
                            alt={r.recipe_title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              aspectRatio: '1',
                            }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Box sx={{
                            width: '100%',
                            aspectRatio: '1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#bbb',
                            fontSize: 32,
                          }}>No Image</Box>
                        )}
                      </Box>
                      {/* Right: Details */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minWidth: 0, overflow: 'hidden', color: theme.colors.text }}>
                        {/* Recipe title as clickable link if url exists */}
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18, minHeight: 32, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.url ? (
                            <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.primary, textDecoration: 'underline' }}>
                              {r.recipe_title}
                            </a>
                          ) : r.recipe_title}
                        </Typography>
                        <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {r.course && <Typography variant="caption" color="primary" sx={{ mr: 1, fontWeight: 600, bgcolor: '#e3f2fd', px: 1, borderRadius: 1 }}>Course: {r.course}</Typography>}
                          {r.diet && <Typography variant="caption" color="secondary" sx={{ fontWeight: 600, bgcolor: '#fce4ec', px: 1, borderRadius: 1 }}>Diet: {r.diet}</Typography>}
                        </Box>
                        <Typography variant="body2" color="theme.color.text" sx={{ mb: 1 }}>
                          <b>Prep time:</b> {r.prep_time}
                        </Typography>
                        {r.ingredients && typeof r.ingredients === 'string' && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'inline', mr: 1 }}>Ingredients:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                              {r.ingredients.split('|').map((ing, idx) => (
                                <Box key={idx} sx={{ fontSize: 13, bgcolor: theme.colors.hover, px: 1, borderRadius: 1, mr: 0.5 }}>{ing.trim()}</Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                        {r.ingredients && Array.isArray(r.ingredients) && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'inline', mr: 1 }}>Ingredients:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                              {r.ingredients.map((ing, idx) => (
                                <Box key={idx} sx={{ fontSize: 13, bgcolor: theme.colors.hover, px: 1, borderRadius: 1, mr: 0.5 }}>
                                  {ing?.name ? ing.name.trim() : String(ing).trim()}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                        <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 2, color: theme.colors.text }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', display: 'flex', alignItems: 'center', color: theme.colors.text }}>
                              <span role="img" aria-label="check" style={{ marginRight: 4 }}>✔️</span>
                              You have ({matched.length}):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {matched.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">None</Typography>
                              ) : matched.map((ing, idx) => (
                                <Box key={idx} sx={{ bgcolor: 'success.light', color: 'success.dark', px: 1, borderRadius: 1, fontSize: 12, whiteSpace: 'nowrap', color: theme.colors.text }}>{ing}</Box>
                              ))}
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main', display: 'flex', alignItems: 'center', color: theme.colors.text }}>
                              <span role="img" aria-label="cross" style={{ marginRight: 4 }}>❌</span>
                              Need to buy ({missing.length}):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {missing.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">None</Typography>
                              ) : missing.map((ing, idx) => (
                                <Box key={idx} sx={{ bgcolor: 'error.light', color: 'error.dark', px: 1, borderRadius: 1, fontSize: 12, whiteSpace: 'nowrap', color: theme.colors.text }}>{ing}</Box>
                              ))}
                            </Box>
                          </Box>
                        </Box>
                        <Box sx={{ mt: 'auto', display: 'flex' }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            sx={{ fontWeight: 600, fontSize: 15, borderRadius: 2 }}
                            onClick={() => handleSaveToMyRecipes(r)}
                          >
                            Save to My Recipes
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          );
        })()}
      </Box>
    </Box>
  );
}

export default RecipesPage;