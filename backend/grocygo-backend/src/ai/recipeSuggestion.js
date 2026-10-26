// AI logic for recipe suggestions (Node.js version)
// Ported from FastAPI /suggest endpoint
const { getRecipeData, normalizeIngredient } = require('./utils');
const { cosineSimilarity, encodeIngredients } = require('./vectorUtils');

/**
 * Suggest recipes based on inventory, course, and diet
 * @param {Object} reqBody { ingredients: string[], course: string, diet: string }
 * @returns {Promise<Array>}
 */
async function recipeSuggestion(reqBody) {
  const { ingredients = [], course = '', diet = '' } = reqBody;
  const df = await getRecipeData();
  if (!df) throw new Error('Recipe data not loaded');

  // Normalize user's ingredients
  const userIngredients = new Set(ingredients.map(normalizeIngredient));
  const userVec = encodeIngredients([...userIngredients]);

  // Debug logging
  console.log('AI DEBUG: User ingredients:', [...userIngredients]);
  console.log('AI DEBUG: Course filter:', course, 'Diet filter:', diet);

  // Filter by course and diet
  let filtered = df.filter(r =>
    (!course || (r.course || '').toLowerCase().includes(course.toLowerCase())) &&
    (!diet || (r.diet || '').toLowerCase().includes(diet.toLowerCase()))
  );
  if (!filtered.length) filtered = df;

  if (filtered.length > 0) {
    console.log('AI DEBUG: First recipe in filtered:', filtered[0].recipe_title, filtered[0].ingredients);
  } else {
    console.log('AI DEBUG: No recipes after filtering.');
  }

  // Compute vectors for filtered recipes
  const recipeVecs = filtered.map(r => encodeIngredients((r.ingredients || '').split('|').map(normalizeIngredient)));
  const scores = recipeVecs.map(vec => cosineSimilarity(userVec, vec));
  // Get top 5
  const topIndices = scores
    .map((score, idx) => [score, idx])
    .sort((a, b) => b[0] - a[0])
    .slice(0, 5)
    .map(x => x[1]);
  const results = topIndices.map(idx => {
    const r = filtered[idx];
    const recipe_ings = (r.ingredients || '').split('|').map(normalizeIngredient).filter(Boolean);
    const matched = recipe_ings.filter(i => userIngredients.has(i));
    const missing = recipe_ings.filter(i => !userIngredients.has(i));
    // Debug log for each result
    console.log('AI DEBUG: Recipe:', r.recipe_title, 'Matched:', matched, 'Missing:', missing);
    return {
      recipe_title: r.recipe_title,
      ingredients: r.ingredients,
      url: r.url,
      recipe_image: r.recipe_image,
      prep_time: r.prep_time,
      course: r.course,
      diet: r.diet,
      matched_ingredients: matched,
      missing_ingredients: missing,
      description: r.description,
      instructions: r.instructions,
      ingredients_available: matched.length,
      ingredients_total: recipe_ings.length,
      id: `${r.recipe_title}_${idx}`
    };
  });
  return results;
}

module.exports = recipeSuggestion;
