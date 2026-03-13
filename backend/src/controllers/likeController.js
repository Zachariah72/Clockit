const Like = require('../models/Like');

// Get likes for content
const getLikes = async (req, res) => {
  try {
    const { contentId, contentType } = req.params;
    const likes = await Like.find({ contentId, contentType }).populate('userId', 'username');
    res.json(likes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user liked
const checkLike = async (req, res) => {
  try {
    const { contentId, contentType } = req.params;
    const like = await Like.findOne({ userId: req.user.id, contentId, contentType });
    res.json({ liked: !!like });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle like (Add if not exists, remove if exists)
const toggleLike = async (req, res) => {
  try {
    const { contentId, contentType } = req.body;
    const userId = req.user.id;

    if (!contentId || !contentType) {
      return res.status(400).json({ message: 'Missing contentId or contentType' });
    }

    const existingLike = await Like.findOne({ userId, contentId, contentType });

    if (existingLike) {
      await Like.findOneAndDelete({ userId, contentId, contentType });
      return res.json({ liked: false, message: 'Unliked successfully' });
    } else {
      const newLike = new Like({ userId, contentId, contentType });
      await newLike.save();
      return res.json({ liked: true, message: 'Liked successfully' });
    }
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all likes for the current user
const getUserLikes = async (req, res) => {
  try {
    const likes = await Like.find({ userId: req.user.id });
    res.json(likes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLikes,
  checkLike,
  toggleLike,
  getUserLikes
};