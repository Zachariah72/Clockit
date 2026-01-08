const Video = require('../models/Video');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

// Get all videos
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate('userId', 'username').sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get video by ID
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('userId', 'username');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create video
const createVideo = async (req, res) => {
  try {
    const { title, description, url, thumbnail, duration, isDraft, duetOf, stitchOf, filters, speed, voiceEffects, captions, hashtags, mentions, autoCaptions } = req.body;

    // Validate duration: max 15 minutes
    if (duration > 15 * 60) {
      return res.status(400).json({ message: 'Video duration cannot exceed 15 minutes' });
    }

    // Create segments for reels
    let segments = [];
    if (duration > 5 * 60) { // If longer than 5 minutes, create segments
      const segmentDuration = Math.min(5 * 60, duration / 3); // Each segment up to 5 min, or divide evenly
      let start = 0;
      while (start < duration) {
        const end = Math.min(start + segmentDuration, duration);
        const segDuration = end - start;
        if (segDuration >= 60) { // Minimum 1 minute
          segments.push({
            start: start,
            end: end,
            duration: segDuration
          });
        }
        start = end;
        if (segments.length >= 3) break; // Max 3 segments
      }
    } else {
      // For shorter videos, single segment
      segments = [{
        start: 0,
        end: duration,
        duration: duration
      }];
    }

    const video = new Video({
      userId: req.user.id,
      title,
      description,
      url,
      thumbnail,
      duration,
      segments,
      isDraft,
      duetOf,
      stitchOf,
      filters,
      speed,
      voiceEffects,
      captions,
      hashtags,
      mentions,
      autoCaptions
    });
    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update video
const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const updates = req.body;
    Object.assign(video, updates);
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    await video.remove();
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comments for video
const getVideoComments = async (req, res) => {
  try {
    const comments = await Comment.find({ contentId: req.params.id, contentType: 'video' }).populate('userId', 'username');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Like/Unlike video
const toggleLikeVideo = async (req, res) => {
  try {
    const existingLike = await Like.findOne({ userId: req.user.id, contentId: req.params.id, contentType: 'video' });
    if (existingLike) {
      await existingLike.remove();
      await Video.findByIdAndUpdate(req.params.id, { $inc: { likes: -1 } });
      res.json({ message: 'Unliked' });
    } else {
      const like = new Like({ userId: req.user.id, contentId: req.params.id, contentType: 'video' });
      await like.save();
      await Video.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
      res.json({ message: 'Liked' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoComments,
  toggleLikeVideo
};