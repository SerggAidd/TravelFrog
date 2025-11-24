const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-budget-compass-secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Токен не найден' });
  }
  const [, token] = authHeader.split(' ');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Токен не найден' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(403).json({ success: false, error: 'Недействительный токен' });
  }
};

module.exports = { authenticateToken, JWT_SECRET };

