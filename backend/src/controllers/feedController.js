const Feed = require('../models/Feed');
const Video = require('../models/Video');
const Story = require('../models/Story');

// Get user feed
const getFeed = async (req, res) => {
  try {
    // For now, get all videos and stories, in real app, personalize based on follows, interests, etc.
    const videos = await Video.find({ isDraft: false }).populate('userId', 'username').sort({ createdAt: -1 }).limit(20);
    const stories = await Story.find({ expiresAt: { $gt: new Date() }, isPrivate: false }).populate('userId', 'username').sort({ createdAt: -1 }).limit(20);
    const feed = [...videos, ...stories].sort((a, b) => b.createdAt - a.createdAt);
    res.json(feed);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to feed (perhaps for algorithm, but for now, maybe not needed)
const addToFeed = async (req, res) => {
  try {
    const { contentId, contentType } = req.body;
    const feedItem = new Feed({
      userId: req.user.id,
      contentId,
      contentType
    });
    await feedItem.save();
    res.status(201).json(feedItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFeed,
  addToFeed
};