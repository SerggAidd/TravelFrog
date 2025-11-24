const { Router } = require('express');
const { currencyController } = require('../controllers/currencyController');

const router = Router();

router.get('/rates', currencyController.rates);
router.get('/convert', currencyController.convert);

module.exports = router;

