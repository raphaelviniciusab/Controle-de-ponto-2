const jwt = require('jsonwebtoken');
const db = require('../db.js');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.get('SELECT * FROM "User" WHERE id = ?', [payload.userId]);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
