const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middlewares/auth');

// Profile viewing (public)
router.get('/:userId?', profileController.getProfile);
router.get('/:userId/followers', profileController.getFollowers);
router.get('/:userId/following', profileController.getFollowing);

// Authenticated routes
router.use(auth);

// Profile management (requires auth)
router.put('/', profileController.updateProfile);

// Social features (requires auth)
router.get('/followers', profileController.getFollowers);
router.get('/following', profileController.getFollowing);
router.post('/:userId/follow', profileController.toggleFollow);

// Content features
router.get('/stories', profileController.getStories);
router.get('/:userId/stories', profileController.getStories);
router.get('/reels', profileController.getReels);
router.get('/:userId/reels', profileController.getReels);
router.get('/saved', profileController.getSavedContent);
router.post('/save', profileController.toggleSaveContent);
router.get('/drafts', profileController.getDrafts);

// Music sharing
router.post('/share-music', profileController.shareMusic);

module.exports = router;