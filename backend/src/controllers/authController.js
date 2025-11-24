const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db.js');

function createAuthController(options = {}) {
  const findUserByEmail = options.findUserByEmail || (async (email) => {
    return db.getUserByEmail(email);
  });

  async function login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });

    return res.json({ message: 'ok' });
  }

  function logout(req, res) {
    res.clearCookie('token');
    return res.json({ message: 'logged out' });
  }

  return { login, logout };
}

module.exports = createAuthController;
