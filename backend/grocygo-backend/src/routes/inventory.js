const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const suggestionController = require('../controllers/suggestionController');
const auth = require('../middleware/auth');


// Suggestions endpoint (no auth required)
router.get('/suggestions', suggestionController.getSuggestions);

router.use(auth);

router.get('/', inventoryController.getAll);
router.post('/', inventoryController.add);
router.put('/:id', inventoryController.update);
router.delete('/:id', inventoryController.remove);
router.post('/use', inventoryController.useIngredients);

module.exports = router;
