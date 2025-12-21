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
    const video = new Video({
      userId: req.user.id,
      title,
      description,
      url,
      thumbnail,
      duration,
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