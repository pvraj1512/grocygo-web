const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', mealPlanController.getAll);
router.get('/weekly', mealPlanController.getWeeklyMealPlans); // New route for weekly meal plans
router.get('/history', mealPlanController.getHistory);
router.post('/', mealPlanController.add);
router.put('/:id', mealPlanController.update);
router.delete('/:id', mealPlanController.remove);

// Add use-ingredients endpoint for ingredient usage
router.post('/use-ingredients', mealPlanController.useIngredients);

module.exports = router;
