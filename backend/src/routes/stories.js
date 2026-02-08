const express = require('express');
const router = express.Router();
const cors = require('cors');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getStories,
  getStoryById,
  createStory,
  deleteStory,
  viewStory,
  getStoryComments,
  toggleLikeStory
} = require('../controllers/storyController');

// Enable CORS for this router
router.use(cors());

// Handle OPTIONS requests for CORS preflight
router.options('/', cors());
router.options('/:id', cors());

// Configure multer for story media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/stories');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.get('/', auth, getStories);
router.get('/:id', auth, getStoryById);
router.post('/', auth, createStory);
router.post('/upload', auth, upload.single('media'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No media file uploaded' });
    }
    console.log('File saved:', req.file.filename);
    console.log('File path:', req.file.path);
    
    // Use the API_URL environment variable or dynamically detect the current URL
    // Check x-forwarded-proto for HTTPS behind Render proxy
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const apiUrl = process.env.API_URL || `${protocol}://${req.get('host')}`;
    const mediaUrl = `${apiUrl}/uploads/stories/${req.file.filename}`;
    console.log('Media URL:', mediaUrl);
    
    res.json({ mediaUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload media', message: error.message });
  }
});
router.delete('/:id', auth, deleteStory);
router.post('/:id/view', auth, viewStory);
router.get('/:id/comments', auth, getStoryComments);
router.post('/:id/like', auth, toggleLikeStory);

module.exports = router;