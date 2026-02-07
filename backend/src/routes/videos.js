const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const auth = require('../middlewares/auth');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, WebM, and MOV are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

/**
 * Upload a new video
 */
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { title, description, musicTitle, musicAuthor } = req.body;

    // Get user info from auth middleware
    const user = req.user;

    const video = new Video({
      title: title || 'Untitled Video',
      description: description || '',
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnailUrl: null, // Could generate thumbnail from video
      duration: 0, // Would need ffprobe to get duration
      
      author: {
        username: user.username || 'anonymous',
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || null,
        userId: user.id
      },
      
      music: {
        title: musicTitle || 'Original Sound',
        author: musicAuthor || user.username || 'Unknown'
      },
      
      uploadedBy: user.id,
      isPublic: true,
      createdAt: new Date()
    });

    await video.save();

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        author: video.author,
        createdAt: video.createdAt
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      error: 'Failed to upload video',
      message: error.message
    });
  }
});

/**
 * Get all public videos (feed)
 */
router.get('/feed', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const videos = await Video.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    const total = await Video.countDocuments({ isPublic: true });

    res.json({
      videos,
      total,
      hasMore: videos.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      error: 'Failed to fetch videos',
      message: error.message
    });
  }
});

/**
 * Get user's uploaded videos
 */
router.get('/my-videos', auth, async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ videos });
  } catch (error) {
    console.error('Get my videos error:', error);
    res.status(500).json({
      error: 'Failed to fetch videos',
      message: error.message
    });
  }
});

/**
 * Get video by ID
 */
router.get('/:videoId', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    
    if (!video) {
      return res.status(404).json({
        error: 'Video not found',
        message: 'The requested video could not be found'
      });
    }

    // Increment play count
    video.stats.playCount += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      error: 'Failed to fetch video',
      message: error.message
    });
  }
});

/**
 * Like a video
 */
router.post('/:videoId/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    
    if (!video) {
      return res.status(404).json({
        error: 'Video not found'
      });
    }

    video.stats.likeCount += 1;
    await video.save();

    res.json({
      message: 'Video liked',
      likeCount: video.stats.likeCount
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to like video',
      message: error.message
    });
  }
});

/**
 * Delete a video
 */
router.delete('/:videoId', auth, async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.videoId,
      uploadedBy: req.user.id
    });
    
    if (!video) {
      return res.status(404).json({
        error: 'Video not found or unauthorized'
      });
    }

    // Delete the video file
    const videoPath = path.join(__dirname, '../../', video.videoUrl);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    await video.deleteOne();

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete video',
      message: error.message
    });
  }
});

module.exports = router;
