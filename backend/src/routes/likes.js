const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getLikes,
  checkLike,
  toggleLike,
  getUserLikes
} = require('../controllers/likeController');

router.get('/user', auth, getUserLikes);
router.get('/:contentId/:contentType', auth, getLikes);
router.get('/check/:contentId/:contentType', auth, checkLike);
router.post('/toggle', auth, toggleLike);

module.exports = router;