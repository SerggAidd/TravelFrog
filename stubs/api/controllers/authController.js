const jwt = require('jsonwebtoken');
const { userModel } = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/auth');

const buildToken = (user) =>
  jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

const authController = {
  register: async (req, res) => {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Email, пароль и имя обязательны' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Пароль должен содержать минимум 6 символов' });
    }
    try {
      const user = await userModel.register({ email, password, name });
      const token = buildToken(user);
      res.status(201).json({
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email и пароль обязательны' });
    }
    const user = await userModel.login({ email, password });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }
    const token = buildToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  },

  profile: (req, res) => {
    const user = userModel.getById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  },
};

module.exports = { authController };

