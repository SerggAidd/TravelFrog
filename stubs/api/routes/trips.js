const { Router } = require('express');
const { tripController } = require('../controllers/tripController');
const { authenticateToken } = require('../middleware/auth');

const router = Router();

router.get('/', tripController.list);
router.get('/:id', tripController.get);
router.post('/', authenticateToken, tripController.create);
router.delete('/:id', authenticateToken, tripController.remove);

module.exports = router;

