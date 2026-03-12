const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { generalLimiter } = require('../middlewares/rateLimiter');
const {
    getFeaturedPodcasts,
    getPodcastCategories,
    searchPodcasts
} = require('../controllers/podcastController');

// All podcast API integration routes require authentication
router.use(auth);

// GET fetch featured podcasts from external API
router.get('/featured', generalLimiter, getFeaturedPodcasts);

// GET fetch podcast categories
router.get('/categories', generalLimiter, getPodcastCategories);

// GET search podcasts via external API
router.get('/search', generalLimiter, searchPodcasts);

module.exports = router;
