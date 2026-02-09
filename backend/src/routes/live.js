const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const {
  startLiveStream,
  endLiveStream,
  getActiveStreams,
  getStreamDetails,
  getUserStreams,
  joinStream,
  leaveStream,
  saveRecording
} = require('../controllers/liveController');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/live-recordings');
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recording-' + uniqueSuffix + '.webm');
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

router.post('/start', auth, startLiveStream);
router.post('/end/:streamId', auth, endLiveStream);
router.get('/active', getActiveStreams);
router.get('/:streamId', getStreamDetails);
router.get('/user/:userId', getUserStreams);
router.post('/:streamId/join', auth, joinStream);
router.post('/:streamId/leave', auth, leaveStream);
router.post('/:streamId/recording', auth, upload.single('video'), saveRecording);

module.exports = router;
