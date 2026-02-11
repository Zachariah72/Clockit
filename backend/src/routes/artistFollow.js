const express = require('express');
const router = express.Router();
const { followArtist, unfollowArtist, checkArtistFollow, getFollowedArtists, checkMultipleArtistFollows } = require('../controllers/artistFollowController');
const { authenticateJWT } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateJWT);

// Follow an artist
router.post('/follow', followArtist);

// Unfollow an artist
router.delete('/unfollow/:artistId', unfollowArtist);

// Check if following an artist
router.get('/check/:artistId', checkArtistFollow);

// Check follow status for multiple artists
router.post('/check-multiple', checkMultipleArtistFollows);

// Get all followed artists
router.get('/following', getFollowedArtists);

module.exports = router;
