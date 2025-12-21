const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getFeed,
  addToFeed
} = require('../controllers/feedController');

router.get('/', auth, getFeed);
router.post('/', auth, addToFeed);

module.exports = router;