const express = require('express');
const createAuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

const { login, logout } = createAuthController();

router.post('/login', login);
router.post('/logout', logout);

// Return current user based on jwt in httpOnly cookie
router.get('/me', authMiddleware, (req, res) => {
	return res.json(req.user || null);
});

module.exports = router;
