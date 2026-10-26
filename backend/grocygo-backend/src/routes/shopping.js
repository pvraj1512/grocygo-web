const express = require('express');
const router = express.Router();
const shoppingController = require('../controllers/shoppingController');
const suggestionController = require('../controllers/suggestionController');
const auth = require('../middleware/auth');



router.use(auth);
// Smart AI Suggestions endpoint (auth required)
router.get('/suggestions', shoppingController.getSuggestions);

router.get('/', shoppingController.getAll);
router.post('/', shoppingController.add);
router.put('/:id', shoppingController.update);
router.delete('/:id', shoppingController.remove);

module.exports = router;
