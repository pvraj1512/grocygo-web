const express = require('express');
const router = express.Router();
const mealPlanSuggestion = require('../ai/mealPlanSuggestion');
const recipeSuggestion = require('../ai/recipeSuggestion');
const shoppingSuggestion = require('../ai/shoppingSuggestion');

// POST /api/ai/mealplan-suggestions
router.post('/mealplan-suggestions', async (req, res) => {
  try {
    const result = await mealPlanSuggestion(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/ai/recipe-suggestions
router.post('/recipe-suggestions', async (req, res) => {
  try {
    const result = await recipeSuggestion(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/ai/shopping-suggestions
router.post('/shopping-suggestions', (req, res) => {
  try {
    const result = shoppingSuggestion(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
