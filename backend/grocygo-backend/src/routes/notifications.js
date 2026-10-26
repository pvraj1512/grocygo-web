const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', notificationController.getAll);
router.post('/', notificationController.add);
// router.put('/:id/read', notificationController.markRead); // <-- Commented out, not implemented
router.delete('/:id', notificationController.remove);

module.exports = router;
