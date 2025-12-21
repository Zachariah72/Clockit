const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middlewares/auth');

// All profile routes require authentication
router.use(auth);

// Profile management
router.get('/:userId?', profileController.getProfile);
router.put('/', profileController.updateProfile);

// Social features
router.get('/:userId/followers', profileController.getFollowers);
router.get('/:userId/following', profileController.getFollowing);
router.post('/:userId/follow', profileController.toggleFollow);

// Content features
router.get('/:userId/stories', profileController.getStories);
router.get('/:userId/reels', profileController.getReels);
router.get('/saved', profileController.getSavedContent);
router.post('/save', profileController.toggleSaveContent);
router.get('/drafts', profileController.getDrafts);

// Music sharing
router.post('/share-music', profileController.shareMusic);

module.exports = router;