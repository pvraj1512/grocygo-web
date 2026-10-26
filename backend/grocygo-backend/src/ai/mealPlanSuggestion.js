// AI logic for meal plan suggestions (Node.js version)
// This is a direct port of the FastAPI /mealplan-suggestions logic
const { getRecipeData, normalizeIngredient } = require('./utils');

/**
 * Suggest meal plans based on inventory and diet
 * @param {Object} reqBody { inventory: string[], diet: string, course: string }
 * @returns {Promise<Array>}
 */
async function mealPlanSuggestion(reqBody) {
  const { inventory = [], diet = '', course = '' } = reqBody;
  const df = await getRecipeData();
  if (!df) throw new Error('Recipe data not loaded');

  // Normalize inventory
  const invSet = new Set(inventory.map(normalizeIngredient));
  const suggestions = [];
  const courseList = course ? [course] : ['Breakfast', 'Lunch', 'Dinner'];

  for (const c of courseList) {
    // Filter by course and diet
    let filtered = df.filter(r =>
      (!c || (r.course || '').toLowerCase().includes(c.toLowerCase())) &&
      (!diet || (r.diet || '').toLowerCase().includes(diet.toLowerCase()))
    );
    if (!filtered.length) continue;
    // Compute available/missing ingredients
    filtered.forEach(r => {
      r._norm_ingredients = (r.ingredients || '').split('|').map(normalizeIngredient).filter(Boolean);
      r._available = r._norm_ingredients.filter(i => invSet.has(i));
      r._missing = r._norm_ingredients.filter(i => !invSet.has(i));
      r._ratio = r._available.length / (r._norm_ingredients.length || 1);
    });
    // Sort by ratio
    filtered.sort((a, b) => b._ratio - a._ratio);
    const best = filtered[0];
    if (!best) continue;
    suggestions.push({
      recipe_title: best.recipe_title,
      ingredients: best.ingredients,
      url: best.url,
      recipe_image: best.recipe_image,
      prep_time: best.prep_time,
      course: best.course,
      diet: best.diet,
      matched_ingredients: best._available,
      missing_ingredients: best._missing,
      description: best.description,
      instructions: best.instructions,
      ingredients_available: best._available.length,
      ingredients_total: best._norm_ingredients.length,
      id: `${best.recipe_title}_${c}`
    });
  }
  return suggestions;
}

module.exports = mealPlanSuggestion;
