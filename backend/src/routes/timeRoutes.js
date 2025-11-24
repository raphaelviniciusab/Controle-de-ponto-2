const express = require('express');
const { clockIn, history } = require('../controllers/timeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/clock-in', authMiddleware, clockIn);
router.get('/history', authMiddleware, history);

module.exports = router;
