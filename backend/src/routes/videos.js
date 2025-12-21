const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoComments,
  toggleLikeVideo
} = require('../controllers/videoController');

router.get('/', getVideos);
router.get('/:id', getVideoById);
router.post('/', auth, createVideo);
router.put('/:id', auth, updateVideo);
router.delete('/:id', auth, deleteVideo);
router.get('/:id/comments', getVideoComments);
router.post('/:id/like', auth, toggleLikeVideo);

module.exports = router;