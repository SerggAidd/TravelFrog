const { Router } = require('express');
const { authController } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.profile);

module.exports = router;

