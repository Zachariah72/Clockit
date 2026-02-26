const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  recordHistory,
  getHistory,
  searchMusic
} = require('../controllers/musicController');

router.post('/history', auth, recordHistory);
router.get('/history', auth, getHistory);
router.get('/search', auth, searchMusic);

module.exports = router;
