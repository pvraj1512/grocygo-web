const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipesController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', recipesController.getAll);
router.post('/', recipesController.add);
router.put('/:id', recipesController.update);
router.delete('/:id', recipesController.remove);

module.exports = router;
