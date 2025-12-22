const express = require('express');
const router = express.Router();
const {
  getSpotifyAuthUrl,
  handleSpotifyCallback,
  refreshSpotifyToken,
  searchTracks,
  getUserPlaylists,
  getPlaylistTracks,
  getTopTracks,
  getCurrentlyPlaying,
  controlPlayback
} = require('../controllers/spotifyController');

// Get Spotify authorization URL
router.get('/auth-url', getSpotifyAuthUrl);

// Handle Spotify OAuth callback
router.get('/callback', handleSpotifyCallback);

// Refresh Spotify access token
router.post('/refresh-token', refreshSpotifyToken);

// Search tracks
router.post('/search', searchTracks);

// Get user playlists
router.post('/playlists', getUserPlaylists);

// Get playlist tracks
router.post('/playlists/:playlistId/tracks', getPlaylistTracks);

// Get user's top tracks
router.post('/top-tracks', getTopTracks);

// Get currently playing track
router.post('/currently-playing', getCurrentlyPlaying);

// Control playback
router.post('/playback', controlPlayback);

module.exports = router;