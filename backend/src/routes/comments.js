const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleLikeComment
} = require('../controllers/commentController');

router.post('/', auth, createComment);
router.get('/:contentId/:contentType', auth, getComments);
router.put('/:id', auth, updateComment);
router.delete('/:id', auth, deleteComment);
router.post('/:id/like', auth, toggleLikeComment);

module.exports = router;