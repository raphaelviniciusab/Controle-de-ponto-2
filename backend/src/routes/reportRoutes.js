const express = require('express');
const { csvReport } = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

router.get('/csv', authMiddleware, adminMiddleware, csvReport);

module.exports = router;
