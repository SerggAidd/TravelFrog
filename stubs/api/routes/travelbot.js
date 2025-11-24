const { Router } = require('express');
const { travelBotController } = require('../controllers/travelBotController');

const router = Router();

router.post('/ask', travelBotController.ask);
router.post('/rebalance', travelBotController.rebalance);

module.exports = router;

