const express = require('express');
const router = express.Router();
const {
  searchTracks,
  getTrackInfo,
  getArtistTopTracks,
  getSimilarTracks,
  getTrendingTracks,
  getAlbumInfo,
  getArtistInfo,
  getArtistTopAlbums,
  getSimilarArtists,
  searchAlbums,
  searchArtists,
  getTopArtists,
  getTopAlbums,
  getTagInfo,
  getTagTopTracks
} = require('../controllers/lastfmController');

// Search tracks
router.get('/search', searchTracks);

// Get track info
router.get('/track/:artist/:track', getTrackInfo);

// Get artist top tracks
router.get('/artist/:artist/top-tracks', getArtistTopTracks);

// Get similar tracks
router.get('/track/:artist/:track/similar', getSimilarTracks);

// Get trending tracks
router.get('/trending', getTrendingTracks);

// Get album info
router.get('/album/:artist/:album', getAlbumInfo);

// Get artist info
router.get('/artist/:artist', getArtistInfo);

// Get artist top albums
router.get('/artist/:artist/albums', getArtistTopAlbums);

// Get similar artists
router.get('/artist/:artist/similar', getSimilarArtists);

// Search albums
router.get('/albums/search', searchAlbums);

// Search artists
router.get('/artists/search', searchArtists);

// Get top artists chart
router.get('/charts/artists', getTopArtists);

// Get top albums chart
router.get('/charts/albums', getTopAlbums);

// Get tag info
router.get('/tag/:tag', getTagInfo);

// Get top tracks for a tag/genre
router.get('/tag/:tag/tracks', getTagTopTracks);

module.exports = router;