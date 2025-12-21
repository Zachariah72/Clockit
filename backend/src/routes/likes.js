const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getLikes,
  checkLike
} = require('../controllers/likeController');

router.get('/:contentId/:contentType', auth, getLikes);
router.get('/check/:contentId/:contentType', auth, checkLike);

module.exports = router;