const Story = require('../models/Story');
const StoryView = require('../models/StoryView');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

// Get stories for user (own and friends)
const getStories = async (req, res) => {
  try {
    // Get user ID from token - handle both JWT structures
    const userId = req.user?.user?.id || req.user?.id;
    
    // For now, get all stories, but in real app, filter by friends
    const stories = await Story.find({ expiresAt: { $gt: new Date() } }).populate('userId', 'username').sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get story by ID
const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('userId', 'username');
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create story
const createStory = async (req, res) => {
  try {
    const { content, mediaUrl, type, isPrivate } = req.body;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Get user ID from token - handle both JWT structures
    const userId = req.user?.user?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const story = new Story({
      userId,
      caption: content || '',
      mediaUrl,
      contentType: type,
      isPrivate: isPrivate || false,
      expiresAt
    });
    await story.save();
    
    // Update user's stories count
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { $inc: { storiesCount: 1 } });
    
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete story
const deleteStory = async (req, res) => {
  try {
    // Get user ID from token - handle both JWT structures
    const userId = req.user?.user?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.userId.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

    await story.remove();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// View story
const viewStory = async (req, res) => {
  try {
    // Get user ID from token - handle both JWT structures
    const userId = req.user?.user?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    // Check if already viewed
    const existingView = await StoryView.findOne({ storyId: req.params.id, userId });
    if (!existingView) {
      const view = new StoryView({ storyId: req.params.id, userId });
      await view.save();
      await Story.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }
    res.json({ message: 'Viewed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comments for story
const getStoryComments = async (req, res) => {
  try {
    const comments = await Comment.find({ contentId: req.params.id, contentType: 'story' }).populate('userId', 'username');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Like/Unlike story
const toggleLikeStory = async (req, res) => {
  try {
    // Get user ID from token - handle both JWT structures
    const userId = req.user?.user?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const existingLike = await Like.findOne({ userId, contentId: req.params.id, contentType: 'story' });
    if (existingLike) {
      await existingLike.remove();
      res.json({ message: 'Unliked' });
    } else {
      const like = new Like({ userId, contentId: req.params.id, contentType: 'story' });
      await like.save();
      res.json({ message: 'Liked' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStories,
  getStoryById,
  createStory,
  deleteStory,
  viewStory,
  getStoryComments,
  toggleLikeStory
};