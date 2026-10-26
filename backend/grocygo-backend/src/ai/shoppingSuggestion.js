// AI logic for shopping suggestions (Node.js version)
// Ported from FastAPI /shopping-suggestions endpoint

/**
 * Suggest shopping list based on missing ingredients from recipes and inventory
 * @param {Object} reqBody { inventory: string[], recipes: Array<{recipe_title, ingredients: string}> }
 * @returns {Array}
 */

// Synonym map for common ingredient names
const synonymMap = {
  'chili': 'chilli',
  'chillies': 'chilli',
  'green chillies': 'chilli',
  'red chilli powder': 'red chilli powder',
  'coriander (dhania) leaves': 'coriander',
  'coriander powder (dhania)': 'coriander',
  'cumin powder (jeera)': 'cumin',
  'cumin seeds (jeera)': 'cumin',
  'turmeric powder (haldi)': 'turmeric',
  'sunflower oil': 'oil',
  'brown sugar (demerara sugar)': 'brown sugar',
  'whole black peppercorns': 'black pepper',
  'black pepper powder': 'black pepper',
  'potatoes (aloo)': 'potato',
  'green peas (matar)': 'green peas',
  'spinach leaves (palak)': 'spinach',
  'arhar dal (split toor dal)': 'toor dal',
  'whole wheat bread crumbs': 'bread crumbs',
  'whole wheat flour': 'wheat flour',
  'rice flour': 'rice flour',
  'fresh cream': 'cream',
  'milk': 'milk',
  'onion': 'onion',
  'garlic': 'garlic',
  'ginger': 'ginger',
  'salt': 'salt',
  'bread': 'bread',
  'egg': 'egg',
  'chicken': 'chicken',
  'tofu': 'tofu',
  'paneer': 'paneer',
  // Add more as needed
};

function normalizeIngredient(str) {
  let s = (str || '').toLowerCase().trim();
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/[^a-z0-9\s]/g, ''); // remove punctuation
  if (synonymMap[s]) return synonymMap[s];
  return s;
}

function shoppingSuggestion(reqBody) {
  const { inventory = [], recipes = [] } = reqBody;
  const invSet = new Set((inventory || []).map(normalizeIngredient));
  const shoppingDict = {};
  for (const recipe of recipes) {
    const recipeTitle = recipe.recipe_title || recipe.name || '';
    // Accept both 'ingredients' as string (pipe-separated) or array
    let ingredients = [];
    if (Array.isArray(recipe.ingredients)) {
      ingredients = recipe.ingredients.map(normalizeIngredient).filter(Boolean);
    } else if (typeof recipe.ingredients === 'string') {
      ingredients = recipe.ingredients.split('|').map(normalizeIngredient).filter(Boolean);
    } else if (Array.isArray(recipe.items)) {
      ingredients = recipe.items.map(i => normalizeIngredient(i.name)).filter(Boolean);
    }
    // Compute missing ingredients
    const missing = ingredients.filter(i => !invSet.has(i));
    for (const item of missing) {
      if (!item) continue;
      if (!shoppingDict[item]) shoppingDict[item] = [];
      shoppingDict[item].push(recipeTitle);
    }
  }
  // Format output
  return Object.entries(shoppingDict).map(([item, needed_for]) => ({ item, needed_for }));
}

module.exports = shoppingSuggestion;
