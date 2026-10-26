const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', analyticsController.getAll);
router.get('/inventory-usage', analyticsController.getInventoryUsage);
router.get('/expiry-stats', analyticsController.getExpiryStats);

// New endpoints for category stats and items by category
router.get('/category-stats', analyticsController.getCategoryStats);
router.get('/category/:category/items', analyticsController.getItemsByCategory);

router.get('/shopping-trends', analyticsController.getShoppingTrends);

module.exports = router;
