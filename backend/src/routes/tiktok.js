const express = require('express');
const router = express.Router();
const tiktokController = require('../controllers/tiktokController');

// Get trending TikTok videos
router.get('/trending', tiktokController.getTrendingVideos);

// Search TikTok videos
router.get('/search', tiktokController.searchVideos);

// Get video details
router.get('/video/:videoId', tiktokController.getVideo);

module.exports = router;