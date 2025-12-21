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

module.exports = {
  getLikes,
  checkLike
};