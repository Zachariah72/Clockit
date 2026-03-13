const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { searchLimiter, generalLimiter } = require('../middlewares/rateLimiter');
const {
  recordHistory,
  getHistory,
  searchMusic
} = require('../controllers/musicController');
// Track listening history
router.post('/history', auth, generalLimiter, recordHistory);
router.get('/history', auth, generalLimiter, getHistory);

// Search music aggregator
router.get('/search', auth, searchLimiter, searchMusic);

module.exports = router;
