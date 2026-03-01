const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { generalLimiter } = require('../middlewares/rateLimiter');
const {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrack,
  removeTrack
} = require('../controllers/playlistController');

// All playlist routes require authentication
router.use(auth);

// GET user playlists
router.get('/', generalLimiter, getUserPlaylists);

// POST create playlist
router.post('/', generalLimiter, createPlaylist);

// GET single playlist
router.get('/:id', generalLimiter, getPlaylistById);

// PUT update playlist
router.put('/:id', generalLimiter, updatePlaylist);

// DELETE playlist
router.delete('/:id', generalLimiter, deletePlaylist);

// POST add track to playlist
router.post('/:id/tracks', generalLimiter, addTrack);

// DELETE remove track from playlist
router.delete('/:id/tracks', generalLimiter, removeTrack);

module.exports = router;