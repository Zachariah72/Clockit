const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getStories,
  getStoryById,
  createStory,
  deleteStory,
  viewStory,
  getStoryComments,
  toggleLikeStory
} = require('../controllers/storyController');

router.get('/', auth, getStories);
router.get('/:id', auth, getStoryById);
router.post('/', auth, createStory);
router.delete('/:id', auth, deleteStory);
router.post('/:id/view', auth, viewStory);
router.get('/:id/comments', auth, getStoryComments);
router.post('/:id/like', auth, toggleLikeStory);

module.exports = router;