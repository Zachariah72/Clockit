const express = require('express');
const router = express.Router();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const profileController = require('../controllers/profileController');
const auth = require('../middlewares/auth');

// Enable CORS for this router
router.use(cors());

// Handle OPTIONS requests for CORS preflight
router.options('/', cors());
router.options('/stories', cors());

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// ============================================
// PUBLIC ROUTES (no auth needed) - specific routes FIRST
// ============================================

// Specific public routes - MUST come before parameterized routes
router.get('/reels', profileController.getReels);
router.get('/saved', profileController.getSavedContent);
router.get('/drafts', profileController.getDrafts);

// Base profile - requires auth for own profile
router.get('/', auth, profileController.getProfile);
router.get('/:userId', profileController.getProfile);

// Stories, Followers, Following - require auth for own profile
router.get('/stories', auth, profileController.getStories);
router.get('/followers', auth, profileController.getFollowers);
router.get('/following', auth, profileController.getFollowing);

// Public social routes with userId (specific paths)
router.get('/:userId/followers', profileController.getFollowers);
router.get('/:userId/following', profileController.getFollowing);
router.get('/:userId/stories', profileController.getStories);
router.get('/:userId/reels', profileController.getReels);

// ============================================
// AUTHENTICATED ROUTES (auth middleware)
// ============================================
router.use(auth);

// Profile management
router.put('/', profileController.updateProfile);

// Avatar upload endpoint
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);

// Error handler for multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

// Social features (authenticated)
router.post('/:userId/follow', profileController.toggleFollow);

// Content features (authenticated)
router.post('/save', profileController.toggleSaveContent);

// Music sharing
router.post('/share-music', profileController.shareMusic);

module.exports = router;
