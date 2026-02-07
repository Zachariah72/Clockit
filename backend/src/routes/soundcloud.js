const express = require('express');
const router = express.Router();
const { searchTracks, streamTrack, getTrack, getPlaylists, getGenreTracks, getGenres, getCharts, uploadTrack, getUserTracks, deleteUserTrack, streamUserTrack } = require('../controllers/soundcloudController');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a|flac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// Search tracks
router.get('/search', searchTracks);

// Stream track (proxy to avoid CORS)
router.get('/stream/:trackId', streamTrack);

// Get track details
router.get('/track/:trackId', getTrack);

// Get playlists
router.get('/playlists', getPlaylists);

// Get genre tracks
router.get('/genres/:genreId/tracks', getGenreTracks);

// Get available genres
router.get('/genres', getGenres);

// Get chart tracks
router.get('/charts', getCharts);

// Upload track (authenticated)
router.post('/upload', auth, upload.single('audio'), uploadTrack);

// Get user's uploaded tracks (authenticated)
router.get('/user/tracks', auth, getUserTracks);

// Delete user's uploaded track (authenticated)
router.delete('/user/tracks/:trackId', auth, deleteUserTrack);

// Stream user's uploaded track (authenticated)
router.get('/stream/user_:trackId', auth, streamUserTrack);

module.exports = router;